const { ioc } = require('@bokata/base');
const { Processor } = require('./processor');

class Encoder {
  constructor(settings = {}) {
    this.container = settings.container || ioc;
    this.locale = settings.locale || 'en';
    this.process = settings.process;
    this.processor = settings.processor || this.container.get('processor');
    this.featureMap = new Map();
    this.numFeature = 0;
    this.intentMap = new Map();
    this.intents = [];
  }

  learnIntent(intent) {
    if (!this.intentMap.has(intent)) {
      this.intentMap.set(intent, this.intents.length);
      this.intents.push(intent);
    }
  }

  learnFeature(feature) {
    if (!this.featureMap.has(feature)) {
      this.featureMap.set(feature, this.numFeature);
      this.numFeature += 1;
    }
  }

  setProcessFunction() {
    if (!this.process) {
      if (!this.processor) {
        this.processor = this.container.get('processor') || new Processor();
      }
      this.process = (str) => this.processor.process(str, this.locale);
    }
  }

  encodeText(text, learn = false) {
    const dict = {};
    const keys = [];
    const features = this.process(text);
    features.forEach((feature) => {
      if (learn) {
        this.learnFeature(feature);
      }
      const index = this.featureMap.get(feature);
      if (index !== undefined && dict[index] === undefined) {
        dict[index] = 1;
        keys.push(index);
      }
    });
    return keys;
  }

  encode(text, intent, learn = false) {
    if (learn) {
      this.learnIntent(intent);
    }
    return {
      input: this.encodeText(text, learn),
      output: this.intentMap.get(intent),
    };
  }

  encodeCorpus(corpus) {
    if (corpus.locale) {
      this.locale = corpus.locale || 'en';
      this.locale = this.locale.slice(0, 2).toLowerCase();
      return this.encodeCorpus(corpus.data);
    }
    this.setProcessFunction();
    const result = { train: [], validation: [] };
    corpus.forEach(({ utterances, intent }) => {
      if (utterances) {
        utterances.forEach((utterance) => {
          result.train.push(this.encode(utterance, intent, true));
        });
      }
    });
    corpus.forEach(({ tests, intent }) => {
      if (tests) {
        tests.forEach((test) => {
          result.validation.push(this.encode(test, intent));
        });
      }
    });
    return result;
  }

  toJSON() {
    return {
      locale: this.locale,
      intents: this.intents,
      features: Array.from(this.featureMap.keys()),
    };
  }

  fromJSON(json) {
    this.locale = json.locale;
    this.intents = json.intents;
    this.featureMap = new Map();
    this.intentMap = new Map();
    json.features.forEach((feature, index) => {
      this.featureMap.set(feature, index);
    });
    this.numFeature = json.features.length;
    this.intents.forEach((intent, index) => {
      this.intentMap.set(intent, index);
    });
    this.setProcessFunction();
  }
}

module.exports = { Encoder };
