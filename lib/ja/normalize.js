const { converters, fixCompositeSymbols } = require('./helper');

function normalize(text) {
  let result = text.replace(/(..)々々/g, '$1$1').replace(/(.)々/g, '$1$1');
  result = converters.normalize(result);
  result = converters.fixFullwidthKana(result);
  result = fixCompositeSymbols(result);
  return result;
}

module.exports = { normalize };
