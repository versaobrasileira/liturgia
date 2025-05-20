// js/loader.js

import { ThemeToggle } from './components/ThemeToggle/ThemeToggle.js';
import { ShareButton } from './components/ShareButton/ShareButton.js';
import { FullscreenToggle } from './components/FullscreenToggle/FullscreenToggle.js';
import { SearchContainer } from './components/SearchContainer/SearchContainer.js';

// Instâncias globais de toggles
let themeToggle, shareButton;
export const fullscreenToggle = new FullscreenToggle();

document.addEventListener('DOMContentLoaded', () => {
  // 1. Botões globais
  themeToggle = new ThemeToggle();
  shareButton = new ShareButton();

  // 2. Monta SearchContainer no ponto principal
  const main = document.getElementById('search-main');
  const container = new SearchContainer();
  main.appendChild(container.element);
});
