// js/components/ResultsPanel/ResultsPanel.js

function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/ResultsPanel/ResultsPanel.css');

export class ResultsPanel {
  constructor({ items = [], onSelect, highlightFn } = {}) {
    this.container = document.createElement('div');
    this.container.className = 'results-panel';
    this.onSelect = onSelect || (() => {});
    this.highlightFn = highlightFn || ((t) => t);
    this.update(items);
  }

  update(items = [], raw = '') {
    this.container.innerHTML = '';
    if (!items || !items.length) return;

    const ul = document.createElement('ul');
    ul.className = 'result-list';
    for (const item of items) {
      const li  = document.createElement('li');
      const btn = document.createElement('button');
      btn.innerHTML = this.highlightFn(item.title, raw) +
        ` <span style="font-weight:normal">(pg. ${item.page})</span>`;
      if (item._lowRelev) btn.classList.add('low-relevance');
      btn.addEventListener('click', () => this.onSelect(item));
      li.appendChild(btn);
      ul.appendChild(li);
    }
    this.container.appendChild(ul);
  }

  setMessage(msg) {
    this.container.innerHTML = `<div class="results-msg">${msg}</div>`;
  }

  clear() {
    this.container.innerHTML = '';
  }

  get element() {
    return this.container;
  }
}
