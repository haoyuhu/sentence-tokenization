const fs = require('fs');

function whitespaceTokenize(text) {
  text = text.trim();
  if (!text) {
    return [];
  }
  return text.split(' ');
}

function isChineseChar(char) {
  const code = char.charCodeAt(0);
  return (code >= 0x4E00 && code <= 0x9FFF) ||
    (code >= 0x3400 && code <= 0x4DBF) ||
    (code >= 0x20000 && code <= 0x2A6DF) ||
    (code >= 0x2A700 && code <= 0x2B73F) ||
    (code >= 0x2B740 && code <= 0x2B81F) ||
    (code >= 0x2B820 && code <= 0x2CEAF) ||
    (code >= 0xF900 && code <= 0xFAFF) ||
    (code >= 0x2F800 && code <= 0x2FA1F);
}

function isControl(char) {
  // Cc or Cf for control characters
  const expr = /[\0-\x1F\x7F-\x9F\xAD\u0600-\u0605\u061C\u06DD\u070F\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]/;
  return !char.replace(expr, '');
}

function isWhitespace(char) {
  if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
    return true;
  }
  // Zs for unicode whitespace
  const expr = /[\x20\xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/;
  return !char.replace(expr, '');
}

function isPunctuation(char) {
  const code = char.charCodeAt(0);
  if ((code >= 33 && code <= 47)
    || (code >= 58 && code <= 64)
    || (code >= 91 && code <= 96)
    || (code >= 123 && code <= 126)) {
    return true;
  }
  // P for unicode punctuation
  const expr = /[\x21-\x23\x25-\x2A\x2C-\x2F\x3A\x3B\x3F\x40\x5B-\x5D\x5F\x7B\x7D\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]/;
  return !char.replace(expr, '');
}

function loadVocab(vocab_file, encoding = 'utf8') {
  const vocab = new Map();
  let index = 0;
  if (!fs.existsSync(vocab_file)) {
    return vocab;
  }
  const options = { encoding };
  const lines = fs.readFileSync(vocab_file, options).split('\n');
  for (let line of lines) {
    line = line.trim();
    if (!line) {
      break;
    }
    vocab.set(line, index);
    index += 1;
  }
  return vocab;
}

function reverseVocab(vocab) {
  const invVocab = new Map();
  for (const [key, value] of vocab) {
    invVocab.set(value, key);
  }
  return invVocab;
}

class BasicTokenizer {
  constructor(doLowerCase = true) {
    this.doLowerCase = doLowerCase;
  }

  tokenize(text) {
    text = BasicTokenizer.cleanText(text);
    /**
     # This was added on November 1st, 2018 for the multilingual and Chinese
     # models. This is also applied to the English models now, but it doesn't
     # matter since the English models were not trained on any Chinese data
     # and generally don't have any Chinese data in them (there are Chinese
     # characters in the vocabulary because Wikipedia does have some Chinese
     # words in the English Wikipedia.).
     */
    text = BasicTokenizer.tokenizeChineseChars(text);
    const originTokens = whitespaceTokenize(text);
    let splitTokens = [];
    for (let token of originTokens) {
      if (this.doLowerCase) {
        token = token.toLowerCase();
        token = BasicTokenizer.runTrimAccents(token);
      }
      splitTokens = splitTokens.concat(BasicTokenizer.runSplitOnPunc(token));
    }
    return whitespaceTokenize(splitTokens.join(' '));
  }

  static runSplitOnPunc(text) {
    let startNewWord = true;
    const output = [];
    for (let i = 0; i < text.length; ++i) {
      const char = text[i];
      if (isPunctuation(char)) {
        output.push([char]);
        startNewWord = true;
      } else {
        if (startNewWord) {
          output.push([]);
        }
        startNewWord = false;
        output[output.length - 1].push(char);
      }
    }
    return output.map(l => l.join(''))
  }

  static runTrimAccents(text) {
    const output = [];
    for (const char of text) {
      // Mn category in unicode
      const expr = /[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D01\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/;
      if (!char.replace(expr, '')) {
        continue;
      }
      output.push(char);
    }
    return output.join('');
  }

  static cleanText(text) {
    const output = [];
    for (let i = 0; i < text.length; ++i) {
      const code = text.charCodeAt(i);
      const char = text.charAt(i);
      if (code === 0 || code === 0xfffd || isControl(char)) {
        continue;
      }
      if (isWhitespace(char)) {
        output.push(' ');
      } else {
        output.push(char);
      }
    }
    return output.join('');
  }

  static tokenizeChineseChars(text) {
    const output = [];
    for (const char of text) {
      if (isChineseChar(char)) {
        output.push(' ', char, ' ');
      } else {
        output.push(char);
      }
    }
    return output.join('');
  }
}

class WordpieceTokenizer {
  constructor(vocab, unkToken = '[UNK]', maxInputCharsPerWord = 200) {
    this.vocab = vocab;
    this.unkToken = unkToken;
    this.maxInputCharsPerWord = maxInputCharsPerWord;
  }

