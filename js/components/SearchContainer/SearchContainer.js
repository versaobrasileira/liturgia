// js/components/SearchContainer/SearchContainer.js

import { SearchEngine, loadIndex } from './search/engine.js';
import { SearchForm } from '../SearchForm/SearchForm.js';
import { ResultsPanel } from '../ResultsPanel/ResultsPanel.js';
import { ContentDisplayPanel } from '../ContentDisplayPanel/ContentDisplayPanel.js';


// js/components/SearchContainer/SearchContainer.js

function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/SearchContainer/SearchContainer.css');


export class SearchContainer {
  constructor() {
    this.engine = new SearchEngine();
    this.indexData = null;
    this.noResultTimer = null;
    this.fallbackTimer = null;

    // Cria o container
    this.container = document.createElement('div');
    this.container.className = 'search-container';

    // Título
    this.title = document.createElement('h1');
    this.title.textContent = 'LITURGIA';

    // Subcomponentes
    this.searchForm = new SearchForm();
    this.resultsPanel = new ResultsPanel();
    this.contentDisplayPanel = new ContentDisplayPanel();

    // Monta estrutura
    this.container.append(
      this.title,
      this.searchForm.element,
      this.resultsPanel.element,
      this.contentDisplayPanel.element
    );

    // Eventos de busca
    this.searchForm.element.addEventListener('searchinput', () => this.onInput());
    this.searchForm.element.addEventListener('searchsubmit', () => this.onSubmit());

    // Inicialmente só mostra form/result
    this.resultsPanel.clear();
    this.contentDisplayPanel.clear();
  }

  async ensureIndex() {
    if (!this.indexData) {
      try {
        this.indexData = await loadIndex();
      } catch (err) {
        console.error("Erro ao carregar índice:", err);
        this.resultsPanel.setMessage('Erro ao carregar índice.');
        return false;
      }
    }
    return true;
  }

  async showFullList() {
    if (!(await this.ensureIndex())) return;
    clearTimeout(this.noResultTimer);

    let matches;
    try {
      matches = await this.engine.search('');
    } catch (err) {
      this.resultsPanel.setMessage('Erro ao calcular relevância.');
      return;
    }
    this.resultsPanel.setList(matches, {
      onClick: item => {
        this.resultsPanel.clear();          // <-- isso garante sumir a lista!
        this.contentDisplayPanel.showItem(item);
      }
    });
  }

  onInput() {
    const v = this.searchForm.value.trim();
    clearTimeout(this.noResultTimer);
    this.resultsPanel.clear();
    this.contentDisplayPanel.clear();

    if (v.length >= 2) {
      this.noResultTimer = setTimeout(() => this.showFullList(), 3000);
      this.performSearch(false);
    }
  }

  onSubmit() {
    clearTimeout(this.noResultTimer);
    this.performSearch(true);
  }

  async performSearch(autoLoad) {
  const raw = this.searchForm.value.trim();
  this.contentDisplayPanel.clear();
  clearTimeout(this.noResultTimer);
  clearTimeout(this.fallbackTimer);

  this.resultsPanel.setMessage('<span class="loading">Buscando...</span>');

  let matches;
  try {
    matches = await this.engine.search(raw);
  } catch (err) {
    console.error("Erro no search:", err);
    this.resultsPanel.setMessage('Erro na busca.');
    return;
  }

  if (matches.length === 0) {
    this.resultsPanel.setMessage('Nenhum resultado encontrado.');
    if (!autoLoad) {
      this.fallbackTimer = setTimeout(() => this.showFullList(), 2000);
    } else {
      await this.showFullList();
    }
    return;
  }

  if (matches.length === 1 && autoLoad) {
    this.resultsPanel.clear(); // <-- ADICIONADO!
    this.contentDisplayPanel.showItem(matches[0]);
    return;
  }

  clearTimeout(this.fallbackTimer);

  this.resultsPanel.setList(matches, {
    onClick: item => {
      this.resultsPanel.clear(); // <-- ADICIONADO!
      this.contentDisplayPanel.showItem(item);
    },
    highlightTerm: raw,
  });
}

  // Para inserir na página
  get element() { return this.container; }
}
