#!/usr/bin/env node

/**
 * @fileOverview Command line interface for hanspell.
 */

const chalk = require('chalk');
const fs = require('fs');
const minimatch = require('minimatch');
const readline = require('readline');

const hanspell = require('./index');

// Sentence to fix.
let sentence = '';

// Prevents duplicate replacements.
const typomap = new Map();

// Node v8 supports zero-length lookahead and lookbehind assertions.
const lookaround = (() => {
  try {
    RegExp('(?<=[^ㄱ-ㅎㅏ-ㅣ가-힣])test(?=[^ㄱ-ㅎㅏ-ㅣ가-힣])');
    return true;
  } catch (err) {
    return false;
  }
})();

// `~/.hanspell-ignore` file contents.
let ignores;

const homedir = process.env.HOME || process.env.USERPROFILE;
const hist = fs.createWriteStream(`${homedir}/.hanspell-history`, {
  flags: 'a',
});

// Fixes a typo, and saves it to log.
function fixTypo(input, output) {
  if (ignores && minimatch(input, ignores)) {
    return;
  }

  const match = output.suggestions.join(chalk.grey(', '));

  // `output.suggestions[0]` may have troubles with RegExp, so we try.
  try {
    if (input !== output.suggestions[0]) {
      hist.write(`${input} -> ${output.suggestions[0]}\n`);

      // Escapes regular expression special characters.
      let escaped = input.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Checks word boundary using zero-length assertions.
      if (lookaround) {
        escaped = `(^|(?<=[^ㄱ-ㅎㅏ-ㅣ가-힣]))${escaped}((?=[^ㄱ-ㅎㅏ-ㅣ가-힣])|$)`;
      }
      sentence = sentence.replace(
        new RegExp(escaped, 'g'),
        chalk.inverse(output.suggestions[0]),
      );
    }
  } catch (err) {
    return;
  }
  console.error(input + chalk.grey(' -> ') + match);
  if (output.info) console.error(chalk.grey(output.info));
}

// Loops to check typo map and to call `fixTypo`.
function fixTypos(data) {
  data.forEach((typo) => {
    if (typomap.get(typo.token) == null) {
      fixTypo(typo.token, typo);
      typomap.set(typo.token, true);
    }
  });
}

const HTTP_TIMEOUT =
  process.env.HANSPELL_TIMEOUT != null
    ? parseInt(process.env.HANSPELL_TIMEOUT, 10)
    : 20000;

// Writes spell-checked sentence to console.
function printSentence() {
  process.stdout.write(sentence);
  if (sentence[sentence.length - 1] !== '\n') {
    process.stdout.write('\n');
  }
}

// Spell check by DAUM service.
function checkDAUM() {
  hanspell.spellCheckByDAUM(sentence, HTTP_TIMEOUT, fixTypos, printSentence);
}

// Spell check by PNU service.
function checkPNU() {
  hanspell.spellCheckByPNU(sentence, HTTP_TIMEOUT, fixTypos, printSentence);
}

// Spell check by PNU service and DAUM service.
function checkAll() {
  const input = sentence;
  hanspell.spellCheckByPNU(input, HTTP_TIMEOUT, fixTypos, () =>
    hanspell.spellCheckByDAUM(input, HTTP_TIMEOUT, fixTypos, printSentence),
  );
}

/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

// Reads `.hanspell-ignore` and sentence from stdin, and calls one of four
// functions above.
function readAndCheck(check) {
  try {
    const contents = `{${fs
      .readFileSync(`${homedir}/.hanspell-ignore`, 'utf8')
      .replace(/[,{}]/g, '\\$&')
      .replace(/\n\n*/g, ',')}}`;
    if (contents.length > 3) {
      ignores = contents;
    } else {
      ignores = '';
    }
  } catch (err) {}

  // `readline` handles terminal encoding and EOF signal in MS Windows.
  if (process.stdin.isTTY) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
      prompt: '',
    });

    rl.on('line', (input) => {
      sentence += `${input}\n`;
    }).on('close', () => {
      if (sentence.length > 0) {
        check();
      }
    });
  } else {
    process.stdin.resume();
    process.stdin.on('data', (buf) => {
      sentence += buf.toString();
    });
    process.stdin.on('end', () => {
      if (sentence.length > 0) check();
    });
  }
}

const HELP = `사용법: hanspell-cli [-d | -p | -a | -h]

옵션:
  -d, --daum [default]    다음 서비스를 이용해서 맞춤법을 교정합니다
  -p, --pnu               부산대학교 서비스를 이용해서 맞춤법을 교정합니다
  -a, --all               두 서비스의 모든 결과를 반영해서 맞춤법을 교정합니다
  -h, --info              도움말을 출력합니다

버그 리포트와 제안: <https://github.com/9beach/hanspell/issues>
한스펠 홈 페이지: <https://github.com/9beach/hanspell/>
`;

if (process.argv.length > 3) {
  console.log(HELP);
  process.exit(1);
} else if (process.argv.length === 2) {
  process.argv.push('-d');
}

process.argv.slice(2).forEach((opt) => {
  if (opt === '-a' || opt === '--all') {
    readAndCheck(checkAll);
  } else if (opt === '-d' || opt === '--daum') {
    readAndCheck(checkDAUM);
  } else if (opt === '-p' || opt === '--pnu') {
    readAndCheck(checkPNU);
  } else {
    console.log(HELP);
    process.exit(1);
  }
});
