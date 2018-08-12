#!/usr/bin/env node

/** 
 * @fileOverview Command line interface for hanspell.
 */
'use strict';

const HELP = 
`사용법: hanspell-cli [-d | -p | -j | -a]

옵션:
  -d, --daum              다음 서비스를 이용해서 맞춤법을 교정합니다
  -p, --pnu               부산대학교 서비스를 이용해서 맞춤법을 교정합니다
  -j, --joint             두 서비스의 공통 결과만 반영해서 맞춤법을 교정합니다
  -a, --all [default]     두 서비스의 모든 결과를 반영해서 맞춤법을 교정합니다`;

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

const indexOfAny = require('./split-string').indexOfAny; 

// fixes a typo of sentence
function fixTypo(input, output) {
  // to avoid ambiguous replacement, checks word boundry.
  // but if input includes RegExp escape characters,
  // then we do not use RegExp, and also not ambiguous.
  try {
    if (indexOfAny(input, "()[]\n\r\t+-!'\"") != -1) {
      // FIXME: if output includes input, then loops forever
      var index = 0;
      do {
        sentence = sentence.replace(input, output);
      } while((index = sentence.indexOf(input, index + 1)) != -1);
    } else {
      // word boundry check of utf-8
      sentence = sentence.replace(new RegExp("(^\|[ \n\r\t.,'\"\+!?-]+)(" +
        input + ")([ \n\r\t.,'\"\+!?-]+\|$)", "g"), "\$1" + output + "\$3");
    }
    console.error("# hanspell-cli: " + input + " -> " + output);
  } catch (err) {
    console.error("# hanspell-cli error: " + input + " -> " + output);
  }
}

// callback function to build typo map
function buildMap(data) {
  for (var i = 0; i < data.length; ++i) {
    if (data[i].errorInput != data[i].errorOutput) {
      typoMap.set(data[i].errorInput, data[i].errorOutput);
    }
  }
}

// callback function to build joint typo map
function buildJointMap(data) {
  for (var i = 0; i < data.length; ++i) {
    if (data[i].errorInput != data[i].errorOutput) {
      if (typoMap.get(data[i].errorInput) != null) {
        jointTypoMap.set(data[i].errorInput, data[i].errorOutput);
      }
    } 
  }
}

// callback function for the end of building map
function fixTyposAndWrite() {
  typoMap.forEach(function (v, k) { fixTypo(k, v); });
  process.stdout.write(sentence);
}

// callback function for the end of building joint map
function fixJointTyposAndWrite() {
  jointTypoMap.forEach(function (v, k) { fixTypo(k, v); });
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
  process.stdin.on('end', check);
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
