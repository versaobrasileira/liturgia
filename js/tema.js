// js/tema.js

const linkClaro = document.getElementById('tema-claro-css');
const btn       = document.getElementById('theme-toggle');
const root      = document.documentElement;

// sequência de temas e emojis  
const themes = ['light', 'dark', 'light-invert', 'dark-invert'];
const emojis = {
  'light':        '🌒',
  'dark':         '🌙',
  'light-invert': '☀️',
  'dark-invert':  '🌅'
};

// **default** para quem não tiver nada em localStorage:
let current = localStorage.getItem('theme') || 'light-invert';
if (!themes.includes(current)) current = 'light-invert';

applyTheme(current);

btn.addEventListener('click', () => {
  const idx = themes.indexOf(current);
  current = themes[(idx + 1) % themes.length];
  localStorage.setItem('theme', current);
  applyTheme(current);
});

function applyTheme(mode) {
  // se for qualquer "light", ativa o tema claro
  linkClaro.disabled = !mode.startsWith('light');

  // se termina em "-invert", marca o data-invert
  if (mode.endsWith('invert')) {
    root.setAttribute('data-invert', '');
  } else {
    root.removeAttribute('data-invert');
  }

  btn.textContent = emojis[mode] || '🌙';
}
