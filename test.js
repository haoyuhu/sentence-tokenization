const tokenizers = require('./tokenizers');
const assert = require('assert');

const BasicTokenizer = tokenizers.BasicTokenizer;
const WordpieceTokenizer = tokenizers.WordpieceTokenizer;
const FullTokenizer = tokenizers.FullTokenizer;
const FullPairTokenizer = tokenizers.FullPairTokenizer;

const vocabFile = 'data/vocab.txt';

function testBasicTokenizer() {
  const tokenizer = new BasicTokenizer();
  const sentence = 'How do I control my horny emotions?';
  const tokens = tokenizer.tokenize(sentence);
  console.log('tokens:', tokens.join(' '));
  assert('how do i control my horny emotions ?' === tokens.join(' '), 'basic tokenize error.');
  console.log('testBasicTokenizer() testing is passed.\n');
}

function testWordpieceTokenizer() {
  const tokenizer = new WordpieceTokenizer(tokenizers.loadVocab(vocabFile));
  const input = 'unaffable';
  const subTokens = tokenizer.tokenize(input);
  console.log('sub_tokens:', subTokens.join(' '));
  assert('una ##ffa ##ble' === subTokens.join(' '), 'wordpiece tokenize error.');
  console.log('testWordpieceTokenizer() testing is passed.\n');
}

function testFullTokenizer() {
  const tokenizer = new FullTokenizer(vocabFile);
  const sentence = 'How do I control my horny emotions?';
  const tokens = tokenizer.tokenize(sentence);
  const encoded = tokenizer.convertTokensToIds(tokens);
  const decoded = tokenizer.convertIdsToTokens(encoded);
  console.log('tokens:', tokens.join(' '));
  console.log('encoded:', encoded.join(' '));
  console.log('decoded:', decoded.join(' '));
  assert('how do i control my horn ##y emotions ?' === tokens.join(' '), 'full tokenize error.');
  assert('2129 2079 1045 2491 2026 7109 2100 6699 1029' === encoded.join(' '), 'convertTokensToIds error.');
  assert(decoded.join(' ') === tokens.join(' '), 'convertIdsToTokens error.');
  console.log('testFullTokenizer() testing is passed.\n');
}

function testFullPairTokenizer() {
  const tokenizer = new FullPairTokenizer(vocabFile);
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
  assert('[CLS] how do i control my horn ##y emotions ? [SEP] how do you control your horn ##iness ? [SEP]' === tokens.join(' '), 'full pair tokenize error.');
  assert('101 2129 2079 1045 2491 2026 7109 2100 6699 1029 102 2129 2079 2017 2491 2115 7109 9961 1029 102 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0' === inputIds.join(' '), 'convertTokensToIds error.');
  assert('1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0' === inputMask.join(' '), 'convertTokensToMask error.');
  assert('0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0' === segmentIds.join(' '), 'convertTokensToSegments error.');
  console.log('testFullPairTokenizer() testing is passed.');
}

testBasicTokenizer();
testWordpieceTokenizer();
testFullTokenizer();
testFullPairTokenizer();
