/**
 * @fileOverview Interface for Pusan National University spell checker.
 */
'use strict';

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const decode = entities.decode;
const request = require('request');

const split = require('./split-string').byWordCount;

function getJSON(response) {
  var found = -1;
  var typos = [];

  while (found = response.indexOf("class='tdErrWord", found + 1), 
    found != -1) {
    const tokenBegin = response.indexOf(">", found + 1) + 1;
    const tokenEnd = response.indexOf("</TD", tokenBegin);
    const token = decode(response.substr(tokenBegin, tokenEnd - tokenBegin));

    const suggestionsBegin = response.indexOf(">", 
        response.indexOf("class='tdReplace", found)) + 1;
    const suggestionsEnd = response.indexOf("</TD", suggestionsBegin);
    var suggestions = decode(
      response.substr(suggestionsBegin, suggestionsEnd - suggestionsBegin));

    // FIXME: is this right?
    if (suggestions == "대치어 없음") {
      suggestions = [ token ];
    } else {
      suggestions = suggestions.split("<br/>").slice(0, -1);
    }

    const infoBegin = response.indexOf("<TD id='tdHelp", suggestionsEnd + 1);
    const infoEnd = response.indexOf("</TD>", infoBegin + 1) + 5;
    var info = decode(response.substr(infoBegin, infoEnd - infoBegin));
    info = info.replace(/ /g, " "); // demn decode, the former is not a space
    info = info.replace(/<br[^>]*>/gi, "\n");
    info = info.replace(/<[A-Za-z\/][^>]*>/g, "");
    info = info.replace(/^\n\n*/g, "");
    info = info.replace(/\n  *\(예\)/g, "\n(예)\n");
    info = info.replace(/\n  */g, "\n");
    info = info.replace(/\n예 \)/g, "\n(예)");
    info = info.replace(/\n  */g, "\n");
    info = info.replace(/^  */g, "\n");

    var aTypo = {
      token: token,
      suggestions: suggestions,
      info: info
    };

    typos.push(aTypo);
  }

  return typos;
}

const PUSAN_UNIV_MAX_WORDS  = 280; // passive setting, actually 300
const PUSAN_UNIV_URL        = 'http://speller.cs.pusan.ac.kr/PnuWebSpeller/' + 
                              'lib/check.asp';

function spellCheck(sentence, timeout, check, end, error) {
  const data = split(sentence, PUSAN_UNIV_MAX_WORDS);
  var count = data.length;

  const getResponse = function (err, response, body) {
    count--;
    if (!err && response.statusCode == 200) {
      check(getJSON(body));
    } else if (err) {
      console.error("-- 한스펠 오류: " +
        "부산대 서버 접속 오류로 일부 문장 교정 실패");
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
