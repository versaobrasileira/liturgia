import { fullscreenToggle }  from './loader.js';
import { ConteudoPanel }     from './components/ConteudoPanel/ConteudoPanel.js';
import { resultsPanel }      from './components/ResultsPanel/ResultsPanel.js';
import { contentDisplayPanel } from './components/ContentDisplayPanel/ContentDisplayPanel.js';

let conteudoPanel = null;

export async function loadContent(item) {
  // Oculta resultados ao abrir conteúdo
  resultsPanel.clear();

  contentDisplayPanel.clear();
  document.body.classList.add('content-open');
  if (fullscreenToggle?.fsMode) document.body.classList.add('fullscreen-mode');

  let data;
  try {
    const res = await fetch(`./content/${item.file}`);
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch (err) {
    console.error(err);
    contentDisplayPanel.setMessage(`Erro ao carregar "${item.title}".`);
    return;
  }

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

  contentDisplayPanel.setContent(conteudoPanel.element);
  fullscreenToggle?.updateFsUI();
}
