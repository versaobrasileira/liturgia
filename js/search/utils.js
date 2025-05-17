// utilidades puras
export function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`‘‛]/g, '')
    .toLowerCase();
}

export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, ()=>Array(n+1).fill(0));
  for(let i=0;i<=m;i++) dp[i][0]=i;
  for(let j=0;j<=n;j++) dp[0][j]=j;
  for(let i=1;i<=m;i++){
    for(let j=1;j<=n;j++){
      const cost = a[i-1]===b[j-1] ? 0 : 1;
      dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
    }
  }
  return dp[m][n];
}

export function fuzzyMatchToken(token, key, maxErr = 1) {
  token = token.toLowerCase();
  key = key.toLowerCase();
  if (token.includes(key)) return true;
  const m = key.length;
  if (token.length < m) return levenshtein(token, key) <= maxErr;
  for (let i=0; i<=token.length-m; i++) {
    if (levenshtein(token.substr(i,m), key) <= maxErr) return true;
  }
  return false;
}


export function getWindowStats(text, key) {
  const k = key.length;
  let bestLen = Infinity, bestStart = text.length;
  for (let i=0; i<text.length; i++) {
    if (text[i]!==key[0]) continue;
    let pos=i, matched=1;
    while(pos<text.length && matched<k) {
      pos++;
      if(text[pos]===key[matched]) matched++;
    }
    if(matched===k){
      const len = pos - i + 1;
      if(len<bestLen || (len===bestLen && i>bestStart)){
        bestLen=len;
        bestStart=i;
      }
    }
  }
  return bestLen===Infinity
    ? {len: Infinity, start: text.length}
    : {len: bestLen, start: bestStart};
}
