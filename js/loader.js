// js/loader.js

import { ThemeToggle } from './components/ThemeToggle/ThemeToggle.js';
import { ShareButton } from './components/ShareButton/ShareButton.js';
import { Fullscreen } from './components/Fullscreen/Fullscreen.js';   
import { SearchContainer } from './components/SearchContainer/SearchContainer.js';

// Instâncias dos controles (apenas se precisar usar fora)
// let themeToggle, shareButton, fullscreen;
let themeToggle, shareButton, fullscreen;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Botões globais
  themeToggle = new ThemeToggle();
  shareButton = new ShareButton();

  // 2. Modo tela cheia (responsabilidade do componente Fullscreen.js)
  fullscreen = new Fullscreen();

  // 3. Monta SearchContainer no ponto principal
  const main = document.getElementById('search-main');
  const container = new SearchContainer();
  main.appendChild(container.element);
});


