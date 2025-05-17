// js/search-ui.js

import { loadContent }    from './content.js';
import { SearchEngine, loadIndex } from './search/engine.js'; // agora engine.js exporta ambos

const form    = document.getElementById('search-form');
const input   = document.getElementById('search-input');
const button  = document.getElementById('search-button');
const results = document.getElementById('results');

const engine      = new SearchEngine();
let indexData     = null;    // cache do índice pra lista completa
let noResultTimer = null;    // temporizador pra fallback

// escapa chars especiais para usar em RegExp
function escapeRegExp(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// destaca em <strong> o que casa com rawKey (ignora case)
function highlight(text, rawKey) {
  if (!rawKey || rawKey.length < 2) return text;
  const esc = escapeRegExp(rawKey);
  const re  = new RegExp(esc, 'gi');
  return text.replace(re, m => `<strong>${m}</strong>`);
}

// esconde painel de conteúdo e desativa classe body
function hideContent() {
  document.getElementById('content-display').classList.remove('visible');
  document.body.classList.remove('content-open');
}

// garante que tenhamos o índice para a lista completa
async function ensureIndex() {
  if (!indexData) {
    try {
      indexData = await loadIndex();
    } catch (err) {
      console.error("Erro ao carregar índice:", err);
      results.textContent = 'Erro ao carregar índice.';
      return;
    }
  }
}


// mostra a lista completa em ordem alfabética
async function showFullList() {
  await ensureIndex();
  clearTimeout(noResultTimer);
  results.innerHTML = '';

  // Usa o mecanismo de busca para gerar os scores para todos os itens
  // Aqui usamos '*' ou string vazia, o que preferir para "mostrar todos"
  let matches;
  try {
    matches = await engine.search(''); // ou engine.search('*'), conforme sua engine aceita
  } catch (err) {
    results.textContent = 'Erro ao calcular relevância.';
    return;
  }

  // Se não quiser filtro de 60% na full list, pode modificar search para aceitar uma flag
  // e retornar todos, mas aqui vamos usar como está.

  const ul = document.createElement('ul');
  ul.className = 'result-list';

  for (const item of matches) {
    const li  = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = `${item.title} (pg. ${item.page})`;
    btn.addEventListener('click', () => loadContent(item));
    li.appendChild(btn);
    ul.appendChild(li);
  }
  results.appendChild(ul);
}


// estado inicial
button.disabled = true;

// busca “ao digitar”
input.addEventListener('input', () => {
  const v = input.value.trim();
  button.disabled = v.length < 2;

  clearTimeout(noResultTimer);
  results.innerHTML = '';
  hideContent();

  if (v.length >= 2) {
    // se nada voltar em 3s, exibe lista completa
    noResultTimer = setTimeout(showFullList, 3000);
    performSearch(false);
  }
});

// busca no submit (botão Buscar)
form.addEventListener('submit', e => {
  e.preventDefault();
  clearTimeout(noResultTimer);
  performSearch(true);
});

let fallbackTimer = null; // Fora da função, global no arquivo
/**
 * executa a busca via engine.search()
 * @param {boolean} autoLoad se true e só 1 item, carrega direto
 */
async function performSearch(autoLoad) {
  const raw = input.value.trim();
  hideContent();
  clearTimeout(noResultTimer);
  clearTimeout(fallbackTimer);
  results.innerHTML = '<div class="loading">Buscando...</div>'; 

  let matches;
  try {
    matches = await engine.search(raw);
  } catch(err) {
    console.error("Erro no search:", err);
    results.textContent = 'Erro na busca.';
    return;
  }

  // 0 resultados
  if (matches.length === 0) {
    results.textContent = 'Nenhum resultado encontrado.';

    // Se não for submit, aguarda 2s e mostra lista completa em ordem alfabética
    if (!autoLoad) {
      fallbackTimer = setTimeout(async () => {
        await showFullList(); // showFullList já ordena alfabeticamente
      }, 2000);
    }
    // Se for submit (Enter), mostra imediatamente a lista completa
    else {
      await showFullList();
    }
    return;
  }

  // 1 resultado + submit → carrega direto
  if (matches.length === 1 && autoLoad) {
    loadContent(matches[0]);
    return;
  }

  // Se resultados aparecem, cancela fallback
  clearTimeout(fallbackTimer);

  // vários resultados → lista com destaque e low-relevance
  results.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'result-list';

  for (const item of matches) {
    const li  = document.createElement('li');
    const btn = document.createElement('button');

    // marca baixa relevância
    if (item._lowRelev) btn.classList.add('low-relevance');

    btn.innerHTML = `
      ${highlight(item.title, raw)}
      <span style="font-weight:normal">(pg. ${item.page})</span>
    `;
    btn.addEventListener('click', () => loadContent(item));
    li.appendChild(btn);
    ul.appendChild(li);
  }

  results.appendChild(ul);
}


export { };
