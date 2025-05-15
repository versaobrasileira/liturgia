const form    = document.getElementById('search-form');
const input   = document.getElementById('search-input');
const button  = document.getElementById('search-button');
const results = document.getElementById('results');
const display = document.getElementById('content-display');

let fontConfig = { minFontSize: 20, maxFontSize: 100 };
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
  const display = document.getElementById('content-display');

  // Limpa e esconde antes de carregar novo conteúdo
  display.innerHTML = '';
  display.classList.remove('visible');

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

  // Criando container para texto com rolagem
  const contentScroll = document.createElement('div');
  contentScroll.className = 'content-scroll';

  // Adicionando título e subtítulo fixos
  const titleBar = document.createElement('div');
  titleBar.className = 'title-bar';

  const titleText = document.createElement('div');
  titleText.className = 'title-text';

  const titleEl = document.createElement('h2');
  titleEl.textContent = data.title;
  
  const subtitle = document.createElement('div');
  subtitle.className = 'subtitle';
  subtitle.textContent = `pg. ${data.page}`;
  
  titleText.append(titleEl, subtitle);
  titleBar.appendChild(titleText);

  // Criando botões de fonte
  const controls = document.createElement('div');
  controls.className = 'controls';

  const minus = Object.assign(document.createElement('button'), {
    type: 'button', textContent: '–', title: 'Diminuir fonte'
  });
  minus.addEventListener('click', () => changeFontSize(-2));
  minus.addEventListener('touchend', () => changeFontSize(-2));

  const plus = Object.assign(document.createElement('button'), {
    type: 'button', textContent: '+', title: 'Aumentar fonte'
  });
  plus.addEventListener('click', () => changeFontSize(+2));
  plus.addEventListener('touchend', () => changeFontSize(+2));

  const langSel = setupLangSelector(item);
  
  controls.append(minus, plus, langSel);
  titleBar.appendChild(controls);
  
  display.appendChild(titleBar); // Mantém titleBar fixo no topo

  // Adicionando conteúdo dentro do container rolável
  const lyricsContainer = document.createElement('div');
  lyricsContainer.className = 'lyrics-container';
  data.lyrics.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    lyricsContainer.appendChild(p);
  });

  contentScroll.appendChild(lyricsContainer);
  display.appendChild(contentScroll);

  // Exibe o content-display corretamente
  display.classList.add('visible');

  // **Aqui garantimos que a altura do content-scroll seja respeitada**
  contentScroll.style.maxHeight = '50vh';
  contentScroll.style.overflowY = 'auto';

  // Ajusta a fonte do texto carregado
  adjustFontSize(lyricsContainer);
}


let currentFontSize = null;
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
function adjustFontSize(container = document.querySelector('.lyrics-container')) {
  const paras = Array.from(container.querySelectorAll('p'));
  if (!paras.length) return;

  container.style.fontSize = ''; // reset

  const style      = getComputedStyle(container);
  const fontFamily = style.fontFamily;
  const fontWeight = style.fontWeight;
  const availableW = container.clientWidth;

  const { minFontSize: minFS, maxFontSize: maxFS } = fontConfig;

  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');
  const testSize = maxFS;
  ctx.font = `${fontWeight} ${testSize}px ${fontFamily}`;

  let maxTextW = 0;
  paras.forEach(p => {
    const w = ctx.measureText(p.textContent).width;
    if (w > maxTextW) maxTextW = w;
  });
  if (!maxTextW || !availableW) return;

  let newSize = testSize * (availableW / maxTextW);
  newSize = Math.max(minFS, Math.min(maxFS, newSize));

  container.style.fontSize = `${newSize}px`;
}

function changeFontSize(delta) {
  const lyrics = document.querySelector('.lyrics-container');
  let size = currentFontSize || parseFloat(getComputedStyle(lyrics).fontSize);
  size = Math.max(fontConfig.minFontSize, Math.min(fontConfig.maxFontSize, size + delta));
  
  lyrics.style.fontSize = `${size}px`;
  currentFontSize = size;
  
  // Garante que o content-display seja atualizado corretamente
  document.getElementById('content-display').style.maxHeight = '70vh'; 
}

window.addEventListener('resize', () => {
  if (document.getElementById('content-display').classList.contains('visible')) {
    adjustFontSize();
  }
});

/**
 * Monta o <select> de idioma (TL, עב, PT) dentro dos botões de redimensionar fonte.
 * @param {{ file: string, hebrew?: string, portuguese?: string }} item
 */
function setupLangSelector(item) {
  const sel = document.createElement('select');
  sel.id = 'lang-selector';
  sel.title = 'Escolha o idioma';
  sel.className = 'lang-selector';

  // transliteração sempre disponível
  sel.add(new Option('TL', 'default'));

  // hebraico?
  if (item.hebrew) {
    sel.add(new Option('עב', 'hebrew'));
  }
  // português?
  if (item.portuguese) {
    sel.add(new Option('PT', 'portuguese'));
  }

  // valor inicial
  sel.value = 'default';

  // ao trocar, busca e renderiza a variante
  sel.addEventListener('change', async () => {
    let filename = item.file;
    if (sel.value === 'hebrew')      filename = item.hebrew;
    else if (sel.value === 'portuguese') filename = item.portuguese;

    try {
      const res  = await fetch(`./content/${filename}`);
      const data = await res.json();
      renderLyrics(data.lyrics);
      currentFontSize = null;
      adjustFontSize(document.querySelector('.lyrics-container'));
    } catch (err) {
      console.error(err);
    }
  });

  return sel;
}

/**
 * Renderiza as linhas na <div class="lyrics-container">,
 * limpando primeiro o que havia lá.
 */
function renderLyrics(lines) {
  const container = document.querySelector('.lyrics-container');
  container.innerHTML = '';             // limpa tudo

  lines.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    container.appendChild(p);
  });
}

