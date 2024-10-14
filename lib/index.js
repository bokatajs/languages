const { ioc } = require('@bokata/base');
const { Among } = require('./among');
const { BaseStemmer } = require('./base-stemmer');
const langs = require('./langs');
const { Normalizer, defaultNormalize } = require('./normalizer');
const { registerLanguage, registerLanguages } = require('./register-languages');
const { Stopwords } = require('./stopwords');
const { Tokenizer, defaultTokenize } = require('./tokenizer');
const { Stemmer, defaultStem } = require('./stemmer');
const { Processor } = require('./processor');
const { Encoder } = require('./encoder');

const initLanguages = async (container = ioc, languages = langs) => {
  const normalizer = new Normalizer();
  container.register('normalizer', normalizer, true);
  const tokenizer = new Tokenizer();
  container.register('tokenizer', tokenizer, true);
  const stemmer = new Stemmer();
  container.register('stemmer', stemmer, true);
  await langs.ja.Stemmer.init();
  const processor = new Processor({ container });
  container.register('processor', processor, true);
  registerLanguages(container, languages);
  return container;
};

module.exports = {
  Among,
  BaseStemmer,
  langs,
  Normalizer,
  defaultNormalize,
  Tokenizer,
  defaultTokenize,
  registerLanguage,
  registerLanguages,
  Stopwords,
  Stemmer,
  defaultStem,
  initLanguages,
  Encoder,
  Processor,
};
