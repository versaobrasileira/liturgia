// js/scorer.js

export class Scorer {
  constructor({ primary, start, secondary, method, titleLength, consInfo, raw }) {
    this.primary      = primary;
    this.primaryStart = start;
    this.secondary    = secondary;
    this.method       = method;
    this.titleLength  = titleLength;
    this.consInfo     = consInfo; // { consTitle, consKey } para método 4
    this.raw          = raw;
  }

  baseScore() {
    // pesos por método: 0…6
    // 0: exato espaços  → 1.0
    // 1: exato só letras → 0.8
    // 2: fuzzy ≤1 erro   → 0.6
    // 3: fuzzy texto     → 0.4
    // 4: consoantes      → 0.3
    // 5: sinônimos       → 0.0 (sempre por último)
    // 6: número          → 1.0
    const pesos = [1.0, 0.8, 0.6, 0.4, 0.3, 0.0, 1.0];
    const pMed  = pesos[this.method] || 0;

    const penJan  = this.primary      / (this.titleLength || 1);
    const penDist = this.primaryStart / (this.titleLength || 1);
    const penErr  = this.secondary    / (this.raw.lettersKey.length || 1);

    let rel = Math.max(
      0,
      pMed * (1 - 0.5 * penJan - 0.3 * penDist - 0.8 * penErr)
    );

    // método 1: penalidade extra por janela maior que a query
    if (this.method === 1) {
      const excess  = Math.max(0, this.primary - this.raw.lettersKey.length);
      const factor  = Math.max(0, 1 - 0.15 * excess); // –15% por letra
      rel *= factor;
      this.penalJanelaExcesso = excess;
      this.penalJanelaFactor  = factor;
    }

    // método 4: penaliza consoantes faltantes (–30% por consoante)
    if (this.method === 4 && this.consInfo) {
      const { consTitle, consKey } = this.consInfo;
      let matched = 0, pos = 0;
      for (const ch of consKey) {
        pos = consTitle.indexOf(ch, pos);
        if (pos === -1) break;
        matched++;
        pos++;
      }
      const missing = consKey.length - matched;
      const f       = Math.max(0, 1 - 0.7 * missing);
      rel *= f;
      this.penalConsoantes = missing;
      this.penalFactor     = f.toFixed(2);
    }

    return rel;
  }

  finalScore() {
    const rel  = this.baseScore();
    const taxa = this.raw.lettersKey.length / ((this.titleLength * 2) || 1);
    return rel * 100 * taxa;
  }
}
