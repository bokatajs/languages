class Stopwords {
  constructor(settings = {}) {
    this.dictionaries = settings.dictionaries || {};
  }

  addLanguage(locale, list) {
    if (!this.dictionaries[locale]) {
      this.dictionaries[locale] = {};
    }
    const dictionary = this.dictionaries[locale];
    list.forEach((word) => {
      dictionary[word] = true;
    });
  }

  removeStopwords(tokens, locale = 'en') {
    const dictionary = this.dictionaries[locale];
    if (!dictionary) {
      return [...tokens];
    }
    return tokens.filter((token) => !dictionary[token]);
  }

  run(input) {
    const filtered = this.removeStopwords(input.tokens, input);
    // eslint-disable-next-line no-param-reassign
    input.tokens = filtered;
    return input;
  }
}

module.exports = { Stopwords };
