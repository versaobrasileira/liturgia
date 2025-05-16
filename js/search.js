// js/search.js
// lida com o form, busca “ao digitar” e listagem de opções,
// mas só abre o conteúdo automaticamente via botão de buscar.

import { loadContent } from './content.js';

const form    = document.getElementById('search-form');
const input   = document.getElementById('search-input');
const button  = document.getElementById('search-button');
const results = document.getElementById('results');

/**
 * Mapa de sinônimos “especiais” para YHWH (valores em CAIXA ALTA).
 */
const synonymsMap = {
  hashem:               'YHWH',
  adonai:               'YHWH',
};

/** Remove acentos, diacríticos e apóstrofos, e põe em lowercase */
function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`‘‛]/g, '')
    .toLowerCase();
}

/** Aplica sinônimo (se existir) ou retorna normalizado */
function applySynonym(norm) {
  const key = norm.replace(/\s+/g, '');
  return synonymsMap[key] || norm;
}

/** Distância de Levenshtein para permitir até 1 erro */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/** Estado inicial: botão desabilitado */
button.disabled = true;

/**
 * Sempre que o usuário digita:
 * - habilita/desabilita botão,
 * - limpa resultados e display,
 * - dispara busca (sem auto-load do conteúdo).
 */
input.addEventListener('input', () => {
  const v = input.value.trim();
  button.disabled = v.length < 2;

  // limpa antigos resultados e esconde display
  results.innerHTML = '';
  document.getElementById('content-display').classList.remove('visible');
  document.body.classList.remove('content-open');

  if (v.length >= 2) {
    performSearch(false);
  }
});

/**
 * Ao submeter (clicar no botão Buscar):
 * - faz a mesma busca, mas com autoLoad = true
 *   permitindo carregar o conteúdo se houver 1 resultado.
 */
form.addEventListener('submit', async e => {
  e.preventDefault();
  performSearch(true);
});

/**
 * Faz a busca no índice e renderiza a lista de resultados.
 * Se autoLoad=true e houver exatamente 1 resultado, chama loadContent().
 *
 * @param {boolean} autoLoad
 */
async function performSearch(autoLoad) {
  const raw = input.value.trim();
  results.innerHTML = '';
  document.getElementById('content-display').classList.remove('visible');
  document.body.classList.remove('content-open');

  // carrega índice
  let idx;
  try {
    const r = await fetch('./content/index.json');
    if (!r.ok) throw new Error(r.status);
    idx = await r.json();
  } catch {
    results.textContent = 'Erro ao carregar índice.';
    return;
  }

  const isNum = /^\d+$/.test(raw);

  // prepara termo de busca
  const searchNorm = normalize(raw);
  const searchKey  = applySynonym(searchNorm).toLowerCase();

  // filtra itens
  const matches = idx.filter(item => {
    if (isNum) {
      return item.page === raw;
    } else {
      // normaliza e aplica sinônimo ao título
      const titleNorm = normalize(item.title);
      const titleSyn  = applySynonym(titleNorm);

      // testa cada "palavra" do título
      return titleSyn
        .split(/\s+/)
        .some(w => {
          const lw = w.toLowerCase();
          return (
            lw.includes(searchKey) ||
            levenshtein(lw, searchKey) <= 1
          );
        });
    }
  });

  // renderiza UI conforme quantidade de matches
  if (!matches.length) {
    results.textContent = 'Nenhum resultado encontrado.';
  } else if (matches.length === 1 && autoLoad) {
    loadContent(matches[0]);
  } else {
    const ul = document.createElement('ul');
    ul.className = 'result-list';
    matches.forEach(item => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = `${item.title} (pg. ${item.page})`;
      btn.addEventListener('click', () => loadContent(item));
      li.append(btn);
      ul.append(li);
    });
    results.append(ul);
  }
}
