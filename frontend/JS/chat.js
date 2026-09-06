class ChatManager {
  constructor() { this.currentConversationId = null; this.messages = []; this.isLoading = false; }

  async init() { await this.loadConversations(); this.setupEventListeners(); }

  setupEventListeners() {
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');

    messageInput?.addEventListener('input', () => { sendBtn.disabled = messageInput.value.trim() === ''; this.autoResizeTextarea(messageInput); });
    messageInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); } });
    sendBtn?.addEventListener('click', () => this.sendMessage());
    newChatBtn?.addEventListener('click', () => this.startNewChat());

    document.querySelectorAll('.quick-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        if (prompt) { messageInput.value = prompt; sendBtn.disabled = false; messageInput.focus(); }
      });
    });
  }

  autoResizeTextarea(textarea) { textarea.style.height = 'auto'; textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'; }

  async loadConversations() {
    try {
      const response = await api.getConversations();
      if (response.success) this.renderConversations(response.data.conversations);
    } catch (error) { console.error('Failed to load conversations:', error); }
  }

  renderConversations(conversations) {
    const list = document.getElementById('conversations-list');
    if (!list) return;
    if (conversations.length === 0) { list.innerHTML = `<div class="no-conversations">${i18n.t('noConversations')}</div>`; return; }
    list.innerHTML = conversations.map(conv => `
      <div class="conversation-item ${conv.id === this.currentConversationId ? 'active' : ''}" data-id="${conv.id}">
        <span class="conv-icon">💬</span>
        <span class="conv-title">${this.escapeHtml(conv.title)}</span>
        <span class="conv-time">${this.formatTime(conv.updatedAt)}</span>
      </div>
    `).join('');
    list.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => { const id = item.getAttribute('data-id'); this.loadConversation(id); });
    });
  }

  async loadConversation(conversationId) {
    try {
      const response = await api.getMessages(conversationId);
      if (response.success) {
        this.currentConversationId = conversationId;
        this.messages = response.data.messages;
        document.getElementById('chat-title').textContent = response.data.conversation.title;
        this.renderMessages();
        this.highlightConversation(conversationId);
      }
    } catch (error) { showToast(error.message, 'error'); }
  }

  highlightConversation(conversationId) {
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-id') === conversationId);
    });
  }

  startNewChat() {
    this.currentConversationId = null;
    this.messages = [];
    document.getElementById('chat-title').textContent = 'New Conversation';
    this.renderMessages();
    document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('active'));
  }

  async sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (!message || this.isLoading) return;

    this.addMessageToUI('user', message);
    input.value = ''; input.style.height = 'auto';
    document.getElementById('send-btn').disabled = true;
    this.showTypingIndicator();

    try {
      const response = await api.sendMessage(message, this.currentConversationId, i18n.getCurrentLanguage());
      this.hideTypingIndicator();
      if (response.success) {
        this.currentConversationId = response.data.conversationId;
        this.addMessageToUI('assistant', response.data.message.content);
        await this.loadConversations();
      }
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessageToUI('assistant', `Error: ${error.message}`, true);
      showToast(error.message, 'error');
    }
  }

  addMessageToUI(role, content, isError = false) {
    const container = document.getElementById('messages-container');
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) welcomeMessage.style.display = 'none';

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    const avatar = role === 'user' ? '👤' : '🤖';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div>
        <div class="message-content ${isError ? 'error' : ''}">${this.formatMessage(content)}</div>
        <div class="message-time">${time}</div>
      </div>
    `;
    container.appendChild(messageDiv);
    this.scrollToBottom();
  }

  formatMessage(content) {
    let formatted = this.escapeHtml(content);
    formatted = formatted.replace(/```(\w+)?
([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    formatted = formatted.replace(/
/g, '<br>');
    return formatted;
  }

  escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

  showTypingIndicator() {
    const container = document.getElementById('messages-container');
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator'; indicator.className = 'message assistant';
    indicator.innerHTML = `<div class="message-avatar">🤖</div><div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    container.appendChild(indicator); this.scrollToBottom();
  }

  hideTypingIndicator() { const indicator = document.getElementById('typing-indicator'); if (indicator) indicator.remove(); }

  scrollToBottom() { const container = document.getElementById('messages-container'); if (container) container.scrollTop = container.scrollHeight; }

  renderMessages() {
    const container = document.getElementById('messages-container');
    const welcomeMessage = document.getElementById('welcome-message');
    if (this.messages.length === 0) { if (welcomeMessage) welcomeMessage.style.display = 'block'; container.innerHTML = ''; container.appendChild(welcomeMessage); return; }
    if (welcomeMessage) welcomeMessage.style.display = 'none';
    container.innerHTML = this.messages.map(msg => `
      <div class="message ${msg.role}">
        <div class="message-avatar">${msg.role === 'user' ? '👤' : '🤖'}</div>
        <div><div class="message-content">${this.formatMessage(msg.content)}</div><div class="message-time">${this.formatTime(msg.createdAt)}</div></div>
      </div>
    `).join('');
    this.scrollToBottom();
  }

  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }
}

const chat = new ChatManager();