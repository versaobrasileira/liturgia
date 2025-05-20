// js/components/FullscreenToggle/FullscreenToggle.js

// Injeta CSS do botão
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
  constructor() {
    // Cria o botão se não existir no DOM
    this.element = document.createElement('button');
    this.element.id = 'fullscreen-toggle';
    this.element.title = 'Tela cheia';
    this.active = false;
    this.onToggle = null; // função definida pelo controlador

    this.element.textContent = '⛶'; // Padrão: expandir

    // Toggle on click (delegando decisão para quem usa)
    this.element.addEventListener('click', () => {
      this.active = !this.active;
      this.updateVisual();
      if (typeof this.onToggle === 'function') {
        this.onToggle(this.active); // comunica ao Fullscreen.js
      }
    });
    this.updateVisual();
  }

  setActive(active) {
    this.active = !!active;
    this.updateVisual();
  }

  updateVisual() {
    // Altera o ícone visual
    this.element.textContent = this.active ? '🗗' : '⛶';
    this.element.classList.toggle('active', this.active);
  }
}
