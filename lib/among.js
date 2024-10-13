class Among {
  constructor(s, sub, result, method, instance) {
    this.sSize = s.length;
    this.s = s;
    this.substring_i = sub;
    this.result = result;
    this.method = method;
    this.instance = instance;
  }
}

module.exports = { Among };
