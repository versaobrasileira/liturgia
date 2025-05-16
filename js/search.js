// js/search.js
// cuida do form, filtragem do índice e listagem de resultados

import { loadContent } from './content.js';

const form    = document.getElementById('search-form');
const input   = document.getElementById('search-input');
const button  = document.getElementById('search-button');
const results = document.getElementById('results');

button.disabled = true;

input.addEventListener('input', () => {
  const v = input.value.trim();
  button.disabled = v.length < 2;

  // limpa resultados e esconde conteúdo
  results.innerHTML = '';
  document.getElementById('content-display').classList.remove('visible');

  // faz o <h1> Liturgia reaparecer
  document.body.classList.remove('content-open');
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  document.body.classList.remove('content-open'); // garante título

  const q = input.value.trim();
  results.innerHTML = '';
  document.getElementById('content-display').classList.remove('visible');

  let idx;
  try {
    const r = await fetch('./content/index.json');
    if (!r.ok) throw '';
    idx = await r.json();
  } catch {
    results.textContent = 'Erro ao carregar índice.';
    return;
  }

  const isNum = /^\d+$/.test(q);
  const matches = idx.filter(item =>
    isNum
      ? item.page === q
      : item.title.toLowerCase().includes(q.toLowerCase())
  );

  if (!matches.length) {
    results.textContent = 'Nenhum resultado encontrado.';
  } else if (matches.length === 1) {
    loadContent(matches[0]);
  } else {
    const ul = document.createElement('ul');
    ul.className = 'result-list';
    matches.forEach(item => {
      const li = document.createElement('li');
      const btn= document.createElement('button');
      btn.textContent = `${item.title} (pg. ${item.page})`;
      btn.onclick = () => loadContent(item);
      li.append(btn);
      ul.append(li);
    });
    results.append(ul);
  }
});
