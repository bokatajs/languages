const { ioc } = require('@bokata/base');
const { defaultNormalize } = require('./normalizer');
const { defaultTokenize } = require('./tokenizer');

class Processor {
  constructor(settings = {}) {
    this.functions = settings.functions || {};
  }

  addLanguage(locale, fn) {
    this.functions[locale] = fn;
  }

  process(text, locale = 'en') {
    const fn = this.functions[locale];
    if (fn) {
      return fn(text);
    }
    const normalizer = ioc.get('normalizer');
    const tokenizer = ioc.get('tokenizer');
    if (normalizer && tokenizer) {
      const input = { text, locale };
      normalizer.run(input);
      tokenizer.run(input);
      const stemmer = ioc.get('stemmer');
      if (stemmer) {
        stemmer.run(input);
      }
      return input.tokens;
    }
    return defaultTokenize(defaultNormalize(text));
  }

  run(input) {
    // eslint-disable-next-line no-param-reassign
    input.tokens = this.process(input.text, input.locale || 'en');
    return input;
  }
}

module.exports = { Processor };
