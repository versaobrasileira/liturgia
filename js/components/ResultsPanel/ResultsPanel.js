// js/components/ResultsPanel/ResultsPanel.js

export class ResultsPanel {
  constructor() {
    this.element = document.createElement('div');
    this.element.id = 'results';
    this.element.className = 'results-panel';
  }

  // Limpa o painel
  clear() {
    this.element.innerHTML = '';
    this.hide();
  }

  // Exibe mensagem simples
  setMessage(msg) {
    this.element.innerHTML = `<div class="results-message">${msg}</div>`;
    this.show();
  }

  // Exibe lista de itens (array de objetos)
  setList(items, { onClick, highlightTerm = '' } = {}) {
    this.clear();
    if (!items?.length) {
      this.setMessage('Nenhum resultado encontrado.');
      return;
    }
    const ul = document.createElement('ul');
    ul.className = 'result-list';

    for (const item of items) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      // Destaque termo se solicitado
      let titleHtml = item.title;
      if (highlightTerm && highlightTerm.length >= 2) {
        const esc = highlightTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        titleHtml = titleHtml.replace(new RegExp(esc, 'gi'), m => `<strong>${m}</strong>`);
      }
      btn.innerHTML = `
        ${titleHtml}
        <span style="font-weight:normal">(pg. ${item.page})</span>
      `;
      if (item._lowRelev) btn.classList.add('low-relevance');
      btn.addEventListener('click', () => onClick?.(item));
      li.appendChild(btn);
      ul.appendChild(li);
    }
    this.element.appendChild(ul);
    this.show();
  }

  show() {
    this.element.style.display = '';
  }
  hide() {
    this.element.style.display = 'none';
  }
}

// Exporta instância única para toda a app
export const resultsPanel = new ResultsPanel();
