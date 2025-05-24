// js/components/FullscreenToggle/FullscreenToggle.js

const janelaSVG = `
<svg viewBox="0 0 24 24" fill="none"
     xmlns="http://www.w3.org/2000/svg"
     width="1.15em" height="1.15em" style="display:block;margin:auto;">
  <rect x="4" y="4" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"/>
  <rect x="7" y="7" width="10" height="10" stroke="currentColor" stroke-width="2" fill="none"/>
</svg>
`;

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

function getBestFsIcon() {
  if (isCharSupported('🗗')) return '🗗';
  if (isCharSupported('□')) return '□';
  if (isCharSupported('−')) return '−';
  return '-';
}

export class FullscreenToggle {
  constructor() {
    this.element = document.createElement('button');
    this.element.id = 'fullscreen-toggle';
    this.element.title = 'Tela cheia';
    this.active = false;
    this.onToggle = null;

    this.FS_SVG = janelaSVG;
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
    if (this.active) {
      // SVG no modo fullscreen
      this.element.innerHTML = `<span class="fs-svg">${this.FS_SVG}</span>`;
    } else {
      // Ícone normal (caractere) no modo normal
      this.element.innerHTML = `<span>${this.NORMAL_ICON}</span>`;
    }
    this.element.classList.toggle('active', this.active);
    this.element.setAttribute('aria-pressed', this.active ? 'true' : 'false');

    // Ajuste fino (apenas para caractere normal, se necessário)
    if (!this.active) {
      const span = this.element.querySelector('span');
      span.classList.remove('fs-alticon', 'fs-normalicon', 'fs-svg');
      if (this.NORMAL_ICON === '⛶') {
        span.classList.add('fs-normalicon');
      }
    }
  }
}
