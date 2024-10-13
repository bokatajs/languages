const { ioc } = require('@bokata/base');
const langs = require('./langs');

function registerLanguage(container = ioc, lang = undefined) {
  const normalizer = container.get('normalizer');
  if (normalizer && lang.normalize) {
    normalizer.addLanguage(lang.locale, lang.normalize);
  }
  const tokenizer = container.get('tokenizer');
  if (tokenizer && lang.tokenize) {
    tokenizer.addLanguage(lang.locale, lang.tokenize);
  }
  const stopwords = container.get('stopwords');
  if (stopwords && lang.stopwords) {
    stopwords.addLanguage(lang.locale, lang.stopwords);
  }
  const stemmer = container.get('stemmer');
  if (stemmer && lang.stem) {
    stemmer.addLanguage(lang.locale, lang.stem);
  }
  const processor = container.get('processor');
  if (processor && lang.process) {
    processor.addLanguage(lang.locale, lang.process);
  }
}

function registerLanguages(container = ioc, allLangs = langs) {
  const keys = Object.keys(allLangs);
  keys.forEach((key) => {
    registerLanguage(container, allLangs[key]);
  });
}

module.exports = { registerLanguage, registerLanguages };
