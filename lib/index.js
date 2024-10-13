const among = require('./among');
const baseStemmer = require('./base-stemmer');
const langs = require('./langs');
const normalizer = require('./normalizer');
const registerLanguages = require('./register-languages');
const stopwords = require('./stopwords');
const tokenizer = require('./tokenizer');
const stemmer = require('./stemmer');

module.exports = {
  ...among,
  ...baseStemmer,
  langs,
  ...normalizer,
  ...registerLanguages,
  ...stopwords,
  ...tokenizer,
  ...stemmer,
};
