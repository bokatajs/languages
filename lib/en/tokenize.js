const contractionsBase = {
  cannot: ['can', 'not'],
  gonna: ['going', 'to'],
  wanna: ['want', 'to'],
};

function tokenize(text) {
  let replaced = text.replace(/n't([ ,:;.!?]|$)/gi, ' not ');
  replaced = replaced.replace(/can't([ ,:;.!?]|$)/gi, 'can not ');
  replaced = replaced.replace(/'ll([ ,:;.!?]|$)/gi, ' will ');
  replaced = replaced.replace(/'s([ ,:;.!?]|$)/gi, ' is ');
  replaced = replaced.replace(/'re([ ,:;.!?]|$)/gi, ' are ');
  replaced = replaced.replace(/'ve([ ,:;.!?]|$)/gi, ' have ');
  replaced = replaced.replace(/'m([ ,:;.!?]|$)/gi, ' am ');
  replaced = replaced.replace(/'d([ ,:;.!?]|$)/gi, ' had ');
  const arr = replaced.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);
  const result = [];
  arr.forEach((item) => {
    const lowitem = item.toLowerCase();
    const contractions = contractionsBase[lowitem];
    if (Array.isArray(contractions)) {
      result.push(...contractions);
    } else {
      result.push(item);
    }
  });
  return result;
}

module.exports = { tokenize };
