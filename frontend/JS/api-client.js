const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://your-api-domain.com/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token'); // fallback only; real auth uses a live Firebase ID token
  }

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }

  getToken() { return this.token || localStorage.getItem('token'); }

  // Firebase ID tokens expire after ~1hr. Always pull a fresh one from the
  // SDK (it caches internally and only hits the network to refresh when
  // needed) rather than trusting whatever was stored earlier.
  async getFreshToken() {
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
      try {
        const token = await firebase.auth().currentUser.getIdToken();
        this.setToken(token);
        return token;
      } catch (error) {
        return this.getToken();
      }
    }
    return this.getToken();
  }

  async getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = await this.getFreshToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders();
    const config = { ...options, headers: { ...headers, ...options.headers } };
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) { this.setToken(null); window.dispatchEvent(new CustomEvent('auth:expired')); }
        throw new Error(data.message || `Request failed: ${response.status}`);
      }
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) throw new Error(i18n.t('networkError'));
      throw error;
    }
  }

  // NOTE: actual sign-up/sign-in (email+password or Google) happens
  // client-side via the Firebase Auth SDK - see auth.js. These two just
  // sync the resulting Firebase identity with our Firestore user profile,
  // authenticated by the ID token getHeaders() attaches automatically.
  async register({ displayName, language } = {}) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify({ displayName, language }) });
  }
  async login() { return this.request('/auth/login', { method: 'POST' }); }
  async getMe() { return this.request('/auth/me'); }
  async updateProfile(data) { return this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }); }
  async logout() { this.setToken(null); return { success: true }; }

  async sendMessage(message, conversationId, language) { return this.request('/chat/message', { method: 'POST', body: JSON.stringify({ message, conversationId, language }) }); }
  async getConversations(limit = 20) { return this.request(`/chat/conversations?limit=${limit}`); }
  async getMessages(conversationId) { return this.request(`/chat/conversations/${conversationId}/messages`); }
  async deleteConversation(conversationId) { return this.request(`/chat/conversations/${conversationId}`, { method: 'DELETE' }); }

  async uploadFile(file, conversationId, description) {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) formData.append('conversationId', conversationId);
    if (description) formData.append('description', description);
    const token = await this.getFreshToken();
    const response = await fetch(`${this.baseURL}/files/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
    return response.json();
  }
  async getFiles(limit = 20) { return this.request(`/files?limit=${limit}`); }
  async deleteFile(fileId) { return this.request(`/files/${fileId}`, { method: 'DELETE' }); }

  async webSearch(query, numResults = 10, language) { return this.request('/search/web', { method: 'POST', body: JSON.stringify({ query, numResults, language }) }); }

  async saveMemory(key, value, type, importance) { return this.request('/memory', { method: 'POST', body: JSON.stringify({ key, value, type, importance }) }); }
  async getMemories() { return this.request('/memory'); }
  async deleteMemory(key) { return this.request(`/memory/${key}`, { method: 'DELETE' }); }
}

const api = new ApiClient();
