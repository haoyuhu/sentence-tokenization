# sentence-tokenization

Simple tool for tokenizing sentences, for **BERT** or other **NLP preprocessing**. You can split the content of sentences and paragraphs into word-level content.

## Usage

### BasicTokenizer

Simply split sentence to words and punctuation based on **whitespace**.

```javascript
const tokenizers = require('./tokenizers');

const BasicTokenizer = tokenizers.BasicTokenizer;

const tokenizer = new BasicTokenizer();
const sentence = 'How do I control my horny emotions?';
const tokens = tokenizer.tokenize(sentence);
console.log('tokens:', tokens);

/*
Output:
tokens: [ 'how', 'do', 'i', 'control', 'my', 'horny', 'emotions', '?' ]
*/
```



### WordpieceTokenizer

This uses a **greedy longest-match-first algorithm** to perform tokenization, simply split word to sub-tokens based on the given vocabulary.

```javascript
const tokenizers = require('./tokenizers');

const WordpieceTokenizer = tokenizers.WordpieceTokenizer;
const vocabFile = 'data/vocab.txt';

const tokenizer = new WordpieceTokenizer(tokenizers.loadVocab(vocabFile));
const input = 'unaffable';
const subTokens = tokenizer.tokenize(input);
console.log('sub_tokens:', subTokens);

/*
Output:
sub_tokens: [ 'una', '##ffa', '##ble' ]
*/
```



### FullTokenizer

Split sentence to word-pieces and punctuation by both **BasicTokenizer** and **WordpieceTokenizer**. What's more, you can encode tokens to ids and decode tokens from ids.

```javascript
const tokenizers = require('./tokenizers');

const FullTokenizer = tokenizers.FullTokenizer;
const vocabFile = 'data/vocab.txt';

const tokenizer = new FullTokenizer(vocabFile);
const sentence = 'How do I control my horny emotions?';
const tokens = tokenizer.tokenize(sentence);
const encoded = tokenizer.convertTokensToIds(tokens);
const decoded = tokenizer.convertIdsToTokens(encoded);
console.log('tokens:', tokens);
console.log('encoded:', encoded);
console.log('decoded:', decoded);

/*
Output:
tokens: [ 'how', 'do', 'i', 'control', 'my', 'horn', '##y', 'emotions', '?' ]
encoded: [ 2129, 2079, 1045, 2491, 2026, 7109, 2100, 6699, 1029 ]
decoded: [ 'how', 'do', 'i', 'control', 'my', 'horn', '##y', 'emotions', '?' ]
*/
```



### FullPairTokenizer

Split sentence pair to word-pieces and punctuation by **FullTokenizer**. What's more, you can encode tokens to ids, decode tokens from ids, and adjust length of all results.

```javascript
const tokenizers = require('./tokenizers');

const FullPairTokenizer = tokenizers.FullPairTokenizer;
const vocabFile = 'data/vocab.txt';

const tokenizer = new FullPairTokenizer(vocabFile);
const first = 'How do I control my horny emotions?';
const second = 'How do you control your horniness?';
const maxLen = 128;
const tokens = tokenizer.tokenize(first, second, maxLen);
let segmentIds = tokenizer.convertTokensToSegments(tokens);
let inputMask = tokenizer.convertTokensToMask(tokens);
let inputIds = tokenizer.convertTokensToIds(tokens);
[inputIds, segmentIds, inputMask] = tokenizer.padding(inputIds, segmentIds, inputMask, maxLen);
console.log('tokens:', tokens);
console.log('input_ids:', inputIds);
console.log('segment_ids:', segmentIds);
console.log('input_mask', inputMask);

/*
Output:
tokens: [ '[CLS]', 'how', 'do', 'i', 'control', 'my', 'horn', '##y', 'emotions', '?', '[SEP]', 'how', 'do', 'you', 'control', 'your', 'horn', '##iness', '?', '[SEP]' ]
input_ids: [ 101, 2129, 2079, 1045, 2491, 2026, 7109, 2100, 6699, 1029, 102, 2129, 2079, 2017, 2491, 2115, 7109, 9961, 1029, 102, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
segment_ids: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
input_mask: [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
*/
```



## Test

```shell
node ./test.js

# Output:
# tokens: how do i control my horny emotions ?
# testBasicTokenizer() testing is passed.

# sub_tokens: una ##ffa ##ble
# testWordpieceTokenizer() testing is passed.

# tokens: how do i control my horn ##y emotions ?
# encoded: 2129 2079 1045 2491 2026 7109 2100 6699 1029
# decoded: how do i control my horn ##y emotions ?
# testFullTokenizer() testing is passed.

# tokens: [CLS] how do i control my horn ##y emotions ? [SEP] how do you control your horn ##iness ? [SEP]
# input_ids: 101 2129 2079 1045 2491 2026 7109 2100 6699 1029 102 2129 2079 2017 2491 2115 7109 9961 1029 102 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
# segment_ids: 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
# input_mask 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
# testFullPairTokenizer() testing is passed.
```



## License

```
MIT License

Copyright (c) 2019 hahahu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
