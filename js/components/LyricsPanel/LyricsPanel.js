// js/components/LyricsPanel/LyricsPanel.js

function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/LyricsPanel/LyricsPanel.css');

import { fontConfig } from '../../fontConfig.js';

export class LyricsPanel {
  constructor({ lines }) {
    // Cria o container rolável
    this.scroll = document.createElement('div');
    this.scroll.className = 'content-scroll';

    // Cria o container das letras
    this.lyricsContainer = document.createElement('div');
    this.lyricsContainer.className = 'lyrics-container';

    // Popula as linhas
    this.populateLyrics(lines);

    this.scroll.append(this.lyricsContainer);

    // Inicializa o tamanho da fonte
    this.currentFontSize = null;
    this.adjustFontSize();

    // Recalcula fonte ao redimensionar
    window.addEventListener('resize', () => {
      if (this.lyricsContainer && this.lyricsContainer.isConnected) {
        this.adjustFontSize();
      }
    });
  }

  populateLyrics(lines) {
    this.lyricsContainer.innerHTML = '';
    let blockContainer = null;

    lines.forEach(rawLine => {
      const line = rawLine.trim();
      const open = /^\s*<estrofe\s+r=(?:\[(.+?)\]|([^\]\s>]+))>\s*$/i.exec(line);
      if (open) {
        const labelText = open[1] || open[2];
        blockContainer = document.createElement('div');
        blockContainer.className = 'est-block';
        blockContainer.dataset.repeat = labelText;

        const label = document.createElement('div');
        label.className = 'est-label';
        label.textContent = labelText;
        blockContainer.append(label);

        this.lyricsContainer.append(blockContainer);
        return;
      }

      if (/^<\/estrofe>\s*$/i.test(line)) {
        blockContainer = null;
        return;
      }

      const p = document.createElement('p');
      p.textContent = rawLine;
      if (blockContainer) blockContainer.append(p);
      else                this.lyricsContainer.append(p);
    });
    this.adjustFontSize(); // Ajusta fonte sempre que atualiza linhas
  }

  updateLyrics(lines) {
    this.populateLyrics(lines);
    this.adjustFontSize();
  }

  adjustFontSize() {
    const container = this.lyricsContainer;
    if (!container) return;
    const paras = Array.from(container.querySelectorAll('p'));
    if (!paras.length) return;
    container.style.fontSize = '';
    const style = getComputedStyle(container);
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
    this.currentFontSize = newSize;
  }

  changeFontSize(delta) {
    const container = this.lyricsContainer;
    if (!container) return;
    let size = this.currentFontSize || parseFloat(getComputedStyle(container).fontSize);
    size = Math.max(fontConfig.minFontSize,
                    Math.min(fontConfig.maxFontSize, size + delta));
    container.style.fontSize = `${size}px`;
    this.currentFontSize = size;
  }

  get element() {
    return this.scroll;
  }
}
