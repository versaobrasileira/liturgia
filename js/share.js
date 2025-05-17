// js/share.js

/**
 * Centraliza toda a lógica de compartilhamento de link.
 * Usa a Web Share API quando disponível, ou fallback para WhatsApp.
 */

const DEFAULT_MESSAGE = 'Não tem um Sidur em mãos? Prefere acompanhar pelo celular? Este aplicativo foi feito para você! Tenha acesso prático e intuitivo cânticos litúgicos.';

async function sharePage() {
  const url   = window.location.href;
  const title = document.title;
  const text  = `${DEFAULT_MESSAGE} `;

  // Web Share API nativa
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch (err) {
      console.error('Compartilhamento cancelado ou falhou:', err);
    }
  } else {
    // Fallback para WhatsApp (pode ajustar para outras redes)
    const msg = `${text}${url}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  }
}

function initShareButton(buttonId = 'share-button') {
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.addEventListener('click', sharePage);
  });
}

// Inicializa automaticamente ao importar este módulo
initShareButton();

// Exporta para uso manual, se necessário
export { sharePage, initShareButton };
