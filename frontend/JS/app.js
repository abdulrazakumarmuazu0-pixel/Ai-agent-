function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, duration);
}

document.addEventListener('DOMContentLoaded', async () => {
  i18n.updatePage();
  const isAuth = await auth.init();
  if (isAuth) { await chat.init(); fileHandler.init(); voice.init(); }
  setupAuthForms(); setupSettings(); setupSidebar();
  document.getElementById('logout-btn')?.addEventListener('click', () => auth.logout());
  window.addEventListener('auth:expired', () => { showToast(i18n.t('sessionExpired'), 'warning'); auth.logout(); });
});

function setupAuthForms() {
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active')); tab.classList.add('active');
      document.querySelectorAll('.auth-form').forEach(form => form.classList.toggle('active', form.id === `${target}-form`));
    });
  });

  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';
    const result = await auth.login(email, password);
    if (!result.success) errorEl.textContent = result.error;
    else await onAuthSuccess();
  });

  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const language = document.getElementById('register-language').value;
    const errorEl = document.getElementById('register-error');
    errorEl.textContent = '';
    const result = await auth.register(email, password, name, language);
    if (!result.success) errorEl.textContent = result.error;
    else await onAuthSuccess();
  });

  document.getElementById('google-signin-btn')?.addEventListener('click', async () => {
    const errorEl = document.getElementById('google-error');
    errorEl.textContent = '';
    const result = await auth.loginWithGoogle();
    if (!result.success) errorEl.textContent = result.error;
    else await onAuthSuccess();
  });
}

// Runs once after any successful login/register/Google sign-in so the
// main app is actually usable (mirrors what DOMContentLoaded does for a
// restored session).
async function onAuthSuccess() {
  await chat.init();
  fileHandler.init();
  voice.init();
}

function setupSettings() {
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const themeSelect = document.getElementById('setting-theme');
  const langSelect = document.getElementById('setting-language');
  const notifToggle = document.getElementById('setting-notifications');

  const savedTheme = localStorage.getItem('theme') || 'light';
  const savedLang = localStorage.getItem('language') || 'en';
  const savedNotif = localStorage.getItem('notifications') === 'true';

  if (themeSelect) themeSelect.value = savedTheme;
  if (langSelect) langSelect.value = savedLang;
  if (notifToggle) notifToggle.checked = savedNotif;
  applyTheme(savedTheme);

  settingsBtn?.addEventListener('click', () => settingsModal?.classList.add('active'));
  settingsModal?.querySelector('.modal-close')?.addEventListener('click', () => settingsModal.classList.remove('active'));

  themeSelect?.addEventListener('change', (e) => { localStorage.setItem('theme', e.target.value); applyTheme(e.target.value); });
  langSelect?.addEventListener('change', (e) => {
    i18n.setLanguage(e.target.value); localStorage.setItem('language', e.target.value);
    if (auth.isAuthenticated) api.updateProfile({ language: e.target.value }).catch(() => {});
  });
  notifToggle?.addEventListener('change', (e) => { localStorage.setItem('notifications', e.target.checked); if (e.target.checked) Notification.requestPermission(); });
}

function applyTheme(theme) {
  if (theme === 'auto') { const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light'); }
  else document.documentElement.setAttribute('data-theme', theme);
}

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebar-toggle');
  const close = document.getElementById('sidebar-close');
  toggle?.addEventListener('click', () => sidebar?.classList.add('open'));
  close?.addEventListener('click', () => sidebar?.classList.remove('open'));
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar?.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !toggle?.contains(e.target)) sidebar.classList.remove('open');
    }
  });
}