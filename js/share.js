// js/share.js

/**
 * Mensagem padrão que será enviada junto com o link.
 */
const DEFAULT_MESSAGE =
  'Não tem um Sidur em mãos? Prefere acompanhar pelo celular? ' +
  'Este aplicativo foi feito para você! Tenha acesso prático e intuitivo cânticos litúgicos.';

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
      await navigator.share({ title, text, url });
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
 * - tenta carregar o ícone PNG
 * - em onerror, usa emoji de fallback
 * - adiciona listener de click para sharePage()
 */
function initShareButton(buttonId = 'share-button') {
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    // Caminho absoluto ao ícone (ajuste se necessário)
    const iconPath = '/img/icons/compartilhar.png';
    const img = new Image();
    img.src = iconPath;
    img.alt = 'Compartilhar';
    img.style.width  = '1.5rem';
    img.style.height = '1.5rem';

    img.onload = () => {
      // substitui qualquer texto existente pelo <img>
      btn.textContent = '';
      btn.appendChild(img);
    };

    img.onerror = () => {
      // fallback para emoji
      btn.textContent = '➡️';
    };

    // clique dispara compartilhamento
    btn.addEventListener('click', sharePage);
  });
}

// inicializa automaticamente
initShareButton();

// exportações opcionais
export { sharePage, initShareButton };
