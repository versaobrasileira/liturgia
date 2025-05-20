// js/search-ui.js

import { SearchEngine, loadIndex } from './search/engine.js'; 
import { resultsPanel } from './components/ResultsPanel/ResultsPanel.js';
import { contentDisplayPanel } from './components/ContentDisplayPanel/ContentDisplayPanel.js';
import { SearchForm } from './components/SearchForm/SearchForm.js';

// 1. Monta SearchForm (troca no DOM se necessário)
const searchFormDiv = document.getElementById('search-form');
const searchForm = new SearchForm();
if (searchFormDiv && searchFormDiv !== searchForm.element) {
  searchFormDiv.innerHTML = '';
  searchFormDiv.appendChild(searchForm.element);
}

// 2. Substitui ResultsPanel e ContentDisplayPanel no DOM se necessário
const resultsDiv = document.getElementById('results');
if (resultsDiv && resultsDiv !== resultsPanel.element) {
  resultsDiv.replaceWith(resultsPanel.element);
}
const displayDiv = document.getElementById('content-display');
if (displayDiv && displayDiv !== contentDisplayPanel.element) {
  displayDiv.replaceWith(contentDisplayPanel.element);
}

// 3. Instância única da engine
const engine = new SearchEngine();
let indexData = null;
let noResultTimer = null;
let fallbackTimer = null;

// 4. Carrega índice se necessário (cache)
async function ensureIndex() {
  if (!indexData) {
    try {
      indexData = await loadIndex();
    } catch (err) {
      console.error("Erro ao carregar índice:", err);
      resultsPanel.setMessage('Erro ao carregar índice.');
      return false;
    }
  }
  return true;
}

// 5. Exibe lista completa (fallback)
async function showFullList() {
  if (!(await ensureIndex())) return;
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

// 6. Eventos: busca ao digitar
searchForm.element.addEventListener('searchinput', () => {
  const v = searchForm.value.trim();
  clearTimeout(noResultTimer);
  resultsPanel.clear();
  contentDisplayPanel.clear();

  if (v.length >= 2) {
    noResultTimer = setTimeout(showFullList, 3000);
    performSearch(false);
  }
});

// 7. Eventos: busca ao enviar (Enter)
searchForm.element.addEventListener('searchsubmit', () => {
  clearTimeout(noResultTimer);
  performSearch(true);
});

// 8. Função de busca principal
async function performSearch(autoLoad) {
  const raw = searchForm.value.trim();
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
      fallbackTimer = setTimeout(showFullList, 2000);
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
