/**
 * @fileOverview Interface for Pusan National University spell checker.
 */
'use strict';

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const decode = entities.decode;
const request = require('request');

const split = require('./split-string').byWordCount;

function Response2JSON(response) {
  const length = response.length;
  var found = -1;
  var typos = [];

  while (found = response.indexOf("class='tdErrWord", found + 1), found != -1) {
    const inputBegin = response.indexOf(">", found + 1) + 1;
    const inputEnd = response.indexOf("<", inputBegin);
    const input = response.substr(inputBegin, inputEnd - inputBegin);
    const outputBegin = response.indexOf(">", 
        response.indexOf("class='tdReplace", found)) + 1;
    const outputEnd = response.indexOf("<", outputBegin);
    const output = response.substr(outputBegin, outputEnd - outputBegin);
    if (output == "대치어 없음") continue;
    typos.push({
      errorInput: decode(input),
      errorOutput: decode(output)
    });
  }

  return typos;
}

const PUSAN_UNIV_MAX_WORDS  = 280; // passive setting, actually 300
const PUSAN_UNIV_URL        = 'http://speller.cs.pusan.ac.kr/PnuWebSpeller/' + 
                              'lib/check.asp';

function checkSpell(sentence, timeout, check, end, error) {
  const data = split(sentence, PUSAN_UNIV_MAX_WORDS);
  var count = data.length;

  for (var i = 0; i < data.length; ++i) {
    request.post({
      url: PUSAN_UNIV_URL,
      timeout: timeout,
      form: {
        text1: data[i]
      }
    }, function (err, response, body) {
      count--;
      if (!err && response.statusCode == 200) {
        check(Response2JSON(body));
      } else {
        console.error("# hanspell-cli error: " +
            "부산대 서버 오류로 일부 문장을 교정하지 못했습니다.");
        if (error) error(response.statusCode);
      }
      if (count == 0 && end != null) end();
    });
  }
}

module.exports = checkSpell;
