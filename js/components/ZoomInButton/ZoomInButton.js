// js/components/ZoomInButton/ZoomInButton.js

function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/ZoomInButton/ZoomInButton.css');

export class ZoomInButton {
  constructor({ onZoom }) {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.title = 'Aumentar fonte';
    this.button.textContent = '+';
    this.button.className = 'zoom-in-btn';

    this.button.addEventListener('click', () => {
      if (onZoom) onZoom(+2);
    });
  }
}

