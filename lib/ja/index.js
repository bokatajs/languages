const { normalize } = require('./normalize');
const stopwords = require('./stopwords.json');
const { tokenize } = require('./tokenize');
const { Stemmer } = require('./stemmer');

const stemmer = new Stemmer();
const stem = (tokens) => stemmer.stem(tokens);
const process = (text) => stem(tokenize(normalize(text)));

module.exports = {
  locale: 'ja',
  name: 'Japanese',
  stopwords,
  normalize,
  tokenize,
  Stemmer,
  stemmer,
  stem,
  process,
};
