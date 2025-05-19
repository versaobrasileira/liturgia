// js/content.js
import { fullscreenToggle }  from './loader.js';
import { ConteudoPanel }     from './components/ConteudoPanel/ConteudoPanel.js';

let conteudoPanel = null;

export async function loadContent(item) {
  const results = document.getElementById('results');
  const display = document.getElementById('content-display');

  document.body.classList.remove('content-open');
  results.innerHTML = '';
  display.innerHTML = '';
  display.classList.remove('visible');
  document.body.classList.add('content-open');

  if (fullscreenToggle?.fsMode) document.body.classList.add('fullscreen-mode');

  // fetch
  let data;
  try {
    const res = await fetch(`./content/${item.file}`);
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch (err) {
    console.error(err);
    display.textContent = `Erro ao carregar "${item.title}".`;
    display.classList.add('visible');
    return;
  }

  // Monta o painel inteiro
  conteudoPanel = new ConteudoPanel({
    title: data.title,
    page: data.page,
    lyrics: data.lyrics,
    controlsProps: {
      langDropdownProps: {
        item,  
        onLanguageChange: async (fname, lang) => {
          try {
            const res = await fetch(`./content/${fname}`);
            const data = await res.json();
            conteudoPanel.lyricsPanel.updateLyrics(data.lyrics);
            // se precisar: ajustar fonte aqui!
          } catch (err) {
            console.error('Erro ao trocar idioma:', err);
          }
        }
      },
      onZoom: (delta) => conteudoPanel.lyricsPanel.changeFontSize(delta),
    }
  });

  display.append(conteudoPanel.element);
  display.classList.add('visible');
  document.body.classList.add('content-open');
  fullscreenToggle?.updateFsUI();
}


