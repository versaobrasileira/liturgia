// js/components/ThemeToggle/ThemeToggle.js

// Injetor de CSS compatível
function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/ThemeToggle/ThemeToggle.css');

// ThemeToggle Component
export class ThemeToggle {
  constructor({
    btnSelector = '#theme-toggle',
    linkClaroId = 'tema-claro-css',
    rootElement = document.documentElement,
    storageKey = 'theme'
  } = {}) {
    this.btn       = document.querySelector(btnSelector);
    this.linkClaro = document.getElementById(linkClaroId);
    this.root      = rootElement;

    this.themes = ['light', 'dark', 'light-invert', 'dark-invert'];
    this.emojis = {
      'light':        '🌒',
      'dark':         '🌙',
      'light-invert': '☀️',
      'dark-invert':  '🌅'
    };

    this.current = localStorage.getItem(storageKey) || 'light-invert';
    if (!this.themes.includes(this.current)) this.current = 'light-invert';

    // Aplica tema no início
    this.applyTheme(this.current);

    // Evento de click
    this.btn.addEventListener('click', () => {
      const idx = this.themes.indexOf(this.current);
      this.current = this.themes[(idx + 1) % this.themes.length];
      localStorage.setItem(storageKey, this.current);
      this.applyTheme(this.current);
    });
  }

  applyTheme(mode) {
    // Ativa/desativa tema claro
    this.linkClaro.disabled = !mode.startsWith('light');
    // Marca inverção de cores se necessário
    if (mode.endsWith('invert')) {
      this.root.setAttribute('data-invert', '');
    } else {
      this.root.removeAttribute('data-invert');
    }
    // Emoji correto
    this.btn.textContent = this.emojis[mode] || '🌙';
  }
}
