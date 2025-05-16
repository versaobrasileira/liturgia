// js/content.js
// tudo que monta e exibe o conteúdo da letra

import { fontConfig } from './fontConfig.js';

let currentFontSize = null;

/**
 * Carrega e exibe o conteúdo de um item (música).
 */
export async function loadContent(item) {
  const results = document.getElementById('results');
  const display = document.getElementById('content-display');

  // garante que o <h1> volte a ser mostrado
  document.body.classList.remove('content-open');

  // limpa e esconde
  results.innerHTML = '';
  display.innerHTML = '';
  display.classList.remove('visible');

  // fetch do JSON
  let data;
  try {
    const res = await fetch(`./content/${item.file}`);
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch (err) {
    console.error(err);
    display.textContent = `Erro ao carregar "${item.title}".`;
    display.classList.add('visible');
    return;
  }

  // monta title-bar
  const titleBar = document.createElement('div');
  titleBar.className = 'title-bar';

  const titleText = document.createElement('div');
  titleText.className = 'title-text';
  const h2 = document.createElement('h2');
  h2.textContent = data.title;
  const sub = document.createElement('div');
  sub.className = 'subtitle';
  sub.textContent = `pg. ${data.page}`;
  titleText.append(h2, sub);

  // controles de zoom + idioma
  const controls = document.createElement('div');
  controls.className = 'controls';
  const btnDec = createZoomButton('–', 'Diminuir fonte', -2);
  const btnInc = createZoomButton('+', 'Aumentar fonte', +2);
  controls.append(btnDec, btnInc, setupLangSelector(item));

  titleBar.append(titleText, controls);
  display.append(titleBar);

  // monta container rolável com as letras
  const scroll = document.createElement('div');
  scroll.className = 'content-scroll';
  const lyricsContainer = document.createElement('div');
  lyricsContainer.className = 'lyrics-container';
  data.lyrics.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    lyricsContainer.append(p);
  });
  scroll.append(lyricsContainer);
  display.append(scroll);

  // exibe tudo
  display.classList.add('visible');
  document.body.classList.add('content-open');

  // ajusta fonte para caber maior linha
  adjustFontSize(lyricsContainer);
}

/** cria um botão de zoom que chama changeFontSize(delta) */
function createZoomButton(symbol, title, delta) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = symbol;
  btn.title = title;
  btn.addEventListener('click', () => changeFontSize(delta));
  return btn;
}

/** ajusta font-size para que a maior linha ocupe toda a largura */
export function adjustFontSize(container = document.querySelector('.lyrics-container')) {
  const paras = Array.from(container.querySelectorAll('p'));
  if (!paras.length) return;
  container.style.fontSize = ''; // reset

  const style      = getComputedStyle(container);
  const { fontFamily, fontWeight } = style;
  const availableW = container.clientWidth;
  const { minFontSize: minFS, maxFontSize: maxFS } = fontConfig;

  const cvs = document.createElement('canvas');
  const ctx = cvs.getContext('2d');
  ctx.font = `${fontWeight} ${maxFS}px ${fontFamily}`;

  let maxTextW = 0;
  paras.forEach(p => {
    maxTextW = Math.max(maxTextW, ctx.measureText(p.textContent).width);
  });
  if (!maxTextW) return;

  let newSize = maxFS * (availableW / maxTextW);
  newSize = Math.max(minFS, Math.min(maxFS, newSize));
  container.style.fontSize = `${newSize}px`;
  currentFontSize = newSize;
}

/** muda fonte em delta px */
export function changeFontSize(delta) {
  const lyrics = document.querySelector('.lyrics-container');
  let size = currentFontSize || parseFloat(getComputedStyle(lyrics).fontSize);
  size = Math.max(fontConfig.minFontSize,
                  Math.min(fontConfig.maxFontSize, size + delta));
  lyrics.style.fontSize = `${size}px`;
  currentFontSize = size;
}

/** monta <select> de idioma e lida com troca */
export function setupLangSelector(item) {
  const sel = document.createElement('select');
  sel.title = 'Idioma';
  sel.className = 'lang-selector';
  sel.add(new Option('TL','default'));
  if (item.hebrew)     sel.add(new Option('עב','hebrew'));
  if (item.portuguese) sel.add(new Option('PT','portuguese'));
  sel.value = 'default';

  sel.addEventListener('change', async () => {
    let fname = item.file;
    if (sel.value==='hebrew')      fname = item.hebrew;
    else if (sel.value==='portuguese') fname = item.portuguese;
    try {
      const res  = await fetch(`./content/${fname}`);
      const data = await res.json();
      renderLyrics(data.lyrics);
      adjustFontSize();
    } catch(e){ console.error(e); }
  });

  return sel;
}

/** re‐renderiza as linhas na mesma .lyrics-container */
export function renderLyrics(lines) {
  const cont = document.querySelector('.lyrics-container');
  cont.innerHTML = '';
  lines.forEach(l => {
    const p = document.createElement('p');
    p.textContent = l;
    cont.append(p);
  });
}

// reaplica ajuste de fonte ao redimensionar
window.addEventListener('resize', () => {
  if (document.getElementById('content-display').classList.contains('visible')) {
    adjustFontSize();
  }
});
