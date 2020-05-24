/**
 * @fileOverview Interface for Pusan National University spell checker.
 */
'use strict';

const request = require('request');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const decode = entities.decode;

const split = require('./split-string').byWordCount;

// parses server response
function getJSON(response) {
  var typos = [];

  try {
    response = response.match(/\tdata = \[.*;/g);
    for (var i = 0; i < response.length; ++i) {
      const json = JSON.parse(response[i].substring(8, response[0].length - 1));
      for (var j = 0; j < json.length; ++j) {
        const errInfo = json[j]["errInfo"];
        for (var k = 0; k < errInfo.length; ++k) {
          var suggestions = errInfo[k]["candWord"].replace(/\|$/, '');
          if (suggestions == '') {
            suggestions = decode(errInfo[k]["orgStr"]);
          }
          var info = errInfo[k]["help"].replace(/< *[bB][rR] *\/>/g, "\n");
          info = info.replace(/\n\n/, "\n");
          const aTypo = {
            token: decode(errInfo[k]["orgStr"]),
            suggestions: decode(suggestions).split('|'),
            info: decode(info)
          };

          typos.push(aTypo);
        }
      }
    }
  } catch (err) {
  }

  return typos;
}

const PUSAN_UNIV_MAX_WORDS  = 280; // passive setting, actually 300
const PUSAN_UNIV_URL        = 'http://speller.cs.pusan.ac.kr/results';

// requests spell check to the server. `check` is called at each response
// with the parsed JSON parameter.
function spellCheck(sentence, timeout, check, end, error) {
  // due to PNU server's weired logic
  const data = split(sentence.replace(/\n/g, "\n "), PUSAN_UNIV_MAX_WORDS);
  var count = data.length;

  const getResponse = function (err, response, body) {
    count--;
    if (!err && response.statusCode == 200) {
      if (body.indexOf("<title>한국어 맞춤법/문법 검사기</title>") == -1) {
        console.error("-- 한스펠 오류: " +
          "부산대 서비스가 유효하지 않은 양식을 반환했습니다. (" +
          PUSAN_UNIV_URL + ")");
        if (error) error(err);
      } else {
        check(getJSON(body));
      }
    } else {
      console.error("-- 한스펠 오류: " +
        "부산대 서버의 접속 오류로 일부 문장 교정에 실패했습니다.");
      if (error) error(err);
    }
    if (count == 0 && end != null) end();
  };

  for (var i = 0; i < data.length; ++i) {
    request.post({
      url: PUSAN_UNIV_URL,
      timeout: timeout,
      form: {
        text1: data[i]
      }
    }, getResponse);
  }
}

module.exports = spellCheck;
