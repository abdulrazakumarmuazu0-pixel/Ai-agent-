class AuthManager {
  constructor() {
    this.user = null;             // Firestore profile (role, plan, prefs...)
    this.firebaseUser = null;     // Firebase Auth user (uid, email, getIdToken)
    this.isAuthenticated = false;
  }

  // Called once on page load. Firebase restores the previous session (if
  // any) asynchronously, so we wait for the first onAuthStateChanged tick
  // before deciding whether to show the auth screen or the app.
  async init() {
    return new Promise((resolve) => {
      firebase.auth().onAuthStateChanged(async (fbUser) => {
        if (!fbUser) {
          this.showAuthScreen();
          resolve(false);
          return;
        }

        this.firebaseUser = fbUser;
        try {
          await this._syncAfterAuth('login'); // fetch existing profile
          resolve(true);
        } catch (error) {
          // No Firestore profile yet (e.g. account created but the
          // register sync never completed) - create it now.
          try {
            await this._syncAfterAuth('register', { displayName: fbUser.displayName });
            resolve(true);
          } catch (e2) {
            this.showAuthScreen();
            resolve(false);
          }
        }
      });
    });
  }

  // Verifies the current Firebase user with the backend and stores the
  // resulting Firestore profile. mode is 'register' (create-if-missing)
  // or 'login' (must already exist).
  async _syncAfterAuth(mode, extra = {}) {
    const idToken = await this.firebaseUser.getIdToken();
    api.setToken(idToken);
    const response = mode === 'register'
      ? await api.register(extra)
      : await api.login();
    if (response.success) {
      this.user = response.data.user;
      this.isAuthenticated = true;
      this.updateUI();
    }
    return response;
  }

  async login(email, password) {
    try {
      const cred = await firebase.auth().signInWithEmailAndPassword(email, password);
      this.firebaseUser = cred.user;
      await this._syncAfterAuth('login');
      return { success: true };
    } catch (error) {
      return { success: false, error: this._friendlyError(error) };
    }
  }

  async register(email, password, displayName, language) {
    try {
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
      this.firebaseUser = cred.user;
      if (displayName) await cred.user.updateProfile({ displayName });
      await this._syncAfterAuth('register', { displayName, language });
      return { success: true };
    } catch (error) {
      return { success: false, error: this._friendlyError(error) };
    }
  }

  async loginWithGoogle() {
    try {
      const result = await firebase.auth().signInWithPopup(googleProvider);
      this.firebaseUser = result.user;
      const isNewUser = result.additionalUserInfo?.isNewUser;
      await this._syncAfterAuth(isNewUser ? 'register' : 'login', {
        displayName: result.user.displayName
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: this._friendlyError(error) };
    }
  }

  logout() {
    firebase.auth().signOut();
    api.setToken(null);
    this.user = null;
    this.firebaseUser = null;
    this.isAuthenticated = false;
    this.showAuthScreen();
    window.location.reload();
  }

  _friendlyError(error) {
    const map = {
      'auth/email-already-in-use': 'That email is already registered. Try logging in instead.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-not-found': 'No account found with that email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Incorrect email or password.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
      'auth/network-request-failed': 'Network error. Please check your connection.'
    };
    return map[error.code] || error.message;
  }

  updateUI() {
    if (!this.user) return;
    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    const userPlanEl = document.getElementById('user-plan');
    if (userNameEl) userNameEl.textContent = this.user.displayName || this.user.email;
    if (userAvatarEl) userAvatarEl.textContent = (this.user.displayName || this.user.email)?.[0]?.toUpperCase() || 'U';
    if (userPlanEl) userPlanEl.textContent = this.user.plan || 'Free';
    document.getElementById('auth-screen')?.classList.remove('active');
    document.getElementById('main-screen')?.classList.add('active');
    if (this.user.language) i18n.setLanguage(this.user.language);
  }

  showAuthScreen() {
    document.getElementById('auth-screen')?.classList.add('active');
    document.getElementById('main-screen')?.classList.remove('active');
  }

  getUser() { return this.user; }
}

const auth = new AuthManager();
