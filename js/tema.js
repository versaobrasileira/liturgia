// js/tema.js

const linkClaro = document.getElementById('tema-claro-css');
const btn       = document.getElementById('theme-toggle');
const root      = document.documentElement;

// sequência de temas e emojis  
const themes = ['light', 'dark', 'light-invert', 'dark-invert'];
const emojis = {
  'light':       '🌒',  // próximo é dark
  'dark':        '🌙',  // próximo é light-invert
  'light-invert':'☀️',  // próximo é dark-invert
  'dark-invert': '🌅'   // próximo é light
};

// carrega do localStorage, ou default 'light'
let current = localStorage.getItem('theme') || 'light';
if (!themes.includes(current)) current = 'light';

applyTheme(current);

btn.addEventListener('click', () => {
  // avança no ciclo
  const idx = themes.indexOf(current);
  current = themes[(idx + 1) % themes.length];
  localStorage.setItem('theme', current);
  applyTheme(current);
});

function applyTheme(mode) {
  // light vs dark: controla o tema_claro.css
  if (mode.startsWith('light')) {
    linkClaro.disabled = false;
  } else {
    linkClaro.disabled = true;
  }

  // invertido?
  if (mode.endsWith('invert')) {
    root.setAttribute('data-invert', '');
  } else {
    root.removeAttribute('data-invert');
  }

  // atualiza o ícone
  btn.textContent = emojis[mode] || '🌙';
}
