// js/search-ui.js

import { SearchEngine, loadIndex } from './search/engine.js';
import { resultsPanel } from './components/ResultsPanel/ResultsPanel.js';
import { contentDisplayPanel } from './components/ContentDisplayPanel/ContentDisplayPanel.js';

const form    = document.getElementById('search-form');
const input   = document.getElementById('search-input');
const button  = document.getElementById('search-button');

// Substitui <div id="results"> por resultsPanel.element
const resultsDiv = document.getElementById('results');
if (resultsDiv && resultsDiv !== resultsPanel.element) {
  resultsDiv.replaceWith(resultsPanel.element);
}

// Substitui <div id="content-display"> por contentDisplayPanel.element
const displayDiv = document.getElementById('content-display');
if (displayDiv && displayDiv !== contentDisplayPanel.element) {
  displayDiv.replaceWith(contentDisplayPanel.element);
}

const engine      = new SearchEngine();
let indexData     = null;
let noResultTimer = null;
let fallbackTimer = null;

// Carrega índice se necessário
async function ensureIndex() {
  if (!indexData) {
    try {
      indexData = await loadIndex();
    } catch (err) {
      console.error("Erro ao carregar índice:", err);
      resultsPanel.setMessage('Erro ao carregar índice.');
      return;
    }
  }
}

// Lista todos os itens ordenados (fallback/lista completa)
async function showFullList() {
  await ensureIndex();
  clearTimeout(noResultTimer);

  let matches;
  try {
    matches = await engine.search('');
  } catch (err) {
    resultsPanel.setMessage('Erro ao calcular relevância.');
    return;
  }

  resultsPanel.setList(matches, {
    onClick: item => contentDisplayPanel.showItem(item),
  });
}

// busca ao digitar
button.disabled = true;
input.addEventListener('input', () => {
  const v = input.value.trim();
  button.disabled = v.length < 2;
  clearTimeout(noResultTimer);
  resultsPanel.clear();
  contentDisplayPanel.clear();

  if (v.length >= 2) {
    noResultTimer = setTimeout(showFullList, 3000);
    performSearch(false);
  }
});

// busca no submit (Enter/clicar)
form.addEventListener('submit', e => {
  e.preventDefault();
  clearTimeout(noResultTimer);
  performSearch(true);
});

async function performSearch(autoLoad) {
  const raw = input.value.trim();
  contentDisplayPanel.clear();
  clearTimeout(noResultTimer);
  clearTimeout(fallbackTimer);

  resultsPanel.setMessage('<span class="loading">Buscando...</span>');

  let matches;
  try {
    matches = await engine.search(raw);
  } catch (err) {
    console.error("Erro no search:", err);
    resultsPanel.setMessage('Erro na busca.');
    return;
  }

  if (matches.length === 0) {
    resultsPanel.setMessage('Nenhum resultado encontrado.');
    if (!autoLoad) {
      fallbackTimer = setTimeout(async () => {
        await showFullList();
      }, 2000);
    } else {
      await showFullList();
    }
    return;
  }

  if (matches.length === 1 && autoLoad) {
    contentDisplayPanel.showItem(matches[0]);
    return;
  }

  clearTimeout(fallbackTimer);

  resultsPanel.setList(matches, {
    onClick: item => contentDisplayPanel.showItem(item),
    highlightTerm: raw,
  });
}

export { };
