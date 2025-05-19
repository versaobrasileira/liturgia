// js/fullscreen.js

export let fsMode = false;

const btn    = document.getElementById('fullscreen-toggle');
const input  = document.getElementById('search-input');  // captura o input

if (!btn) throw new Error('fullscreen-toggle não encontrado');

btn.addEventListener('click', () => {
  fsMode = !fsMode;
  updateFsUI();
});

export function updateFsUI() {
  // 1) Ajusta a classe no <body>
  document.body.classList.toggle('fullscreen-mode', fsMode);

  // 2) Muda o ícone
  btn.textContent = fsMode ? '🗗' : '⛶';

  // 3) Atualiza o placeholder do input
  input.placeholder = fsMode
    ? 'Digite...'
    : 'Digite nº da página ou termo…';
}

// ao iniciar, já aplica o placeholder correto
updateFsUI();

// resta do seu código
[input, document.getElementById('search-button')].forEach(el => {
  if (!el) return;
  el.addEventListener('focus', exitContent);
  el.addEventListener('click', exitContent);
});

function exitContent() {
  document.getElementById('content-display')?.classList.remove('visible');
  document.body.classList.remove('content-open');
}
