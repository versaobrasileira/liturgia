// js/components/Controls/Controls.js

import { ZoomInButton } from '../ZoomInButton/ZoomInButton.js';
import { ZoomOutButton } from '../ZoomOutButton/ZoomOutButton.js';
import { LangDropdown } from '../LangDropdown/LangDropdown.js';

function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}

export class Controls {
  constructor({ onZoom, langDropdownProps }) {
    // Injeta o CSS deste componente
    injectCss('/js/components/Controls/Controls.css');

    // Cria o container
    this.container = document.createElement('div');
    this.container.className = 'controls';

    // Cria botões de zoom e dropdown
    this.zoomOut = new ZoomOutButton({ onZoom });
    this.zoomIn  = new ZoomInButton({ onZoom });
    this.langDropdown = new LangDropdown(langDropdownProps);

    // Adiciona na ordem correta
    this.container.append(
      this.zoomOut.button,
      this.zoomIn.button,
      this.langDropdown.element
    );
  }

  get element() {
    return this.container;
  }
}
