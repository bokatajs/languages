const defaultTokenize = (text) => text.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);

class Tokenizer {
  constructor(settings = {}) {
    this.functions = settings.functions || {};
  }

  addLanguage(locale, fn) {
    this.functions[locale] = fn;
  }

  tokenize(text, locale = 'en') {
    const fn = this.functions[locale] || defaultTokenize;
    return fn(text);
  }

  run(input) {
    const tokens = this.tokenize(input.text, input);
    // eslint-disable-next-line no-param-reassign
    input.tokens = tokens.filter((x) => x);
    return input;
  }
}

module.exports = { Tokenizer, defaultTokenize };
