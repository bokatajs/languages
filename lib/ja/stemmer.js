const fs = require('node:fs');
const path = require('node:path');
const kuromoji = require('kuromoji');
const { BaseStemmer } = require('../base-stemmer');
const hepburn = require('./hepburn.json');
const keigo = require('./keigo.json');

const shiftToHiragana = '\u3041'.charCodeAt(0) - '\u30a1'.charCodeAt(0);

class StemmerJa extends BaseStemmer {
  constructor(settings = {}) {
    super(settings);
    this.name = 'stemmer-ja';
  }

  static init() {
    return new Promise((resolve, reject) => {
      if (StemmerJa.tokenizer) {
        resolve();
      } else {
        let dicPath = path.join(__dirname, '../node_modules/kuromoji/dict');
        if (!fs.existsSync(dicPath)) {
          dicPath = path.join(__dirname, '../../../../node_modules/kuromoji/dict');
          if (!fs.existsSync(dicPath)) {
            dicPath = './node_modules/kuromoji/dict';
          }
        }
        kuromoji.builder({ dicPath }).build((err, tokenizer) => {
          if (err) {
            reject(err);
          } else {
            StemmerJa.tokenizer = tokenizer;
            resolve();
          }
        });
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  isHiraganaChar(ch) {
    return ch && ch >= '\u3040' && ch <= '\u309f';
  }

  // eslint-disable-next-line class-methods-use-this
  isKatakanaChar(ch) {
    return ch && ch >= '\u30a0' && ch <= '\u30ff';
  }

  isKanaChar(ch) {
    return this.isHiraganaChar(ch) || this.isKatakanaChar(ch);
  }

  // eslint-disable-next-line class-methods-use-this
  isKanjiChar(ch) {
    return (
      (ch >= '\u4e00' && ch <= '\u9fcf') || (ch >= '\uf900' && ch <= '\ufaff') || (ch >= '\u3400' && ch <= '\u4dbf')
    );
  }

  isJapaneseChar(ch) {
    return this.isKanaChar(ch) || this.isKanjiChar(ch);
  }

  hasHiragana(str) {
    for (let i = 0; i < str.length; i += 1) {
      if (this.isHiraganaChar(str[i])) {
        return true;
      }
    }
    return false;
  }

  hasKatakana(str) {
    for (let i = 0; i < str.length; i += 1) {
      if (this.isKatakanaChar(str[i])) {
        return true;
      }
    }
    return false;
  }

  hasKana(str) {
    for (let i = 0; i < str.length; i += 1) {
      if (this.isKanaChar(str[i])) {
        return true;
      }
    }
    return false;
  }

  hasKanji(str) {
    for (let i = 0; i < str.length; i += 1) {
      if (this.isKanjiChar(str[i])) {
        return true;
      }
    }
    return false;
  }

  hasJapanese(str) {
    for (let i = 0; i < str.length; i += 1) {
      if (this.isJapaneseChar(str[i])) {
        return true;
      }
    }
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  toHiragana(str) {
    return [...str]
      .map((ch) => (ch > '\u30a0' && ch < '\u30f7' ? String.fromCharCode(ch.charCodeAt(0) + shiftToHiragana) : ch))
      .join('');
  }

  // eslint-disable-next-line class-methods-use-this
  toKatakana(str) {
    return [...str]
      .map((ch) => (ch > '\u3040' && ch < '\u3097' ? String.fromCharCode(ch.charCodeAt(0) - shiftToHiragana) : ch))
      .join('');
  }

  // eslint-disable-next-line class-methods-use-this
  toRomaji(srcStr) {
    // eslint-disable-next-line prefer-regex-literals
    const reghatu = new RegExp(
      /(ん|ン)(?=あ|い|う|え|お|ア|イ|ウ|エ|オ|ぁ|ぃ|ぅ|ぇ|ぉ|ァ|ィ|ゥ|ェ|ォ|や|ゆ|よ|ヤ|ユ|ヨ|ゃ|ゅ|ょ|ャ|ュ|ョ)/g
    );
    const indices = [];
    let str = srcStr;
    let match = reghatu.exec(str);
    while (match !== null) {
      indices.push(match.index + 1);
      match = reghatu.exec(str);
    }
    if (indices.length !== 0) {
      let mstr = '';
      for (let i = 0; i < indices.length; i += 1) {
        mstr += i === 0 ? `${str.slice(0, indices[i])}` : `${str.slice(indices[i - 1], indices[i])}`;
      }
      mstr += str.slice(indices[indices.length - 1]);
      str = mstr;
    }
    let pnt = 0;
    let result = '';
    while (pnt <= str.length) {
      let current = str.substring(pnt, pnt + 2);
      current = hepburn[current] ? current : str.substring(pnt, pnt + 1);
      result += hepburn[current] || current;
      pnt += current.length || 1;
    }
    result = result.replace(/(っ|ッ)([bcdfghijklmnopqrstuvwyz])/gm, '$2$2');
    result = result.replace(/cc/gm, 'tc');
    result = result.replace(/っ|ッ/gm, 'tsu');
    result = result.replace(/nm/gm, 'mm');
    result = result.replace(/nb/gm, 'mb');
    result = result.replace(/np/gm, 'mp');
    result = result.replace(/aー/gm, 'ā');
    result = result.replace(/iー/gm, 'ī');
    result = result.replace(/uー/gm, 'ū');
    result = result.replace(/eー/gm, 'ē');
    result = result.replace(/oー/gm, 'ō');
    return result;
  }

  parse(text) {
    const tokens = StemmerJa.tokenizer.tokenize(text);
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (this.hasJapanese(token.surface_form)) {
        if (!token.reading) {
          token.reading = token.surface_form.split('').every(this.isKanaChar.bind(this))
            ? this.toKatakana(token.surface_form)
            : token.surface_form;
        } else if (this.hasHiragana(token.reading)) {
          token.reading = this.toKatakana(token.reading);
        }
      } else {
        token.reading = token.surface_form;
      }
    }
    for (let i = 0; i < tokens.length; i += 1) {
      const current = tokens[i];
      const prev = tokens[i - 1];
      if (current.pos && current.pos === '助動詞' && (current.surface_form === 'う' || current.surface_form === 'ウ')) {
        if (i - 1 >= 0 && prev.pos && prev.pos === '動詞') {
          prev.surface_form += 'う';
          if (prev.pronunciation) {
            prev.pronunciation += 'ー';
          } else {
            prev.pronunciation = `${prev.reading}ー`;
          }
          prev.reading += 'ウ';
          tokens.splice(i, 1);
          i -= 1;
        }
      }
    }
    for (let i = 0; i < tokens.length; i += 1) {
      const current = tokens[i];
      const next = tokens[i + 1];
      if (
        current.pos &&
        (current.pos === '動詞' || current.pos === '形容詞') &&
        current.surface_form.length > 1 &&
        (current.surface_form[current.surface_form.length - 1] === 'っ' ||
          current.surface_form[current.surface_form.length - 1] === 'ッ')
      ) {
        if (i + 1 < tokens.length && next.pos && (next.pos === '動詞' || next.pos === '助動詞')) {
          current.surface_form += next.surface_form;
          if (current.pronunciation) {
            current.pronunciation += next.pronunciation;
          } else {
            current.pronunciation = `${current.reading}${next.reading}`;
          }
          current.reading += next.reading;
          tokens.splice(i + 1, 1);
          i -= 1;
        }
      }
    }
    return tokens;
  }

  convertToKatakana(text) {
    return this.parse(text)
      .map((token) => token.reading)
      .join(' ');
  }

  convertToRomaji(text) {
    return this.toRomaji(
      this.parse(text)
        .map((token) => token.reading)
        .join(' ')
    );
  }

  // eslint-disable-next-line class-methods-use-this
  isNumber(str) {
    for (let i = 0; i < str.length; i += 1) {
      if (!'0123456789'.includes(str[i])) {
        return false;
      }
    }
    return true;
  }

  stem(text) {
    if (Array.isArray(text)) {
      return text;
    }
    // eslint-disable-next-line no-param-reassign
    let tokens;
    tokens = this.formalityLevel(text).informalTokens;
    tokens = tokens
      .map((token) =>
        token.replace(
          /[＿－・，、；：！？．。（）［］｛｝｢｣＠＊＼／＆＃％｀＾＋＜＝＞｜～≪≫─＄＂_\-･,､;:!?.｡()[\]{}「」@*/&#%`^+<=>|~«»$"\s]+/g,
          ''
        )
      )
      .filter((token) => token !== '');
    // const removeNumbers = input.removeNumbers === undefined ? true : input.removeNumbers;
    // if (removeNumbers) {
    //   tokens = tokens.filter((x) => !this.isNumber(x));
    // }
    // const stemMinLength = input.stemMinLength === undefined ? 2 : input.stemMinLength;
    const stemMinLength = 2;
    tokens = tokens.filter((x) => x.length >= stemMinLength);
    return tokens;
  }

  // eslint-disable-next-line class-methods-use-this
  findKeigo(tokens, pnt) {
    let node = keigo;
    let result;
    let currentPnt = pnt;
    let currentToken = tokens[currentPnt];
    while (currentToken && node[currentToken]) {
      node = node[currentToken];
      if (node.result) {
        result = {
          value: node.result.value,
          keigo: node.result.keigo,
          length: currentPnt - pnt + 1,
        };
      }
      currentPnt += 1;
      currentToken = tokens[currentPnt];
    }
    return result;
  }

  // Informal
  // Keigo (敬語) levels:
  // - Teineigo (丁寧語) (polite)
  // - Sonkeigo (尊敬語) (respectful: raise other status)
  // - Kenjougo (謙譲語) (humble: lower own status)
  formalityLevel(text) {
    const tokens = this.parse(text)
      .map((x) => x.reading)
      .filter((x) => x && x !== ' ');
    const informalTokens = [];
    const counts = {
      keigo: 0,
      teineigo: 0,
      sonkeigo: 0,
      kenjougo: 0,
      informal: 0,
    };
    let pnt = 0;
    while (pnt < tokens.length) {
      const token = tokens[pnt];
      const currentKeigo = this.findKeigo(tokens, pnt);
      if (currentKeigo) {
        if (currentKeigo.keigo !== 'dictionary') {
          counts[currentKeigo.keigo] += 1;
        }
        for (let i = 0; i < currentKeigo.value.length; i += 1) {
          informalTokens.push(currentKeigo.value[i]);
        }
        pnt += currentKeigo.length;
      } else {
        if (['ダ', 'ダッ', 'スル'].includes(token)) {
          counts.informal += 1;
          informalTokens.push(token);
        } else if (token === 'ゴ') {
          counts.keigo += 1;
        } else {
          informalTokens.push(token);
        }
        pnt += 1;
      }
    }
    counts.keigo += counts.sonkeigo + counts.teineigo + counts.kenjougo;
    return {
      tokens,
      informalTokens,
      counts,
      isKeigo: counts.keigo > 0,
    };
  }
}

module.exports = { Stemmer: StemmerJa };
