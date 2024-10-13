const defaultStem = (tokens) => [...tokens];

class Stemmer {
  constructor(settings = {}) {
    this.functions = settings.functions || {};
  }

  addLanguage(locale, fn) {
    this.functions[locale] = fn;
  }

  stem(tokens, locale = 'en') {
    const fn = this.functions[locale] || defaultStem;
    return fn(tokens);
  }

  run(input) {
    const stemmed = this.stem(input.tokens, input);
    // eslint-disable-next-line no-param-reassign
    input.stemmed = stemmed;
    return input;
  }
}

module.exports = { Stemmer, defaultStem };
