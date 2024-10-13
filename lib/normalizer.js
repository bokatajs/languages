const defaultNormalize = (str) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

class Normalizer {
  constructor(settings = {}) {
    this.functions = settings.functions || {};
  }

  addLanguage(locale, fn) {
    this.functions[locale] = fn;
  }

  normalize(text, locale = 'en') {
    const fn = this.functions[locale] || defaultNormalize;
    return fn(text);
  }

  run(input) {
    // eslint-disable-next-line no-param-reassign
    input.text = this.normalize(input.text, input.locale || 'en');
    return input;
  }
}

module.exports = { Normalizer, defaultNormalize };
