#!/usr/bin/env node

/** 
 * @fileOverview Command line interface for hanspell.
 */
'use strict';

const HELP = 
`사용법: hanspell-cli [-d | -p | -j | -a | -h]

옵션:
  -d, --daum              다음 서비스를 이용해서 맞춤법을 교정합니다
  -p, --pnu               부산대학교 서비스를 이용해서 맞춤법을 교정합니다
  -j, --joint             두 서비스의 공통 결과만 반영해서 맞춤법을 교정합니다
  -a, --all [default]     두 서비스의 모든 결과를 반영해서 맞춤법을 교정합니다
  -h, --help              도움말을 출력합니다`;

// check if argv is valid
if (process.argv.length > 3) {
  console.log(HELP);
  process.exit(1);
} else if (process.argv.length == 2) {
  process.argv.push('-a');
}

// sentence to check
var sentence = '';

// saves typos before fixing sentence
var typoMap = new Map();

// for `--joint` option
var jointTypoMap = new Map();

// fixes a typo of sentence
function fixTypo(input, output) {
  // FIXME: to avoid ambiguous replacement, checks word boundry
  var found = 0;
  while(found = sentence.indexOf(input, found), found != -1) {
    sentence = sentence.substr(0, found) + output.match + 
      sentence.substr(found + input.length);
    found = found + output.match.length;
  }
  var match = output.match;
  if (output.alternativeMatches != null) {
    match = match + " (" + output.alternativeMatches.join(", ") + ")";
  }
  input = input.replace(/[\r\n][\r\n]*/g, '<return>'); 
  match = match.replace(/[\r\n][\r\n]*/g, '<return>'); 
  console.error("-- 교정 제안: " + input + " -> " + match);
  console.error(output.help);
}

// callback function to build typo map
function buildMap(data) {
  for (var i = 0; i < data.length; ++i) {
    typoMap.set(data[i].text, data[i]);
  }
}

// callback function to build joint typo map
function buildJointMap(data) {
  for (var i = 0; i < data.length; ++i) {
    if (typoMap.get(data[i].text) != null) {
      jointTypoMap.set(data[i].text, data[i]);
    }
  }
}

// callback function for the end of building map
function fixTyposAndWrite() {
  typoMap.forEach(function (v, k) { fixTypo(k, v); });
  console.error("-- 한스펠 로그 끝");
  process.stdout.write(sentence);
}

// callback function for the end of building joint map
function fixJointTyposAndWrite() {
  jointTypoMap.forEach(function (v, k) { fixTypo(k, v); });
  console.error("-- 한스펠 로그 끝");
  process.stdout.write(sentence);
}

const hanspell = require('./index'); 

const HTTP_TIMEOUT = 80000;

// four functions below call hanspell interface
function checkDAUM() {
  hanspell.checkSpellWithDAUM(sentence, HTTP_TIMEOUT, buildMap, 
    fixTyposAndWrite);
}

function checkPNU() {
  hanspell.checkSpellWithPNU(sentence, HTTP_TIMEOUT, buildMap, 
    fixTyposAndWrite);
}

function checkJoint() {
  hanspell.checkSpellWithPNU(sentence, HTTP_TIMEOUT, buildMap, function() {
    hanspell.checkSpellWithDAUM(sentence, HTTP_TIMEOUT, buildJointMap, 
      fixJointTyposAndWrite);
  });
}

function checkAll() {
  hanspell.checkSpellWithPNU(sentence, HTTP_TIMEOUT, buildMap, function() {
    hanspell.checkSpellWithDAUM(sentence, HTTP_TIMEOUT, buildMap, 
      fixTyposAndWrite);
  });
}

// reads sentence from stdin, and calls one of four functions above
function readAndCheck(check) {
  process.stdin.resume();
  process.stdin.on('data', function(buf) {
    sentence += buf.toString();
  });
  process.stdin.on('end', function () {
    console.error("-- 한스펠 로그 시작");
    check();
  });
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
