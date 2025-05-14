const form    = document.getElementById('search-form');
const input   = document.getElementById('search-input');
const button  = document.getElementById('search-button');
const results = document.getElementById('results');
const display = document.getElementById('content-display');

button.disabled = true;
input.addEventListener('input', () => {
  const v = input.value.trim();
  button.disabled = v.length < 2;
  results.innerHTML = '';
  display.innerHTML = '';
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const query = input.value.trim();
  results.innerHTML = '';
  display.innerHTML = '';

  let index;
  try {
    const res = await fetch('./content/index.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    index = await res.json();
  } catch (err) {
    console.error('Não foi possível carregar index.json:', err);
    results.textContent = 'Erro ao carregar dados. Verifique se content/index.json existe.';
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
    loadContent(matches[0]);
  } else {
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
  }
});

async function loadContent(item) {
  results.innerHTML = '';
  display.innerHTML = '';

  let data;
  try {
    const res = await fetch(`./content/${item.file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error(`Falha ao carregar ${item.file}:`, err);
    display.textContent = `Erro ao carregar conteúdo "${item.title}".`;
    return;
  }

  const title = document.createElement('h2');
  title.textContent = `${data.title} (pg. ${data.page})`;
  display.appendChild(title);

  data.lyrics.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    display.appendChild(p);
  });
}

async function loadContent(item) {
  results.innerHTML = '';
  display.innerHTML = '';

  let data;
  try {
    const res = await fetch(`./content/${item.file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error(`Falha ao carregar ${item.file}:`, err);
    display.textContent = `Erro ao carregar conteúdo "${item.title}".`;
    return;
  }

  // monta título
  const title = document.createElement('h2');
  title.textContent = `${data.title} (pg. ${data.page})`;
  display.appendChild(title);

  // monta linhas de letra
  data.lyrics.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    display.appendChild(p);
  });

  // depois que tudo estiver no DOM, ajusta o font-size
  adjustFontSize();
}

// função que calcula e aplica o maior font-size possível
function adjustFontSize() {
  const container = document.getElementById('content-display');
  const paras     = Array.from(container.querySelectorAll('p'));
  if (!paras.length) return;

  // remove qualquer ajuste anterior
  container.style.fontSize = '';

  const cw = container.clientWidth;
  let maxW = 0;
  // mede largura real de cada parágrafo
  paras.forEach(p => {
    const w = p.scrollWidth;
    if (w > maxW) maxW = w;
  });
  if (maxW === 0) return;

  // pega o font-size inicial definido no CSS
  const computed = getComputedStyle(container);
  const baseSize = parseFloat(computed.fontSize);

  // calcula proporção
  const scale = cw / maxW;
  const newSize = baseSize * scale;

  container.style.fontSize = `${newSize}px`;
}

// opcional: refaz o cálculo ao redimensionar a janela
window.addEventListener('resize', () => {
  if (display.innerHTML.trim()) adjustFontSize();
});