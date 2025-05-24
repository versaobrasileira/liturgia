// js/components/ContentDisplayPanel/ContentDisplayPanel.js

import { ConteudoPanel } from '../ConteudoPanel/ConteudoPanel.js';
import { resultsPanel } from '../ResultsPanel/ResultsPanel.js';
import { loadContent } from '../SearchContainer/search/engine.js'; 

function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/ContentDisplayPanel/ContentDisplayPanel.css');

export class ContentDisplayPanel {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'content-display';
    this.container.className = '';
    this.conteudoPanel = null;
  }

  /**
   * Recebe o item (com .file, .title, .hebrew, .portuguese...) e carrega/exibe o conteúdo
   */
  async showItem(item) {
    resultsPanel.hide();
    this.clear();
    this.setMessage('Carregando…');

    let data, lang = 'default';
    try {
      data = await loadContent(item.file);  // ← pega do all.json em memória
      if (!data) throw new Error('Arquivo não encontrado no all.json');
      // Detecta o idioma inicial
      if (item.file && item.hebrew && item.file === item.hebrew) lang = 'hebrew';
      else if (item.file && item.portuguese && item.file === item.portuguese) lang = 'portuguese';
      else lang = 'default';
    } catch (err) {
      console.error(err);
      this.setMessage(`Erro ao carregar "${item.title}".`);
      return;
    }

    this.conteudoPanel = new ConteudoPanel({
      title: data.title,
      page: data.page,
      lyrics: data.lyrics,
      lang: lang, // <- importante: envia idioma inicial
      controlsProps: {
        langDropdownProps: {
          item,
          onLanguageChange: async (fname, lang) => {
            try {
              const dataLang = await loadContent(fname); 
              if (!dataLang) throw new Error('Arquivo não encontrado no all.json');
              this.conteudoPanel.lyricsPanel.updateLyrics(dataLang.lyrics);
              // Atualiza a direção do texto
              this.conteudoPanel.lyricsPanel.setDirection(lang);
            } catch (err) {
              console.error('Erro ao trocar idioma:', err);
              this.setMessage('Erro ao trocar idioma.');
            }
          }
        },
        onZoom: (delta) => this.conteudoPanel.lyricsPanel.changeFontSize(delta),
      }
    });

    // Sempre seta direção inicial ao abrir conteúdo (cobre reuso)
    this.conteudoPanel.lyricsPanel.setDirection(lang);

    this.setContent(this.conteudoPanel.element);
  }

  setContent(child) {
    this.clear();
    if (child) this.container.appendChild(child);
    this.container.classList.add('visible');
    document.body.classList.add('content-open');
  }

  setMessage(msg) {
    this.clear();
    this.container.innerHTML = `<div class="content-message">${msg}</div>`;
    this.container.classList.add('visible');
    document.body.classList.add('content-open');
  }

  clear() {
    this.container.innerHTML = '';
    this.container.classList.remove('visible');
    document.body.classList.remove('content-open');
  }

  get element() {
    return this.container;
  }
}

export const contentDisplayPanel = new ContentDisplayPanel();
