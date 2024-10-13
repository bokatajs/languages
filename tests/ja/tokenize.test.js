const { describe, test, expect } = require('@bokata/testing');
const { Container } = require('@bokata/base');
const { Normalizer, Tokenizer, langs, registerLanguage } = require('../../lib');

const container = new Container();
const normalizer = new Normalizer();
container.register('normalizer', normalizer, true);
const tokenizer = new Tokenizer();
container.register('tokenizer', tokenizer, true);
registerLanguage(container, langs.ja);

describe('Tokenizer Japanse', () => {
  describe('Tokenize', () => {
    test('It should tokenize "一般的にコーヌビアナイトと呼ばれる変成岩。"', () => {
      const expected = ['一般的', 'に', 'コーヌビアナイト', 'と', '呼ばれる', '変成', '岩'];
      const text = '一般的にコーヌビアナイトと呼ばれる変成岩。';
      const actual = tokenizer.tokenize(normalizer.normalize(text, 'ja'), 'ja');
      expect(actual).toEqual(expected);
    });
  });
});
