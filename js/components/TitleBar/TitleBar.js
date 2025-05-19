// js/components/TitleBar/TitleBar.js

function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/TitleBar/TitleBar.css');

export class TitleBar {
  constructor({ title, page, controls }) {
    this.container = document.createElement('div');
    this.container.className = 'title-bar';

    // Título + subtítulo agrupados
    const titleText = document.createElement('div');
    titleText.className = 'title-text';

    const h2 = document.createElement('h2');
    h2.textContent = title;

    const sub = document.createElement('div');
    sub.className = 'subtitle';
    sub.textContent = `pg. ${page}`;

    titleText.append(h2, sub);

    // Organiza em linha
    this.container.append(titleText, controls.element);
  }

  get element() {
    return this.container;
  }
}
