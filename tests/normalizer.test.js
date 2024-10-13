const { describe, test, expect } = require('@bokata/testing');
const { Container } = require('@bokata/base');
const { Normalizer } = require('../lib');
const { registerLanguage } = require('../lib/register-languages');

const fnen = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/e/g, '*');
const fnes = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/a/g, '*');

function getContainer() {
  const container = new Container();
  const normalizer = new Normalizer();
  container.register('normalizer', normalizer, true);
  registerLanguage(container, { locale: 'en', normalize: fnen });
  registerLanguage(container, { locale: 'es', normalize: fnes });
  return container;
}

describe('Normalizer', () => {
  describe('Constructor', () => {
    test('You can create an instance', () => {
      const normalizer = new Normalizer();
      expect(normalizer).toBeDefined();
    });
  });

  describe('Normalize', () => {
    test('It can normalize a text', () => {
      const input = 'Ñam aquí, Lérn';
      const expected = 'nam aqui, lern';
      const normalizer = new Normalizer();
      const actual = normalizer.normalize(input);
      expect(actual).toEqual(expected);
    });
  });

  describe('Run', () => {
    test('It can normalize a text', () => {
      const input = { text: 'Ñam aquí, Lérn' };
      const expected = 'nam aqui, lern';
      const normalizer = new Normalizer();
      const actual = normalizer.run(input);
      expect(actual.text).toEqual(expected);
    });

    test('If a normalizer for the input locale exists at the container, then use it', () => {
      const container = getContainer();
      const input = { text: 'Ñam aquí, Lérn', locale: 'es' };
      const expected = 'n*m *qui, lern';
      const normalizer = container.get('normalizer');
      const actual = normalizer.run(input);
      expect(actual.text).toEqual(expected);
    });

    test('If the locale is not set, then default is "en", and if the container haves a normalizer-en use it', () => {
      const container = getContainer();
      const input = { text: 'Ñam aquí, Lérn' };
      const expected = 'nam aqui, l*rn';
      const normalizer = container.get('normalizer');
      const actual = normalizer.run(input);
      expect(actual.text).toEqual(expected);
    });
  });
});
