// js/share.js

/**
 * Mensagem padrão que será enviada junto com o link.
 */
const DEFAULT_MESSAGE =
  'Tenha acesso prático e intuitivo a cânticos litúgicos.'+
  '\n';

/**
 * Abre o diálogo de compartilhamento:
 * - usa Web Share API quando disponível
 * - senão, abre WhatsApp Web com mensagem + URL
 */
async function sharePage() {
  const url   = window.location.href;
  const title = document.title;
  const text  = `${DEFAULT_MESSAGE} `;

  if (navigator.share) {
    try {
      await navigator.share({ title, text: `${DEFAULT_MESSAGE}\n${url}` });
    } catch (err) {
      console.error('Compartilhamento cancelado ou falhou:', err);
    }
  } else {
    const msg   = `${text}${url}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  }
}

/**
 * Inicializa o botão de compartilhamento:
 * - adiciona listener de click para sharePage()
 */
function initShareButton(buttonId = 'share-button') {
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    // Apenas adiciona o evento de clique
    btn.addEventListener('click', sharePage);
  });
}


// inicializa automaticamente
initShareButton();

// exportações opcionais
export { sharePage, initShareButton };
