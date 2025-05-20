// js/components/LangDropdown/LangDropdown.js

function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/LangDropdown/LangDropdown.css');

const FLAG_SVGS = {
  default: `<span class="lang-default">TL</span>`,
  hebrew: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 32 22">
      <rect width="32" height="22" fill="#fff"/>
      <rect y="1" width="32" height="4" fill="#005eb8"/>
      <rect y="17" width="32" height="4" fill="#005eb8"/>
      <polygon points="16,7 20,14 12,14" fill="none" stroke="#005eb8" stroke-width="1.5"/>
      <polygon points="16,15 20,8 12,8" fill="none" stroke="#005eb8" stroke-width="1.5"/>
    </svg>
  `,
  portuguese: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 32 22">
      <rect width="32" height="22" fill="#3eae46"/>
      <polygon points="16,3 29,11 16,19 3,11" fill="#ffd700"/>
      <ellipse cx="16" cy="11" rx="6" ry="6.5" fill="#2f3789"/>
      <path d="M10.8 12c2-1.2 8.3-1.4 10.4 0" stroke="#fff" stroke-width="1.2" fill="none"/>
    </svg>
  `
};

export class LangDropdown {
  constructor({ item, onLanguageChange } = {}) {
    this.item = item || {};
    this.onLanguageChange = onLanguageChange;

    // Cria o dropdown
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'lang-dropdown';
    this.dropdown.innerHTML = `
      <button class="lang-btn" title="Idioma">
        ${FLAG_SVGS.default}
      </button>
      <ul class="lang-list" hidden>
        ${item.file ? `<li data-lang="default">${FLAG_SVGS.default}</li>` : ''}
        ${item.hebrew     ? `<li data-lang="hebrew">${FLAG_SVGS.hebrew}</li>` : ''}
        ${item.portuguese ? `<li data-lang="portuguese">${FLAG_SVGS.portuguese}</li>` : ''}
      </ul>
    `;

    this.btn = this.dropdown.querySelector('.lang-btn');
    this.list = this.dropdown.querySelector('.lang-list');
    this.currentSVG = FLAG_SVGS.default;

    // Conta opções visíveis (li) para saber se mostra dropdown
    this.optionCount = this.list.querySelectorAll('li').length;

    // Só abre dropdown se há mais de uma opção
    this.btn.addEventListener('click', e => {
      e.stopPropagation();
      if (this.optionCount <= 1) return;
      if (this.list.hidden) this.openDropdown();
      else                  this.closeDropdown();
    });

    // Fecha dropdown ao clicar fora
    document.addEventListener('click', e => {
      if (!this.dropdown.contains(e.target)) {
        this.closeDropdown();
      }
    });

    // Clique em uma opção do menu
    this.list.addEventListener('click', async e => {
      const li = e.target.closest('li');
      if (!li) return;
      const sel = li.dataset.lang;
      this.closeDropdown();

      // Atualiza ícone
      this.currentSVG = FLAG_SVGS[sel] || FLAG_SVGS.default;
      this.btn.innerHTML = this.currentSVG;

      // Define arquivo conforme idioma
      let fname = item.file;
      if (sel === 'hebrew') fname = item.hebrew;
      else if (sel === 'portuguese') fname = item.portuguese;

      if (this.onLanguageChange) {
        this.onLanguageChange(fname, sel);
      }
    });
  }

  openDropdown() {
    this.list.hidden = false;
    this.btn.style.visibility = 'hidden';
    this.dropdown.classList.add('open');
  }
  closeDropdown() {
    this.list.hidden = true;
    this.btn.style.visibility = '';
    this.btn.innerHTML = this.currentSVG;
    this.dropdown.classList.remove('open');
  }

  get element() {
    return this.dropdown;
  }
}
