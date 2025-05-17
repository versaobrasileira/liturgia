// js/search-utils.js

/** Remove acentos, diacríticos e apóstrofos, e põe em lowercase */
export function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`‘‛]/g, '')
    .toLowerCase();
}

/** Mapa de sinônimos “especiais” para YHWH */
const synonymsMap = {
  hashem: 'YHWH',
  adonai: 'YHWH',
};

/** Aplica sinônimo (se existir) ou retorna o próprio norm */
export function applySynonym(norm) {
  // Tokeniza em palavras (usando espaço, hífen ou underline)
  return norm
    .split(/[\s\-_]+/)
    .map(token => synonymsMap[token] || token)
    .join(' ');
}


/** Distância de Levenshtein clássica */
export function levenshtein(a, b) {
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

/**
 * Compara duas strings “limpas” (sem espaços),
 * permitindo 1 erro a cada 4 caracteres de searchKey.
 */
export function isApproxMatch(rawWord, rawKey) {
  const cleanWord = rawWord.replace(/\s+/g, '');
  const cleanKey  = rawKey .replace(/\s+/g, '');

  const allowedErrors = Math.max(1, Math.floor(cleanKey.length / 4));

  if (cleanWord.includes(cleanKey)) return true;
  return levenshtein(cleanWord, cleanKey) <= allowedErrors;
}
