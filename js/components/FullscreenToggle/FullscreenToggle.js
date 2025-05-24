// js/components/FullscreenToggle/FullscreenToggle.js

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

    this.element.innerHTML = `<span>${this.NORMAL_ICON}</span>`;

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
    const icon = this.active ? this.FS_ICON : this.NORMAL_ICON;
    this.element.innerHTML = `<span>${icon}</span>`;
    this.element.classList.toggle('active', this.active);
    this.element.setAttribute('aria-pressed', this.active ? 'true' : 'false');
    const span = this.element.querySelector('span');
    // Remove todos os ajustes antes
    span.classList.remove('fs-alticon', 'fs-normalicon');
    // Aplica ajuste fino dependendo do estado
    if (this.active && this.FS_ICON !== '⛶') {
      span.classList.add('fs-alticon');
    } else if (!this.active && this.NORMAL_ICON === '⛶') {
      span.classList.add('fs-normalicon');
    }
  }
}
