const { describe, test, expect } = require('@bokata/testing');
const { Container } = require('@bokata/base');
const { registerLanguage, Normalizer, Tokenizer, Stemmer, langs } = require('../../lib');

const container = new Container();
const normalizer = new Normalizer();
container.register('normalizer', normalizer, true);
const tokenizer = new Tokenizer({ container, shouldNormalize: true });
container.register('tokenizer', tokenizer, true);
const stemmer = new Stemmer();
container.register('stemmer', stemmer, true);
registerLanguage(container, langs.es);

describe('Stemmer', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      const instance = new Stemmer();
      expect(instance).toBeDefined();
    });
  });

  describe('Stem', () => {
    test('Should stem "qué desarrolla tu compañía?"', () => {
      const input = 'qué desarrolla tu compañía?';
      const expected = ['que', 'desarroll', 'tu', 'compan'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input, 'es'), 'es');
      const actual = stemmer.stem(tokens, 'es');
      expect(actual).toEqual(expected);
    });
    test('Should stem "¿tu compañía tiene otros productos?"', () => {
      const input = '¿tu compañía tiene otros productos?';
      const expected = ['tu', 'compan', 'ten', 'otro', 'product'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input, 'es'), 'es');
      const actual = stemmer.stem(tokens, 'es');
      expect(actual).toEqual(expected);
    });
    test('Should stem "¿qué está creando tu compañía?"', () => {
      const input = '¿qué está creando tu compañía?';
      const expected = ['que', 'esta', 'cre', 'tu', 'compan'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input, 'es'), 'es');
      const actual = stemmer.stem(tokens, 'es');
      expect(actual).toEqual(expected);
    });
    test('Should stem "¿Qué está creando tu empresa?"', () => {
      const input = '¿Qué está creando tu empresa?';
      const expected = ['que', 'esta', 'cre', 'tu', 'empres'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input, 'es'), 'es');
      const actual = stemmer.stem(tokens, 'es');
      expect(actual).toEqual(expected);
    });
    test('Should stem "¿Tiene tu empresa otras aplicaciones?"', () => {
      const input = '¿Tiene tu empresa otras aplicaciones?';
      const expected = ['ten', 'tu', 'empres', 'otra', 'aplicacion'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input, 'es'), 'es');
      const actual = stemmer.stem(tokens, 'es');
      expect(actual).toEqual(expected);
    });
    test('Should stem "¿qué más está desarrollando tu empresa?"', () => {
      const input = '¿qué más está desarrollando tu empresa?';
      const expected = ['que', 'mas', 'esta', 'desarroll', 'tu', 'empres'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input, 'es'), 'es');
      const actual = stemmer.stem(tokens, 'es');
      expect(actual).toEqual(expected);
    });
    test('Should stem "realizarnos realizar realizando realizado"', () => {
      const input = 'realizarnos realizar realizando realizado';
      const expected = ['realic', 'realic', 'realic', 'realic'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input, 'es'), 'es');
      const actual = stemmer.stem(tokens, 'es');
      expect(actual).toEqual(expected);
    });
    test('Should stem "covid-19 covid19"', () => {
      const input = 'covid-19 covid19';
      const expected = ['covid-19', 'covid19'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input, 'es'), 'es');
      const actual = stemmer.stem(tokens, 'es');
      expect(actual).toEqual(expected);
    });
  });
});
