export let fontConfig = { minFontSize: 20, maxFontSize: 100 };

(async () => {
  try {
    const res = await fetch('./config/fontConfig.json');
    if (res.ok) fontConfig = await res.json();
  } catch {
    console.warn('Usando fontConfig padrão');
  }
})();
