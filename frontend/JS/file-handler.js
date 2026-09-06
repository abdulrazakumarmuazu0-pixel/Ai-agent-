class FileHandler {
  constructor() { this.selectedFile = null; }

  init() {
    const fileBtn = document.getElementById('file-btn');
    const fileModal = document.getElementById('file-modal');
    const fileDropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('file-upload-btn');

    fileBtn?.addEventListener('click', () => fileModal?.classList.add('active'));
    fileDropZone?.addEventListener('click', () => fileInput?.click());
    fileDropZone?.addEventListener('dragover', (e) => { e.preventDefault(); fileDropZone.classList.add('dragover'); });
    fileDropZone?.addEventListener('dragleave', () => fileDropZone.classList.remove('dragover'));
    fileDropZone?.addEventListener('drop', (e) => {
      e.preventDefault(); fileDropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) this.handleFileSelect(e.dataTransfer.files[0]);
    });
    fileInput?.addEventListener('change', (e) => { if (e.target.files.length > 0) this.handleFileSelect(e.target.files[0]); });
    uploadBtn?.addEventListener('click', () => this.uploadFile());
    fileModal?.querySelector('.modal-close')?.addEventListener('click', () => { fileModal.classList.remove('active'); this.reset(); });
  }

  handleFileSelect(file) {
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) { showToast(i18n.t('fileTooLarge'), 'error'); return; }
    this.selectedFile = file;
    const fileInfo = document.getElementById('file-info');
    if (fileInfo) fileInfo.innerHTML = `<div class="file-attachment"><span class="file-icon">📄</span><div><div class="file-name">${file.name}</div><div class="file-size">${this.formatFileSize(file.size)}</div></div></div>`;
    document.getElementById('file-upload-btn').disabled = false;
  }

  async uploadFile() {
    if (!this.selectedFile) return;
    const uploadBtn = document.getElementById('file-upload-btn');
    uploadBtn.disabled = true; uploadBtn.innerHTML = '<div class="loading-spinner"></div>';
    try {
      const response = await api.uploadFile(this.selectedFile, chat.currentConversationId);
      if (response.success) {
        showToast(i18n.t('uploadSuccess'), 'success');
        document.getElementById('file-modal').classList.remove('active');
        this.reset();
        chat.addMessageToUI('user', `[File uploaded: ${response.data.file.originalName}]`);
      } else throw new Error(response.message);
    } catch (error) { showToast(error.message || i18n.t('uploadError'), 'error'); }
    finally { uploadBtn.disabled = false; uploadBtn.textContent = i18n.t('upload'); }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  reset() {
    this.selectedFile = null;
    document.getElementById('file-info').innerHTML = '';
    document.getElementById('file-input').value = '';
    document.getElementById('file-upload-btn').disabled = true;
  }
}

const fileHandler = new FileHandler();