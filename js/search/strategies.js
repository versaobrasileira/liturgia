import { normalize, getWindowStats, fuzzyMatchToken } from './utils.js';
import { applySynonym } from './search-utils.js'; // seu módulo de sinônimos

// cada Strategy expõe .match(item, raw, ctx) → { matches, stats, usedSynonym }
class Strategy0 {
  match(item, raw, ctx) {
    const normTitle = normalize(item.title);
    // Só é match se normTitle inclui exatamente keyWithSp (case-insensitive)
    const matchIdx = normTitle.indexOf(raw.keyWithSp);
    if (matchIdx !== -1) {
      // stats len igual ao comprimento da query
      const stats = { len: raw.keyWithSp.length, start: matchIdx };
      return { matches: true, stats, usedSynonym: false };
    }
    return { matches: false };
  }
}


class Strategy1 {
  match(item, raw, ctx) {
    const letters = normalize(item.title).replace(/[^a-z]/g,'');
    const stats = getWindowStats(letters, raw.lettersKey);
    return { matches: stats.len<Infinity, stats, usedSynonym:false };
  }
}

class Strategy2 {
  match(item, raw, ctx) {
    const letters = normalize(item.title).replace(/[^a-z]/g,'');
    if (!fuzzyMatchToken(letters, raw.lettersKey,1)) return {matches:false};
    let stats = getWindowStats(letters, raw.lettersKey);
    if (!isFinite(stats.len)) stats = {len: letters.length, start:0};
    return { matches:true, stats, usedSynonym:false };
  }
}

class Strategy3 {
  match(item, raw, ctx) {
    const norm = normalize(item.title);
    if (fuzzyMatchToken(norm, raw.synRaw) || fuzzyMatchToken(norm, raw.lettersSyn,1)){
      let stats = getWindowStats(norm.replace(/[^a-z]/g,''), raw.lettersKey);
      if (!isFinite(stats.len)) stats = {len: norm.length, start:0};
      return { matches:true, stats, usedSynonym:false };
    }
    return {matches:false};
  }
}

class Strategy4 {
  match(item, raw, ctx) {
    const norm = normalize(item.title).replace(/[’'`‘‛]/g,'');
    const cons = norm.replace(/[aeiou]/g,'');
    const consKey = raw.consKey ?? '';
    const consTokens = cons.split(/\s+/);
    const found = consTokens.some(token => fuzzyMatchToken(token, raw.consKey, 1));
    if (cons.length<2 || consKey.length<2) return {matches:false};
    if (!found) return {matches:false}; 
    let stats = getWindowStats(cons, consKey);
    if (!isFinite(stats.len)) stats = {len:cons.length,start:0};
    return { matches:true, stats, usedSynonym:false, _consTitle:cons, _consKey:consKey };
  }
}


class SynonymStrategy {
  match(item, raw, ctx) {
    const normalizedQuery = raw.raw.trim().toLowerCase();
    const syn = applySynonym(normalizedQuery);

    const tokens = normalize(item.title).toLowerCase().split(/\s+/);

    const isSyn = syn !== normalizedQuery;
    const isMatch = isSyn && tokens.includes(syn.toLowerCase());

    if (!isSyn) return { matches: false };
    if (isMatch) {
      let stats = getWindowStats(tokens.join(''), syn);
      if (!isFinite(stats.len)) stats = { len: tokens.join('').length, start: 0 };
      return { matches: true, stats, usedSynonym: true };
    }
    return { matches: false };
  }
}


class StrategyNum {
  match(item, raw, ctx) {
    const q = raw.raw;
    if (!/^\d+$/.test(q)) return { matches: false };
    // Campo de página ou número, como string (caso seja int no JSON)
    const pageStr = String(item.page || '');
    // Começa com...
    if (pageStr.startsWith(q)) {
      return { matches: true, stats: { len: 0, start: 0 } };
    }
    return { matches: false };
  }
}








export const strategies = [
  new Strategy0(),
  new Strategy1(),
  new Strategy2(),
  new Strategy3(),
  new Strategy4(),
  new SynonymStrategy(),
  new StrategyNum() 
];
