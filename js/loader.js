// js/loader.js
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle.js';
import { ShareButton } from './components/ShareButton/ShareButton.js';
import { FullscreenToggle } from './components/FullscreenToggle/FullscreenToggle.js';


// Importe outros componentes depois...

document.addEventListener('DOMContentLoaded', () => {
  new ThemeToggle(); 
  new ShareButton();
  new FullscreenToggle();
});

export const fullscreenToggle = new FullscreenToggle();