  tokenize(text) {
    /**
     Tokenizes a piece of text into its word pieces.

     This uses a greedy longest-match-first algorithm to perform tokenization
     using the given vocabulary.

     For example:
     input = "unaffable"
     output = ["un", "##aff", "##able"]

     Args:
     text: A single token or whitespace separated tokens. This should have
     already been passed through `BasicTokenizer.

     Returns:
     A list of wordpiece tokens.
     */
    let outputTokens = [];
    for (const token of whitespaceTokenize(text)) {
      if (token.length > this.maxInputCharsPerWord) {
        outputTokens.push(this.unkToken);
        continue;
      }
      let isBad = false;
      let start = 0;
      const subTokens = [];
      while (start < text.length) {
        let end = text.length;
        let currSubStr = null;
        while (start < end) {
          let subStr = text.slice(start, end);
          if (start > 0) {
            subStr = '##' + subStr;
          }
          if (this.vocab.has(subStr)) {
            currSubStr = subStr;
            break;
          }
          end -= 1;
        }
        if (!currSubStr) {
          isBad = true;
          break;
        }
        subTokens.push(currSubStr);
        start = end;
      }
      if (isBad) {
        outputTokens.push(this.unkToken);
      } else {
        outputTokens = outputTokens.concat(subTokens);
      }
    }
    return outputTokens;
  }
}

function convertByVocab(vocab, items) {
  const output = [];
  for (const item of items) {
    output.push(vocab.get(item));
  }
  return output;
}

class FullTokenizer {
  constructor(vocabFile, doLowerCase = true) {
    this.vocab = loadVocab(vocabFile);
    this.invVocab = reverseVocab(this.vocab);
    this.basicTokenizer = new BasicTokenizer(doLowerCase);
    this.wordpieceTokenizer = new WordpieceTokenizer(this.vocab);
  }

  tokenize(text) {
    const splitTokens = [];
    for (const token of this.basicTokenizer.tokenize(text)) {
      for (const subToken of this.wordpieceTokenizer.tokenize(token)) {
        splitTokens.push(subToken);
      }
    }
    return splitTokens;
  }

  convertTokensToIds(tokens) {
    return convertByVocab(this.vocab, tokens);
  }

  convertIdsToTokens(ids) {
    return convertByVocab(this.invVocab, ids);
  }
}

class FullPairTokenizer {
  constructor(vocabFile, startToken = '[CLS]', endToken = '[SEP]', doLowerCase = true) {
    this.startToken = startToken;
    this.endToken = endToken;
    this.fullTokenizer = new FullTokenizer(vocabFile, doLowerCase);
  }

  tokenize(firstText, secondText, maxSeqLength) {
    const firstTokens = this.fullTokenizer.tokenize(firstText);
    const secondTokens = this.fullTokenizer.tokenize(secondText);
    /**
     # Modifies `tokens_a` and `tokens_b` in place so that the total
     # length is less than the specified length.
     # Account for [CLS], [SEP], [SEP] with "- 3"
     */
    maxSeqLength -= 3;
    while (firstTokens.length + secondTokens.length > maxSeqLength) {
      if (firstTokens.length > secondTokens.length) {
        firstTokens.pop();
      } else {
        secondTokens.pop();
      }
    }
    const tokens = [];
    tokens.push(this.startToken);
    for (const token of firstTokens) {
      tokens.push(token);
    }
    tokens.push(this.endToken);
    for (const token of secondTokens) {
      tokens.push(token);
    }
    tokens.push(this.endToken);
    return tokens;
  }

  convertTokensToSegments(tokens) {
    const mid = tokens.indexOf(this.endToken);
    let segments = [];
    segments = segments.concat(Array.from({ length: mid + 1 }).map(() => 0));
    const end = tokens.indexOf(this.endToken, mid + 1);
    segments = segments.concat(Array.from({ length: end - mid }).map(() => 1));
    return segments;
  }

  // noinspection JSMethodCanBeStatic
  convertTokensToMask(tokens) {
    return Array.from({ length: tokens.length }).map(() => 1);
  }

  // noinspection JSMethodCanBeStatic
  padding(inputIds, segmentIds, inputMask, maxSeqLength) {
    while (inputIds.length < maxSeqLength) {
      inputIds.push(0);
    }
    while (segmentIds.length < maxSeqLength) {
      segmentIds.push(0);
    }
    while (inputMask.length < maxSeqLength) {
      inputMask.push(0);
    }
    return [inputIds, segmentIds, inputMask];
  }

  convertTokensToIds(tokens) {
    return this.fullTokenizer.convertTokensToIds(tokens);
  }

  convertIdsToTokens(ids) {
    return this.fullTokenizer.convertIdsToTokens(ids);
  }
}

module.exports = { BasicTokenizer, WordpieceTokenizer, FullTokenizer, FullPairTokenizer };
