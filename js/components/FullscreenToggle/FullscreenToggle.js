// js/components/FullscreenToggle/FullscreenToggle.js

// Injeta o CSS do componente (ou só mantém para padrão, se não precisar extra)
function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/FullscreenToggle/FullscreenToggle.css');

export class FullscreenToggle {
  constructor({
    btnSelector = '#fullscreen-toggle',
    inputSelector = '#search-input',
    searchBtnSelector = '#search-button',
    contentDisplaySelector = '#content-display'
  } = {}) {
    this.fsMode = false;

    this.btn    = document.querySelector(btnSelector);
    this.input  = document.querySelector(inputSelector);
    this.searchBtn = document.querySelector(searchBtnSelector);
    this.contentDisplay = document.querySelector(contentDisplaySelector);

    if (!this.btn) throw new Error('fullscreen-toggle não encontrado');

    this.btn.addEventListener('click', () => {
      this.fsMode = !this.fsMode;
      this.updateFsUI();
    });

    // Inicializa o estado da UI
    this.updateFsUI();

    // Sai do content-display ao focar input/botão
    [this.input, this.searchBtn].forEach(el => {
      if (!el) return;
      el.addEventListener('focus', () => this.exitContent());
      el.addEventListener('click', () => this.exitContent());
    });
  }

  updateFsUI() {
    document.body.classList.toggle('fullscreen-mode', this.fsMode);
    this.btn.textContent = this.fsMode ? '🗗' : '⛶';

    // O placeholder, atualmente, não muda nunca (poderia customizar aqui se mudar futuramente)
    if (this.input) {
      this.input.placeholder = 'Digite nº da página ou termo… 🔍';
    }
  }

  exitContent() {
    this.contentDisplay?.classList.remove('visible');
    document.body.classList.remove('content-open');
  }
}
