const FullPairTokenizer = require('./tokenizers').FullPairTokenizer;
const assert = require('assert');

function testFullPairTokenizer() {
  const tokenizer = new FullPairTokenizer('data/vocab.txt');
  const first = 'How do I control my horny emotions?';
  const second = 'How do you control your horniness?';
  const maxLen = 128;
  const tokens = tokenizer.tokenize(first, second, maxLen);
  let segmentIds = tokenizer.convertTokensToSegments(tokens);
  let inputMask = tokenizer.convertTokensToMask(tokens);
  let inputIds = tokenizer.convertTokensToIds(tokens);
  [inputIds, segmentIds, inputMask] = tokenizer.padding(inputIds, segmentIds, inputMask, maxLen);
  console.log('tokens:', tokens.join(' '));
  console.log('input_ids:', inputIds.join(' '));
  console.log('segment_ids:', segmentIds.join(' '));
  console.log('input_mask', inputMask.join(' '));
  assert('[CLS] how do i control my horn ##y emotions ? [SEP] how do you control your horn ##iness ? [SEP]' === tokens.join(' '), 'tokenize error.');
  assert('101 2129 2079 1045 2491 2026 7109 2100 6699 1029 102 2129 2079 2017 2491 2115 7109 9961 1029 102 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0' === inputIds.join(' '), 'convertTokensToIds error.');
  assert('1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0' === inputMask.join(' '), 'convertTokensToMask error.');
  assert('0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0' === segmentIds.join(' '), 'convertTokensToSegments error.');
  console.log('test pass!');
}

testFullPairTokenizer();
