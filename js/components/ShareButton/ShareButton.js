// js/components/ShareButton/ShareButton.js

// Injetor de CSS (ajuste o caminho se necessário)
function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/ShareButton/ShareButton.css');

/**
 * Componente ShareButton: inicializa e lida com click de compartilhamento
 */
export class ShareButton {
  constructor(selector = '#share-button') {
    this.button = document.querySelector(selector);
    if (!this.button) return;

    this.DEFAULT_MESSAGE =
      'Tenha acesso prático e intuitivo a cânticos litúgicos.\n';

    // (Opcional) Adiciona uma classe para estilização customizada
    this.button.classList.add('share-btn');

    // Evento de clique
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      this.sharePage();
    });
  }

  async sharePage() {
    const url   = window.location.href;
    const title = document.title;
    const text  = `${this.DEFAULT_MESSAGE} `;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${this.DEFAULT_MESSAGE}\n${url}` });
      } catch (err) {
        // Cancelado pelo usuário ou erro
        console.error('Compartilhamento cancelado ou falhou:', err);
      }
    } else {
      const msg   = `${text}${url}`;
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    }
  }
}
