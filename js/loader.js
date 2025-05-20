// js/loader.js

import { ThemeToggle } from './components/ThemeToggle/ThemeToggle.js';
import { ShareButton } from './components/ShareButton/ShareButton.js';
import { FullscreenToggle } from './components/FullscreenToggle/FullscreenToggle.js';
import { resultsPanel } from './components/ResultsPanel/ResultsPanel.js';
import { contentDisplayPanel } from './components/ContentDisplayPanel/ContentDisplayPanel.js';

// Instâncias globais únicas dos controles de UI fixos
let themeToggle, shareButton;
export const fullscreenToggle = new FullscreenToggle();

// Setup inicial do DOM assim que o documento está pronto
document.addEventListener('DOMContentLoaded', () => {
  themeToggle = new ThemeToggle();
  shareButton = new ShareButton();

  // Substitui o <div id="results"> pelo painel de resultados, se necessário
  const resultsDiv = document.getElementById('results');
  if (resultsDiv && resultsDiv !== resultsPanel.element) {
    resultsDiv.replaceWith(resultsPanel.element);
  }

  // Substitui o <div id="content-display"> pelo painel de conteúdo, se necessário
  const displayDiv = document.getElementById('content-display');
  if (displayDiv && displayDiv !== contentDisplayPanel.element) {
    displayDiv.replaceWith(contentDisplayPanel.element);
  }
});

// Exporta também os painéis para uso em outros módulos, se necessário
export { resultsPanel, contentDisplayPanel };
