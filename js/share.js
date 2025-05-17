// js/share.js

const btn = document.getElementById('share-button');

btn.addEventListener('click', async () => {
  const url   = window.location.href;
  const title = document.title;
  try {
    if (navigator.share) {
      // Web Share API (Chrome Mobile, Safari iOS, etc.)
      await navigator.share({ title, url });
    } else {
      // fallback para WhatsApp Web
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        title + ' - ' + url
      )}`;
      window.open(whatsappUrl, '_blank');
    }
  } catch (err) {
    console.error('Erro ao compartilhar:', err);
  }
});
