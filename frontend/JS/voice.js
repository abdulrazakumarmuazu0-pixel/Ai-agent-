class VoiceManager {
  constructor() { this.recognition = null; this.isRecording = false; this.synth = window.speechSynthesis; }

  init() {
    const voiceBtn = document.getElementById('voice-btn');
    voiceBtn?.addEventListener('click', () => this.toggleRecording());

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
        const input = document.getElementById('message-input');
        if (input) { input.value = transcript; input.dispatchEvent(new Event('input')); }
      };
      this.recognition.onerror = (event) => { console.error('Speech error:', event.error); this.stopRecording(); showToast('Voice recognition error', 'error'); };
      this.recognition.onend = () => this.stopRecording();
    }
  }

  toggleRecording() {
    if (!this.recognition) { showToast('Voice input not supported', 'warning'); return; }
    if (this.isRecording) this.stopRecording(); else this.startRecording();
  }

  startRecording() {
    this.isRecording = true;
    const voiceBtn = document.getElementById('voice-btn');
    voiceBtn.classList.add('recording'); voiceBtn.style.color = 'var(--danger)';
    const lang = i18n.getCurrentLanguage();
    this.recognition.lang = lang === 'ha' ? 'ha-NG' : lang === 'ar' ? 'ar-SA' : 'en-US';
    this.recognition.start();
    showToast('Listening...', 'info');
  }

  stopRecording() {
    this.isRecording = false;
    const voiceBtn = document.getElementById('voice-btn');
    voiceBtn.classList.remove('recording'); voiceBtn.style.color = '';
    this.recognition.stop();
  }

  speak(text) {
    if (!this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const lang = i18n.getCurrentLanguage();
    utterance.lang = lang === 'ha' ? 'ha-NG' : lang === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 1; utterance.pitch = 1;
    this.synth.speak(utterance);
  }
}

const voice = new VoiceManager();