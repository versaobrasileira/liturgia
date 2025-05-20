// js/components/ContentDisplayPanel/ContentDisplayPanel.js

function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/ContentDisplayPanel/ContentDisplayPanel.css');

import { ConteudoPanel } from '../ConteudoPanel/ConteudoPanel.js';
import { fullscreenToggle } from '../../loader.js';

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
    this.clear();
    this.setMessage('Carregando…');

    // Aplica/remover fullscreen
    if (fullscreenToggle?.fsMode) document.body.classList.add('fullscreen-mode');
    else document.body.classList.remove('fullscreen-mode');

    let data;
    try {
      const res = await fetch(`./content/${item.file}`);
      if (!res.ok) throw new Error(res.status);
      data = await res.json();
    } catch (err) {
      console.error(err);
      this.setMessage(`Erro ao carregar "${item.title}".`);
      return;
    }

    // Instancia o painel de conteúdo (Componente inteligente)
    this.conteudoPanel = new ConteudoPanel({
      title: data.title,
      page: data.page,
      lyrics: data.lyrics,
      controlsProps: {
        langDropdownProps: {
          item,
          onLanguageChange: async (fname, lang) => {
            try {
              const res = await fetch(`./content/${fname}`);
              const data = await res.json();
              this.conteudoPanel.lyricsPanel.updateLyrics(data.lyrics);
            } catch (err) {
              console.error('Erro ao trocar idioma:', err);
              this.setMessage('Erro ao trocar idioma.');
            }
          }
        },
        onZoom: (delta) => this.conteudoPanel.lyricsPanel.changeFontSize(delta),
      }
    });

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
