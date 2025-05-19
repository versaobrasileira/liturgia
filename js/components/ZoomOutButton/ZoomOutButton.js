// js/components/ZoomOutButton/ZoomOutButton.js

function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}

injectCss('/js/components/ZoomOutButton/ZoomOutButton.css');

export class ZoomOutButton {
  constructor({ container, onZoom }) {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.title = 'Diminuir fonte';
    this.button.textContent = '–';
    this.button.className = 'zoom-out-btn';

    // Callback ao clicar
    this.button.addEventListener('click', () => {
      if (onZoom) onZoom(-2);
    });

    // Adiciona no container fornecido
    if (container) container.appendChild(this.button);
  }
}
