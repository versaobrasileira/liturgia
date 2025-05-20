// js/components/Fullscreen/Fullscreen.js
import { FullscreenToggle } from '../FullscreenToggle/FullscreenToggle.js';

export class Fullscreen {
  constructor() {
    this.toggleBtn = new FullscreenToggle();

    // Adiciona ao body (ou outro container, se preferir)
    document.body.appendChild(this.toggleBtn.element);

    // Listener para toggle (controle centralizado)
    this.toggleBtn.onToggle = (active) => {
      this.setFullscreen(active);
    };

    this.observeBodyClass();

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isFullscreen) {
        this.setFullscreen(false);
      }
    });
  }

  setFullscreen(active) {
    this.isFullscreen = !!active;
    document.body.classList.toggle('fullscreen-mode', this.isFullscreen);
    this.toggleBtn.setActive(this.isFullscreen);
  }

  observeBodyClass() {
    // Garante sincronização se body for alterado por fora
    const observer = new MutationObserver(() => {
      const isFull = document.body.classList.contains('fullscreen-mode');
      this.isFullscreen = isFull;
      this.toggleBtn.setActive(isFull);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
}

  
