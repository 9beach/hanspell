#!/usr/bin/env node

/** 
 * @fileOverview Command line interface for hanspell.
 */
'use strict';

// sentence to fix
var sentence = '';

// prevents duplicate replacements
var typoMap = new Map();

// node v8 support zero-length lookahead and lookbehind assertions
const lookaround = process.version > 'v8';

// fixes a typo, and prints log
function fixTypo(input, output) {
  if (sentence.indexOf(input) == -1 || input.indexOf('\n') != -1) {
    return;
  }

  var match = output.match;
  if (output.alternativeMatches != null) {
    match = match + " (" + output.alternativeMatches.join(", ") + ")";
  }

  // output.match may have troubles with RegExp
  try {
    // escape regular expression special characters
    var escaped = input.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // check word boundary using zero-length assertions
    if (lookaround) {
      escaped = '(?<=[^ㄱ-ㅎㅏ-ㅣ가-힣])' + escaped + '(?=[^ㄱ-ㅎㅏ-ㅣ가-힣])';
    }
    sentence = sentence.replace(new RegExp(escaped, 'g'), output.match);

    console.error("-- 교정 제안: " + input + " -> " + match);
    console.error(output.help);
  } catch (err) {
    console.error("-- 한스펠 오류: 정규 표현식 오류로 교정 실패 (" + 
      input + " -> " + match + ")");
    console.error(output.help);
  }
}

// loops to check typo map and to call `fixTypo`
function fixTypos(data) {
  for (var i = 0; i < data.length; ++i) {
    if (typoMap.get(data[i].text) == null) {
      fixTypo(data[i].text, data[i]);
      typoMap.set(data[i].text, true);
    }
  }
}

const hanspell = require('./index'); 
const HTTP_TIMEOUT = 80000;

function sayGoodbye() {
  console.error("-- 한스펠 로그 끝");
  process.stdout.write(sentence);
}

// four functions below call hanspell interface
function checkDAUM() {
  hanspell.spellCheckByDAUM(sentence, HTTP_TIMEOUT, fixTypos, sayGoodbye);
}

function checkPNU() {
  hanspell.spellCheckByPNU(sentence, HTTP_TIMEOUT, fixTypos, sayGoodbye);
}

function checkAll() {
  const input = sentence;
  hanspell.spellCheckByDAUM(input, HTTP_TIMEOUT, 
    fixTypos, function() {
      hanspell.spellCheckByPNU(input, HTTP_TIMEOUT, 
        fixTypos, sayGoodbye);
    });
}

function checkJoint() {
  function buildMap(data) {
    for (var i = 0; i < data.length; ++i) {
      typoMap.set(data[i].text, data[i]);
    }
  }
  function fixJointTypos(data) {
    for (var i = 0; i < data.length; ++i) {
      if (typoMap.get(data[i].text) != null) {
        typoMap.delete(data[i].text);
        fixTypo(data[i].text, data[i]);
      }
    }
  }
  hanspell.spellCheckByPNU(sentence, HTTP_TIMEOUT, buildMap, function() {
    hanspell.spellCheckByDAUM(sentence, HTTP_TIMEOUT, fixJointTypos, 
      sayGoodbye);
  });
}

// reads sentence from stdin, and calls one of four functions above
function readAndCheck(check) {
  process.stdin.resume();
  process.stdin.on('data', function(buf) {
    sentence += buf.toString();
  });
  process.stdin.on('end', function () {
    if (sentence.length > 0) {
      console.error("-- 한스펠 로그 시작");
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
  -h, --help              도움말을 출력합니다`;

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
