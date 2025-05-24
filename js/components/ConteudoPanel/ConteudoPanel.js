import { TitleBar } from '../TitleBar/TitleBar.js';
import { Controls } from '../Controls/Controls.js';   
import { LyricsPanel } from '../LyricsPanel/LyricsPanel.js';

export class ConteudoPanel {
  constructor({ title, page, lyrics, controlsProps, lang = 'default' }) {
    this.container = document.createElement('div');
    this.container.className = 'conteudo-panel';

    // Controls (cria primeiro para passar ao TitleBar)
    const controls = new Controls(controlsProps);

    // TitleBar
    const titleBar = new TitleBar({
      title,
      page,
      controls
    });

    // LyricsPanel, agora passando lang para direção inicial
    this.lyricsPanel = new LyricsPanel({ lines: lyrics, lang });
    // já recebe lang corretamente

    this.container.append(titleBar.element, this.lyricsPanel.element);
  }

  get element() {
    return this.container;
  }
}
