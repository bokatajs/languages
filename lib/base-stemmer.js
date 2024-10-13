class BaseStemmer {
  constructor(settings = {}) {
    this.name = 'stemmer';
    this.cache = {};
    this.setCurrent('');
    this.dictionary = settings.dictionary || { before: {}, after: {} };
  }

  setCurrent(value) {
    this.current = value;
    this.cursor = 0;
    this.limit = this.current.length;
    this.limit_backward = 0;
    this.bra = this.cursor;
    this.ket = this.limit;
  }

  getCurrent() {
    return this.current;
  }

  // eslint-disable-next-line class-methods-use-this
  bc(s, ch) {
    // eslint-disable-next-line no-bitwise
    if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) === 0) {
      return true;
    }
    return false;
  }

  in_grouping(s, min, max) {
    if (this.cursor >= this.limit) return false;
    let ch = this.current.charCodeAt(this.cursor);
    if (ch > max || ch < min) return false;
    ch -= min;
    if (this.bc(s, ch)) return false;
    this.cursor += 1;
    return true;
  }

  in_grouping_b(s, min, max) {
    if (this.cursor <= this.limit_backward) return false;
    let ch = this.current.charCodeAt(this.cursor - 1);
    if (ch > max || ch < min) return false;
    ch -= min;
    if (this.bc(s, ch)) return false;
    this.cursor -= 1;
    return true;
  }

  out_grouping(s, min, max) {
    if (this.cursor >= this.limit) return false;
    let ch = this.current.charCodeAt(this.cursor);
    if (ch > max || ch < min) {
      this.cursor += 1;
      return true;
    }
    ch -= min;
    if (this.bc(s, ch)) {
      this.cursor += 1;
      return true;
    }
    return false;
  }

  out_grouping_b(s, min, max) {
    if (this.cursor <= this.limit_backward) return false;
    let ch = this.current.charCodeAt(this.cursor - 1);
    if (ch > max || ch < min) {
      this.cursor -= 1;
      return true;
    }
    ch -= min;
    if (this.bc(s, ch)) {
      this.cursor -= 1;
      return true;
    }
    return false;
  }

  eq_s(sSize, s) {
    if (typeof sSize === 'string') {
      // eslint-disable-next-line no-param-reassign
      s = sSize;
      // eslint-disable-next-line no-param-reassign
      sSize = s.length;
    }
    if (this.limit - this.cursor < sSize || this.current.slice(this.cursor, this.cursor + sSize) !== s) {
      return false;
    }
    this.cursor += sSize;
    return true;
  }

  eq_s_b(sSize, s) {
    if (typeof sSize === 'string') {
      // eslint-disable-next-line no-param-reassign
      s = sSize;
      // eslint-disable-next-line no-param-reassign
      sSize = s.length;
    }
    if (this.cursor - this.limit_backward < sSize || this.current.slice(this.cursor - sSize, this.cursor) !== s) {
      return false;
    }
    this.cursor -= sSize;
    return true;
  }

  find_among(v, vsize) {
    let i = 0;
    let j = vsize || v.length;

    const c = this.cursor;
    const l = this.limit;

    let commoni = 0;
    let commonj = 0;

    let firstKeyInspected = false;

    while (true) {
      // eslint-disable-next-line no-bitwise
      const k = i + ((j - i) >>> 1);
      let diff = 0;
      let common = commoni < commonj ? commoni : commonj; // smaller
      const w = v[k];
      let i2;
      for (i2 = common; i2 < w.sSize; i2 += 1) {
        if (c + common === l) {
          diff = -1;
          break;
        }
        diff = this.current.charCodeAt(c + common) - w.s.charCodeAt(i2);
        if (diff !== 0) break;
        common += 1;
      }
      if (diff < 0) {
        j = k;
        commonj = common;
      } else {
        i = k;
        commoni = common;
      }
      if (j - i <= 1) {
        if (i > 0) break; // v->s has been inspected
        if (j === i) break; // only one item in v

        // - but now we need to go round once more to get
        // v->s inspected. This looks messy, but is actually
        // the optimal approach.

        if (firstKeyInspected) break;
        firstKeyInspected = true;
      }
    }
    while (true) {
      const w = v[i];
      if (commoni >= w.sSize) {
        this.cursor = c + w.sSize;
        if (w.method == null) {
          return w.result;
        }
        const res = w.method(w.instance);
        this.cursor = c + w.sSize;
        if (res) {
          return w.result;
        }
      }
      i = w.substring_i;
      if (i < 0) return 0;
    }
  }

  // find_among_b is for backwards processing. Same comments apply
  find_among_b(v, vsize) {
    let i = 0;
    let j = vsize || v.length;

    const c = this.cursor;
    const lb = this.limit_backward;

    let commoni = 0;
    let commonj = 0;

    let firstKeyInspected = false;

    while (true) {
      // eslint-disable-next-line no-bitwise
      const k = i + ((j - i) >> 1);
      let diff = 0;
      let common = commoni < commonj ? commoni : commonj;
      const w = v[k];
      let i2;
      for (i2 = w.sSize - 1 - common; i2 >= 0; i2 -= 1) {
        if (c - common === lb) {
          diff = -1;
          break;
        }
        diff = this.current.charCodeAt(c - 1 - common) - w.s.charCodeAt(i2);
        if (diff !== 0) break;
        common += 1;
      }
      if (diff < 0) {
        j = k;
        commonj = common;
      } else {
        i = k;
        commoni = common;
      }
      if (j - i <= 1) {
        if (i > 0) break;
        if (j === i) break;
        if (firstKeyInspected) break;
        firstKeyInspected = true;
      }
    }
    while (true) {
      const w = v[i];
      if (commoni >= w.sSize) {
        this.cursor = c - w.sSize;
        if (w.method == null) return w.result;
        const res = w.method(this);
        this.cursor = c - w.sSize;
        if (res) return w.result;
      }
      i = w.substring_i;
      if (i < 0) return 0;
    }
  }

  /* to replace chars between cBra and cKet in this.current by the
   * chars in s.
   */
  replace_s(cBra, cKet, s) {
    const adjustment = s.length - (cKet - cBra);
    this.current = this.current.slice(0, cBra) + s + this.current.slice(cKet);
    this.limit += adjustment;
    if (this.cursor >= cKet) this.cursor += adjustment;
    else if (this.cursor > cBra) this.cursor = cBra;
    return adjustment;
  }

  slice_check() {
    if (this.bra < 0 || this.bra > this.ket || this.ket > this.limit || this.limit > this.current.length) {
      return false;
    }
    return true;
  }

  slice_from(s) {
    if (this.slice_check()) {
      this.replace_s(this.bra, this.ket, s);
      return true;
    }
    return false;
  }

  slice_del() {
    return this.slice_from('');
  }

  insert(cBra, cKet, s) {
    const adjustment = this.replace_s(cBra, cKet, s);
    if (cBra <= this.bra) this.bra += adjustment;
    if (cBra <= this.ket) this.ket += adjustment;
  }

  /* Copy the slice into the supplied StringBuffer */
  slice_to() {
    let result = '';
    if (this.slice_check()) {
      result = this.current.slice(this.bra, this.ket);
    }
    return result;
  }

  stemWord(word) {
    let result = this.cache[`.${word}`];
    if (result == null) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.dictionary.before.hasOwnProperty(word)) {
        result = this.dictionary.before[word];
      } else {
        this.setCurrent(word);
        this.innerStem();
        result = this.getCurrent();
        // eslint-disable-next-line no-prototype-builtins
        if (this.dictionary.after.hasOwnProperty(result)) {
          result = this.dictionary.after[result];
        }
      }
      this.cache[`.${word}`] = result;
    }
    return result;
  }

  stemWords(words) {
    const results = [];
    for (let i = 0; i < words.length; i += 1) {
      const stemmed = this.stemWord(words[i]);
      if (stemmed) {
        results.push(stemmed.trim());
      }
    }
    return results;
  }

  stem(tokens) {
    if (tokens === undefined || tokens === null) {
      return tokens;
    }
    if (!Array.isArray(tokens)) {
      return this.stemWords([tokens])[0];
    }
    return this.stemWords(tokens);
  }
}

module.exports = { BaseStemmer };
