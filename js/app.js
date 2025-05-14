const form    = document.getElementById('search-form');
const input   = document.getElementById('search-input');
const button  = document.getElementById('search-button');
const results = document.getElementById('results');
const display = document.getElementById('content-display');

let fontConfig = { minFontSize: 12, maxFontSize: 100 };
(async () => {
  try {
    const res = await fetch('./config/fontConfig.json');
    if (res.ok) fontConfig = await res.json();
  } catch {
    console.warn('Usando fontConfig padrão');
  }
})();


// estado inicial
button.disabled = true;

// sempre que o usuário digita algo...
input.addEventListener('input', () => {
  const v = input.value.trim();
  // habilita/desabilita o botão
  button.disabled = v.length < 2;

  // limpa resultados ANTIGOS e esconde o conteúdo exibido
  results.innerHTML  = '';
  display.innerHTML  = '';
  display.classList.remove('visible');
});

// ao submeter a busca...
form.addEventListener('submit', async e => {
  e.preventDefault();
  const query = input.value.trim();

  // limpa TUDO antes de começar
  results.innerHTML  = '';
  display.innerHTML  = '';
  display.classList.remove('visible');

  // carrega o índice e filtra...
  let index;
  try {
    const res = await fetch('./content/index.json');
    if (!res.ok) throw new Error(res.status);
    index = await res.json();
  } catch {
    results.textContent = 'Erro ao carregar índice.';
    return;
  }

  const isNum   = /^\d+$/.test(query);
  const matches = index.filter(item =>
    isNum
      ? item.page === query
      : item.title.toLowerCase().includes(query.toLowerCase())
  );

  if (!matches.length) {
    results.textContent = 'Nenhum resultado encontrado.';
    return;
  }

  if (matches.length === 1) {
    // aqui entra o loadContent, que também esconde/mostra via .visible
    loadContent(matches[0]);
  } else {
    // lista várias opções, mas nunca chama loadContent
    const ul = document.createElement('ul');
    ul.classList.add('result-list');
    matches.forEach(item => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = `${item.title} (pg. ${item.page})`;
      btn.addEventListener('click', () => loadContent(item));
      li.appendChild(btn);
      ul.appendChild(li);
    });
    results.appendChild(ul);
    // note: não chamamos loadContent aqui, logo #content-display permanece oculto
  }
});


/**
 * Carrega e exibe o conteúdo de um item (música) no painel #content-display.
 * Faz também a limpeza e controla a visibilidade do container.
 *
 * @param {{ file: string, title: string, page: string }} item
 */
async function loadContent(item) {
  const results = document.getElementById('results');
  const display = document.getElementById('content-display');

  // limpeza
  results.innerHTML = '';
  display.innerHTML = '';
  display.classList.remove('visible');
  currentFontSize = null;

  // fetch
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

  // Monta título + botões
  const titleBar = document.createElement('div');
  titleBar.className = 'title-bar';

  const titleEl = document.createElement('h2');
  titleEl.textContent = `${data.title} (pg. ${data.page})`;

  const btns = document.createElement('div');
  btns.className = 'resize-buttons';

  const minus = document.createElement('button');
  minus.type = 'button';
  minus.textContent = 'A–';
  minus.title = 'Diminuir fonte';
  minus.addEventListener('click', () => changeFontSize(-2));

  const plus = document.createElement('button');
  plus.type = 'button';
  plus.textContent = 'A+';
  plus.title = 'Aumentar fonte';
  plus.addEventListener('click', () => changeFontSize(+2));

  btns.append(minus, plus);
  titleBar.append(titleEl, btns);
  display.appendChild(titleBar);

  // Monta as linhas
  data.lyrics.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    display.appendChild(p);
  });

  // exibe e ajusta font-size inicial
  display.classList.add('visible');
  adjustFontSize();
  // depois do ajuste, grava o valor inicial
  currentFontSize =
    parseFloat(getComputedStyle(display).fontSize);
}


let currentFontSize = null;

/**
 * Aumenta/Reduz o font-size atual em delta (px), respeitando min/max.
 */
function changeFontSize(delta) {
  const container = document.getElementById('content-display');
  // obtém valor atual (inline ou computed)
  let size = currentFontSize ||
             parseFloat(getComputedStyle(container).fontSize);
  size = Math.max(fontConfig.minFontSize,
          Math.min(fontConfig.maxFontSize, size + delta));
  container.style.fontSize = `${size}px`;
  currentFontSize = size;
}



/**
 * Ajusta o font-size do container #content-display para que a linha
 * mais longa ocupe exatamente a largura disponível (sem scroll horizontal),
 * respeitando limites mínimos e máximos definidos em fontConfig.
 */
/**
 * Ajusta o font-size de #content-display para
 * que a linha mais longa ocupe toda a largura
 * disponível (sem overflow-x), respeitando min/max.
 */
function adjustFontSize() {
  const container = document.getElementById('content-display');
  const paras = Array.from(container.querySelectorAll('p'));
  if (!paras.length) return;

  // Reset inline antes de medir
  container.style.fontSize = '';

  // Estilos atuais
  const style      = getComputedStyle(container);
  const fontFamily = style.fontFamily;
  const fontWeight = style.fontWeight;
  const availableW = container.clientWidth; // já desconta bordas

  // Configurações
  const minFS = fontConfig.minFontSize;
  const maxFS = fontConfig.maxFontSize;

  // Cria canvas para medir
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');
  // Use o max tamanho como referência
  let testSize = maxFS;
  ctx.font = `${fontWeight} ${testSize}px ${fontFamily}`;

  // Mede a largura que cada parágrafo ocuparia em testSize
  let maxTextW = 0;
  paras.forEach(p => {
    const w = ctx.measureText(p.textContent).width;
    if (w > maxTextW) maxTextW = w;
  });

  if (maxTextW <= 0 || availableW <= 0) return;

  // escala proporcional
  let newSize = testSize * (availableW / maxTextW);
  // clamp
  newSize = Math.max(minFS, Math.min(maxFS, newSize));

  container.style.fontSize = `${newSize}px`;
}


// opcional: refaz o cálculo ao redimensionar a janela
window.addEventListener('resize', () => {
  if (display.innerHTML.trim()) adjustFontSize();
});