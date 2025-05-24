// js/components/SearchForm/SearchForm.js

function injectCss(path) {
  if (!document.querySelector(`link[href="${path}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }
}
injectCss('/js/components/SearchForm/SearchForm.css');

export class SearchForm {
  constructor() {
    this.form = document.createElement('form');
    this.form.className = 'search-form';
    this.form.id = 'search-form';

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = ' Digite nº da página ou termo…';
    this.input.id = 'search-input';

    this.form.append(this.input);

    this.input.addEventListener('input', () => {
      this.form.dispatchEvent(new CustomEvent('searchinput', {
        detail: { value: this.input.value }
      }));
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.form.dispatchEvent(new CustomEvent('searchsubmit', {
        detail: { value: this.input.value }
      }));
    });
  }

  clear() { this.input.value = ''; }
  focus() { this.input.focus(); }
  get value() { return this.input.value; }
  set value(v) { this.input.value = v; }
  get element() { return this.form; }
}
