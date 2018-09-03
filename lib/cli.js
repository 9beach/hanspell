#!/usr/bin/env node

/** 
 * @fileOverview Command line interface for hanspell.
 */
'use strict';

// sentence to fix
var sentence = '';

// prevents duplicate replacements
var typoMap = new Map();

const chalk = require('chalk');

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
var minimatch = require("minimatch");

// fixes a typo, and prints log
function fixTypo(input, output) {
  if (sentence.indexOf(input) == -1 || input.indexOf('\n') != -1) {
    return;
  }

  if (ignores && minimatch(input, ignores)) {
    return;
  }

  var match = output.suggestions[0];
  if (output.suggestions.length > 1) {
    match = match + chalk.grey(" ↔ " + output.suggestions.slice(1).join(", "));
  }

  // output.suggestions[0] may have troubles with RegExp
  try {
    if (input != output.suggestions[0]) {
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
    console.error(input + chalk.grey(' → ') + match);
    console.error(chalk.grey(output.info));
  } catch (err) {
    console.error(input + chalk.grey(' → ') + match);
    console.error(chalk.grey(output.info));
  }
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
const HTTP_TIMEOUT = 80000;

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

function checkAll() {
  const input = sentence;
  hanspell.spellCheckByDAUM(input, HTTP_TIMEOUT, 
    fixTypos, function() {
      hanspell.spellCheckByPNU(input, HTTP_TIMEOUT, 
        fixTypos, writeFixedSentence);
    });
}

function checkJoint() {
  function buildMap(data) {
    for (var i = 0; i < data.length; ++i) {
      typoMap.set(data[i].token, data[i]);
    }
  }
  function fixJointTypos(data) {
    for (var i = 0; i < data.length; ++i) {
      if (typoMap.get(data[i].token) != null) {
        typoMap.delete(data[i].token);
        fixTypo(data[i].token, data[i]);
      }
    }
  }
  hanspell.spellCheckByPNU(sentence, HTTP_TIMEOUT, buildMap, function() {
    hanspell.spellCheckByDAUM(sentence, HTTP_TIMEOUT, fixJointTypos, 
      writeFixedSentence);
  });
}

// reads `.hanspell-ignores` and sentence from stdin, and calls one of four
// functions above
function readAndCheck(check) {
  var fs = require('fs');
  try {
    var contents = fs.readFileSync(process.env.HOME + '/.hanspell-ignore', 
      'utf8');
    ignores = "{" + contents.replace(/\n/g, ',') + "}";
  } catch (err) {
  }

  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  rl.on('line', function(input) {
    sentence += input + "\n";
  });
  rl.on('close', function () {
    if (sentence.length > 0) {
      check();
    }
  });
}

const HELP = 
`사용법: hanspell-cli [-d | -p | -j | -a | -h]

옵션:
  -d, --daum              다음 서비스를 이용해서 맞춤법을 교정합니다
  -p, --pnu               부산대학교 서비스를 이용해서 맞춤법을 교정합니다
  -j, --joint             두 서비스의 공통 결과만 반영해서 맞춤법을 교정합니다
  -a, --all [default]     두 서비스의 모든 결과를 반영해서 맞춤법을 교정합니다
  -h, --info              도움말을 출력합니다`;

if (process.argv.length > 3) {
  console.log(HELP);
  process.exit(1);
} else if (process.argv.length == 2) {
  process.argv.push('-a');
}

process.argv.slice(2).forEach(function (opt) {
  if (opt == '-a' || opt == '--all') {
    readAndCheck(checkAll);
  } else if (opt == '-j' || opt == '--joint') {
    readAndCheck(checkJoint);
  } else if (opt == '-d' || opt == '--daum') {
    readAndCheck(checkDAUM);
  } else if (opt == '-p' || opt == '--pnu') {
    readAndCheck(checkPNU);
  } else {
    console.log(HELP);
    process.exit(1);
  }
});
