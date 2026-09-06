const translations = {
  en: {
    appName: 'AI Agent', appTagline: 'Your Intelligent Assistant',
    login: 'Login', register: 'Register', email: 'Email', password: 'Password',
    displayName: 'Display Name', language: 'Language', newChat: 'New Chat',
    settings: 'Settings', theme: 'Theme', notifications: 'Notifications',
    uploadFile: 'Upload File', upload: 'Upload', dropFileHere: 'Drop file here or click to browse',
    welcomeTitle: 'How can I help you today?', welcomeSubtitle: 'Ask me anything, search the web, or upload files.',
    typeMessage: 'Type your message...', inputHint: 'Press Enter to send, Shift+Enter for new line',
    logout: 'Logout', search: 'Search', send: 'Send', cancel: 'Cancel', delete: 'Delete',
    confirm: 'Confirm', error: 'Error', success: 'Success', loading: 'Loading...',
    noConversations: 'No conversations yet', today: 'Today', yesterday: 'Yesterday',
    fileTooLarge: 'File is too large', unsupportedFile: 'Unsupported file type',
    uploadSuccess: 'File uploaded successfully', uploadError: 'Failed to upload file',
    networkError: 'Network error. Please check your connection.',
    sessionExpired: 'Session expired. Please login again.',
    dailyLimit: 'Daily limit reached', typing: 'AI is typing...',
    orContinueWith: 'or continue with', continueWithGoogle: 'Continue with Google'
  },
  ha: {
    appName: 'AI Agent', appTagline: 'Mai Taimakonku Mai Hikima',
    login: 'Shiga', register: 'Yi Rajista', email: 'Imel', password: 'Sirri',
    displayName: 'Sunan da aka nuna', language: 'Harshe', newChat: 'Sabuwar Tattaunawa',
    settings: 'Saituna', theme: 'Jigo', notifications: 'Sanarwa',
    uploadFile: 'Loda Fayil', upload: 'Loda', dropFileHere: 'Sauke fayil a nan ko danna don bincika',
    welcomeTitle: 'Ta yaya zan taimake ku yau?', welcomeSubtitle: 'Tambaye ni komai, bincika yanar gizo, ko loda fayiloli.',
    typeMessage: 'Rubuta saƙonku...', inputHint: 'Danna Enter don aika, Shift+Enter don sabon layi',
    logout: 'Fita', search: 'Bincika', send: 'Aika', cancel: 'Soke', delete: 'Share',
    confirm: 'Tabbatar', error: 'Kuskure', success: 'Nasara', loading: 'Ana lodawa...',
    noConversations: 'Babu tattaunawa tukuna', today: 'Yau', yesterday: 'Jiya',
    fileTooLarge: 'Fayil ya yi girma', unsupportedFile: "Nau'in fayil ba a goyi bayan shi ba",
    uploadSuccess: 'An yi lodin fayil cikin nasara', uploadError: 'Ba a yi lodin fayil ba',
    networkError: 'Kuskuren hanyar sadarwa. Da fatan za a duba haɗinku.',
    sessionExpired: 'Zaman ya ƙare. Da fatan za a sake shiga.',
    dailyLimit: 'An kai iyakar yau', typing: 'AI na rubuta...',
    orContinueWith: 'ko ci gaba da', continueWithGoogle: 'Ci gaba da Google'
  },
  ar: {
    appName: 'وكيل الذكاء الاصطناعي', appTagline: 'مساعدك الذكي',
    login: 'تسجيل الدخول', register: 'إنشاء حساب', email: 'البريد الإلكتروني', password: 'كلمة المرور',
    displayName: 'الاسم المعروض', language: 'اللغة', newChat: 'محادثة جديدة',
    settings: 'الإعدادات', theme: 'المظهر', notifications: 'الإشعارات',
    uploadFile: 'رفع ملف', upload: 'رفع', dropFileHere: 'أسقط الملف هنا أو انقر للتصفح',
    welcomeTitle: 'كيف يمكنني مساعدتك اليوم؟', welcomeSubtitle: 'اسألني أي شيء، ابحث في الويب، أو ارفع ملفات.',
    typeMessage: 'اكتب رسالتك...', inputHint: 'اضغط Enter للإرسال، Shift+Enter لسطر جديد',
    logout: 'تسجيل الخروج', search: 'بحث', send: 'إرسال', cancel: 'إلغاء', delete: 'حذف',
    confirm: 'تأكيد', error: 'خطأ', success: 'نجاح', loading: 'جاري التحميل...',
    noConversations: 'لا توجد محادثات بعد', today: 'اليوم', yesterday: 'أمس',
    fileTooLarge: 'الملف كبير جداً', unsupportedFile: 'نوع الملف غير مدعوم',
    uploadSuccess: 'تم رفع الملف بنجاح', uploadError: 'فشل رفع الملف',
    networkError: 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
    sessionExpired: 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.',
    dailyLimit: 'تم الوصول للحد اليومي', typing: 'الذكاء الاصطناعي يكتب...',
    orContinueWith: 'أو استمر باستخدام', continueWithGoogle: 'الاستمرار مع Google'
  }
};

let currentLanguage = localStorage.getItem('language') || 'en';

const i18n = {
  t(key) { return translations[currentLanguage]?.[key] || translations.en[key] || key; },
  setLanguage(lang) {
    if (translations[lang]) {
      currentLanguage = lang;
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      this.updatePage();
    }
  },
  updatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[currentLanguage]?.[key]) el.textContent = translations[currentLanguage][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[currentLanguage]?.[key]) el.placeholder = translations[currentLanguage][key];
    });
  },
  getCurrentLanguage() { return currentLanguage; }
};

document.addEventListener('DOMContentLoaded', () => { i18n.setLanguage(currentLanguage); });