const rules = require('./rules.json');

const bias = -332;

const chartype = [
  [/[〇一二三四五六七八九十百千万億兆]/, 'M'],
  [/[一-鿌〆]/, 'H'],
  [/[ぁ-ゟ]/, 'I'],
  [/[゠-ヿ]/, 'K'],
  [/[a-zA-Z]/, 'A'],
  [/[0-9]/, 'N'],
];

function getctype(str) {
  for (let i = 0, l = chartype.length; i < l; i += 1) {
    if (str.match(chartype[i][0])) {
      return chartype[i][1];
    }
  }
  return 'O';
}

function removePuncTokens(tokens) {
  return tokens
    .map((token) =>
      token.replace(
        /[＿－・，、；：！？．。（）［］｛｝｢｣＠＊＼／＆＃％｀＾＋＜＝＞｜～≪≫─＄＂_\-･,､;:!?.｡()[\]{}「」@*/&#%`^+<=>|~«»$"\s]+/g,
        ''
      )
    )
    .filter((token) => token !== '');
}

function tokenize(text) {
  if (!text || text === '') {
    return [];
  }
  const result = [];
  const seg = ['B3', 'B2', 'B1'];
  const ctype = ['O', 'O', 'O'];
  const o = text.split('');
  for (let i = 0, l = o.length; i < l; i += 1) {
    seg.push(o[i]);
    ctype.push(getctype(o[i]));
  }
  seg.push('E1');
  seg.push('E2');
  seg.push('E3');
  ctype.push('O');
  ctype.push('O');
  ctype.push('O');
  let word = seg[3];
  let p1 = 'U';
  let p2 = 'U';
  let p3 = 'U';
  for (let i = 4, l = seg.length - 3; i < l; i += 1) {
    let score = bias;
    const w1 = seg[i - 3];
    const w2 = seg[i - 2];
    const w3 = seg[i - 1];
    const w4 = seg[i];
    const w5 = seg[i + 1];
    const w6 = seg[i + 2];
    const c1 = ctype[i - 3];
    const c2 = ctype[i - 2];
    const c3 = ctype[i - 1];
    const c4 = ctype[i];
    const c5 = ctype[i + 1];
    const c6 = ctype[i + 2];
    score += rules.UP1[p1] || 0;
    score += rules.UP2[p2] || 0;
    score += rules.UP3[p3] || 0;
    score += rules.BP1[p1 + p2] || 0;
    score += rules.BP2[p2 + p3] || 0;
    score += rules.UW1[w1] || 0;
    score += rules.UW2[w2] || 0;
    score += rules.UW3[w3] || 0;
    score += rules.UW4[w4] || 0;
    score += rules.UW5[w5] || 0;
    score += rules.UW6[w6] || 0;
    score += rules.BW1[w2 + w3] || 0;
    score += rules.BW2[w3 + w4] || 0;
    score += rules.BW3[w4 + w5] || 0;
    score += rules.TW1[w1 + w2 + w3] || 0;
    score += rules.TW2[w2 + w3 + w4] || 0;
    score += rules.TW3[w3 + w4 + w5] || 0;
    score += rules.TW4[w4 + w5 + w6] || 0;
    score += rules.UC1[c1] || 0;
    score += rules.UC2[c2] || 0;
    score += rules.UC3[c3] || 0;
    score += rules.UC4[c4] || 0;
    score += rules.UC5[c5] || 0;
    score += rules.UC6[c6] || 0;
    score += rules.BC1[c2 + c3] || 0;
    score += rules.BC2[c3 + c4] || 0;
    score += rules.BC3[c4 + c5] || 0;
    score += rules.TC1[c1 + c2 + c3] || 0;
    score += rules.TC2[c2 + c3 + c4] || 0;
    score += rules.TC3[c3 + c4 + c5] || 0;
    score += rules.TC4[c4 + c5 + c6] || 0;
    score += rules.UQ1[p1 + c1] || 0;
    score += rules.UQ2[p2 + c2] || 0;
    score += rules.UQ3[p3 + c3] || 0;
    score += rules.BQ1[p2 + c2 + c3] || 0;
    score += rules.BQ2[p2 + c3 + c4] || 0;
    score += rules.BQ3[p3 + c2 + c3] || 0;
    score += rules.BQ4[p3 + c3 + c4] || 0;
    score += rules.TQ1[p2 + c1 + c2 + c3] || 0;
    score += rules.TQ2[p2 + c2 + c3 + c4] || 0;
    score += rules.TQ3[p3 + c1 + c2 + c3] || 0;
    score += rules.TQ4[p3 + c2 + c3 + c4] || 0;
    let p = 'O';
    if (score > 0) {
      result.push(word);
      word = '';
      p = 'B';
    }
    p1 = p2;
    p2 = p3;
    p3 = p;
    word += seg[i];
  }
  result.push(word);
  return removePuncTokens(result);
}

module.exports = { tokenize };
