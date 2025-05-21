// js/components/FullscreenToggle/FullscreenToggle.js

// Injeta CSS do botão
/*
function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/FullscreenToggle/FullscreenToggle.css');*/

// Função de detecção
function isCharSupported(char) {
  const span = document.createElement('span');
  span.textContent = char;
  span.style.position = 'absolute';
  span.style.opacity = 0;
  span.style.fontFamily = 'Arial,Segoe UI Emoji,NotoColorEmoji,AppleColorEmoji,sans-serif';
  document.body.appendChild(span);

  span.textContent = '\uFFFD'; // Replacement character
  const notDefWidth = span.offsetWidth;
  span.textContent = char;
  const charWidth = span.offsetWidth;

  document.body.removeChild(span);
  return charWidth !== notDefWidth;
}

// Função para pegar o melhor ícone disponível
function getBestFsIcon() {
  if (isCharSupported('🗗')) return '🗗';
  if (isCharSupported('□')) return '□';
  if (isCharSupported('−')) return '−'; // sinal de menos matemático
  return '-';
}

export class FullscreenToggle {
  constructor() {
    this.element = document.createElement('button');
    this.element.id = 'fullscreen-toggle';
    this.element.title = 'Tela cheia';
    this.active = false;
    this.onToggle = null;

    this.FS_ICON = getBestFsIcon();
    this.NORMAL_ICON = '⛶';

    this.element.textContent = this.NORMAL_ICON;

    this.element.addEventListener('click', () => {
      this.active = !this.active;
      this.updateVisual();
      if (typeof this.onToggle === 'function') {
        this.onToggle(this.active);
      }
    });
    this.updateVisual();
  }

  setActive(active) {
    this.active = !!active;
    this.updateVisual();
  }

  updateVisual() {
    this.element.textContent = this.active ? this.FS_ICON : this.NORMAL_ICON;
    this.element.classList.toggle('active', this.active);
  }
}
