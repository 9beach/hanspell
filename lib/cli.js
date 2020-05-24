#!/usr/bin/env node

/** 
 * @fileOverview Command line interface for hanspell.
 */
'use strict';

// sentence to fix
var sentence = '';

// prevents duplicate replacements
var typoMap = new Map();

// inverses console font color
const chalk = require('chalk');

const fs = require('fs');

// node v8 support zero-length lookahead and lookbehind assertions
const lookaround = function () {
  try {
    new RegExp('(?<=[^ㄱ-ㅎㅏ-ㅣ가-힣])test(?=[^ㄱ-ㅎㅏ-ㅣ가-힣])');
    return true;
  } catch (err) {
    return false;
  }
}();

// `~/.hanspell-ignore` file contents
var ignores = null;

// glob expressions
const minimatch = require("minimatch");

const homedir = process.env.HOME || process.env.USERPROFILE;
const hist = fs.createWriteStream(homedir + '/.hanspell-history', {'flags': 'a'});

// fixes a typo, prints and saves a log
function fixTypo(input, output) {
  if (ignores && minimatch(input, ignores)) {
    return;
  }

  const match = output.suggestions.join(chalk.grey(", "));

  // output.suggestions[0] may have troubles with RegExp, so we try
  try {
    if (input != output.suggestions[0]) {
      hist.write(input + ' -> ' + output.suggestions[0] + '\n');

      // escape regular expression special characters
      var escaped = input.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // check word boundary using zero-length assertions
      if (lookaround) {
        escaped = '(^|(?<=[^ㄱ-ㅎㅏ-ㅣ가-힣]))' + escaped + 
          '((?=[^ㄱ-ㅎㅏ-ㅣ가-힣])|$)';
      }
      sentence = sentence.replace(new RegExp(escaped, 'g'), 
        chalk.inverse(output.suggestions[0]));
    }
  } catch (err) {
  }
  console.error(input + chalk.grey(' -> ') + match);
  console.error(chalk.grey(output.info));
}

// loops to check typo map and to call `fixTypo`
function fixTypos(data) {
  for (var i = 0; i < data.length; ++i) {
    if (typoMap.get(data[i].token) == null) {
      fixTypo(data[i].token, data[i]);
      typoMap.set(data[i].token, true);
    }
  }
}

const hanspell = require('./index'); 
const HTTP_TIMEOUT = process.env.HANSPELL_TIMEOUT != null ? 
    parseInt(process.env.HANSPELL_TIMEOUT) : 80000;

// writes fixed sentence to console
function writeFixedSentence() {
  process.stdout.write(sentence);
  if (sentence[sentence.length - 1] != '\n') {
    process.stdout.write('\n');
  }
}

// four functions below call hanspell interface
function checkDAUM() {
  hanspell.spellCheckByDAUM(sentence, HTTP_TIMEOUT, fixTypos, writeFixedSentence);
}

function checkPNU() {
  hanspell.spellCheckByPNU(sentence, HTTP_TIMEOUT, fixTypos, writeFixedSentence);
}

// spell check from union of 2 services' responses
function checkAll() {
  const input = sentence;
  hanspell.spellCheckByDAUM(input, HTTP_TIMEOUT, 
    fixTypos, function() {
      hanspell.spellCheckByPNU(input, HTTP_TIMEOUT, 
        fixTypos, writeFixedSentence);
    });
}

// reads `.hanspell-ignores` and sentence from stdin, and calls one of four
// functions above
function readAndCheck(check) {
  try {
    var contents = fs.readFileSync(homedir + '/.hanspell-ignore', 
      'utf8');
    contents = contents.replace(/[,{}]/g, '');
    contents = "{" + contents.replace(/[\n ][\n ]*/g, ',') + "}";
    if (contents.length > 3) {
      ignores = contents;
    }
  } catch (err) {
  }

  // `readline` handles terminal encoding and EOF signal in MS Windows
  if (Boolean(process.stdin.isTTY)) {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
      prompt: ''
    });
  
    rl.on('line', function(input) {
      sentence += input + "\n";
    }).on('close', function () {
      if (sentence.length > 0) {
        check();
      }
    });
  } else {
    process.stdin.resume();
    process.stdin.on('data', function (buf) {
      sentence += buf.toString();
    });
    process.stdin.on('end', function () {
      if (sentence.length > 0) {
        check();
      }
    });
  }
}

const HELP = 
`사용법: hanspell-cli [-d | -p | -a | -h]

옵션:
  -d, --daum [default]    다음 서비스를 이용해서 맞춤법을 교정합니다
  -p, --pnu               부산대학교 서비스를 이용해서 맞춤법을 교정합니다
  -a, --all               두 서비스의 모든 결과를 반영해서 맞춤법을 교정합니다
  -h, --info              도움말을 출력합니다`;

if (process.argv.length > 3) {
  console.log(HELP);
  process.exit(1);
} else if (process.argv.length == 2) {
  process.argv.push('-d');
}

process.argv.slice(2).forEach(function (opt) {
  if (opt == '-a' || opt == '--all') {
    readAndCheck(checkAll);
  } else if (opt == '-d' || opt == '--daum') {
    readAndCheck(checkDAUM);
  } else if (opt == '-p' || opt == '--pnu') {
    readAndCheck(checkPNU);
  } else {
    console.log(HELP);
    process.exit(1);
  }
});
