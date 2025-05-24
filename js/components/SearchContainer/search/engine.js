// js/engine.js

import { normalize, applySynonym, levenshtein } from './search-utils.js';
import { strategies }    from './strategies.js';
import { Scorer }        from './scorer.js';

let _indexCache = null;

/**
 * Faz fetch de ./content/all.json, faz cache em memória
 */
let _allCache = null;

export async function loadIndex() {
  if (_allCache) {
    // Corrige para garantir que sempre retorna o array (compatível com "index": { "value": [...] })
    return Array.isArray(_allCache.index)
      ? _allCache.index
      : (_allCache.index.value || _allCache.index);
  }
  const res = await fetch('./content/all.json');
  if (!res.ok) throw new Error(`Erro ${res.status} ao carregar all.json`);
  _allCache = await res.json();
  return Array.isArray(_allCache.index)
    ? _allCache.index
    : (_allCache.index.value || _allCache.index);
}

// Nova função para buscar um arquivo de conteúdo específico:
export async function loadContent(filename) {
  if (!_allCache) {
    const res = await fetch('./content/all.json');
    if (!res.ok) throw new Error(`Erro ${res.status} ao carregar all.json`);
    _allCache = await res.json();
  }
  return _allCache.files[filename];
}

/**
 * SearchEngine aplica todas as strategies e usa Scorer para ordenar
 */
export class SearchEngine {
  constructor() {
    this._index = null;
  }

  async _ensureIndex() {
    if (!this._index) {
      this._index = await loadIndex();
    }
  }

  /**
   * rawInput: a string digitada
   * retorna: array de itens já ordenados e marcados (._lowRelev, ._method, etc)
   */
  async search(rawInput) {
    const raw = this._prepareRaw(rawInput);
    await this._ensureIndex();

    // se for só número puro, usa a última strategy (index 6)
    if (/^\d+$/.test(raw.raw)) {
      return this._searchNumber(raw);
    }
    // senão, busca texto via strategies 0…5
    return this._searchText(raw);
  }

  /**
   * Apenas StrategyNum (index 6)
   */
  _searchNumber(raw) {
    const numIdx = strategies.length - 1; // 6
    const found = this._index
      .filter(item => {
        const res = strategies[numIdx].match(item, raw);
        return res.matches === true;
      })
      .map(item => item);
    return found;
  }

  /**
   * Strategies 0…5, depois pontua, loga scores, filtra e ordena
   */
  _searchText(raw) {
    const candidates = [];

    for (const item of this._index) {
      for (let i = 0; i < strategies.length - 1; i++) {
        const res = strategies[i].match(item, raw);
        if (res.matches === true) {
          candidates.push({
            item,
            method:      i,
            stats:       res.stats,
            usedSynonym: res.usedSynonym,
            consInfo:    res._consTitle ? { consTitle: res._consTitle, consKey: res._consKey } : null
          });
          break;
        }
      }
    }

    // 2) pontuar cada candidato
    const scored = candidates.map(cand => {
      const s = new Scorer({
        primary:     cand.stats.len,
        start:       cand.stats.start,
        secondary:   this._calcSecondary(cand.item, raw),
        method:      cand.method,
        titleLength: cand.item.title.replace(/[^A-Za-z]/g, '').length,
        consInfo:    cand.consInfo,
        raw
      });
      const scoreResult = s.finalScore();

      // anota para UI
      cand.item._method              = cand.method;
      cand.item._relevanciaResultado = parseFloat(scoreResult.toFixed(2));
      cand.item._penalConsoantes     = s.penalConsoantes || 0;
      cand.item._penalFactor         = s.penalFactor     || '1.00';

      return { item: cand.item, score: scoreResult };
    });

    // 3) filtro e marcações
    const maxScore = Math.max(...scored.map(s => s.score));
    const minShow  = 0.4 * maxScore;  // 40%
    const lowMark  = 0.8 * maxScore;  // 80%

    // mantém todos exceto sinônimos (method 5) com score ≥ minShow
    const main = scored
      .filter(s => s.item._method !== 5 && s.score >= minShow)
      .map(s => {
        s.item._lowRelev = s.score < lowMark;
        return s;
      });

    // sinônimos (method 5) sempre por último
    const syn = scored
      .filter(s => s.item._method === 5);

    // 4) ordena descendentemente
    main.sort((a,b) => b.score - a.score);
    syn .sort((a,b) => b.score - a.score);

    // 5) retorna só os itens
    return [...main, ...syn].map(s => s.item);
  }

  /** Normaliza a query em várias chaves úteis */
  _prepareRaw(rawInput) {
    const trimmed = rawInput.trim();
    const normRaw = normalize(trimmed);
    return {
      raw:         trimmed,
      keyWithSp:   normRaw,
      lettersKey:  normRaw.replace(/[^a-z]/g, ''),
      synRaw:      applySynonym(normRaw).toLowerCase(),
      lettersSyn:  applySynonym(normRaw).toLowerCase().replace(/[^a-z]/g, ''),
      consKey:     normRaw.replace(/[^a-z]/g, '').replace(/[aeiou]/g, '')
    };
  }

  /** Para cálculo de 'secondary' (Levenshtein ao longo do título) */
  _calcSecondary(item, raw) {
    const letters = normalize(item.title).replace(/[^a-z]/g, '');
    let best = Infinity;
    for (let i = 0; i <= letters.length - raw.lettersKey.length; i++) {
      best = Math.min(
        best,
        levenshtein(letters.substr(i, raw.lettersKey.length), raw.lettersKey)
      );
    }
    return isFinite(best) ? best : raw.lettersKey.length;
  }
}
