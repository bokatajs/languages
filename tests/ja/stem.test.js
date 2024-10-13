const { describe, test, expect } = require('@bokata/testing');
const { Container } = require('@bokata/base');
const { Normalizer, Tokenizer, Stemmer, langs, registerLanguage } = require('../../lib');

const container = new Container();
const normalizer = new Normalizer();
container.register('normalizer', normalizer, true);
const tokenizer = new Tokenizer();
container.register('tokenizer', tokenizer, true);
const stemmer = new Stemmer();
container.register('stemmer', stemmer, true);
registerLanguage(container, langs.ja);

describe('Stemmer Japanse', () => {
  test('It should stem "一般的にコーヌビアナイトと呼ばれる変成岩。"', async () => {
    await langs.ja.Stemmer.init();
    const expected = ['イッパン', 'テキ', 'コーヌビアナイト', 'ヨバ', 'レル', 'ヘンセイガン'];
    const text = '一般的にコーヌビアナイトと呼ばれる変成岩。';
    const actual = stemmer.stem(text, 'ja');
    expect(actual).toEqual(expected);
  });
});
