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
    const inputBegin = response.indexOf(">", found + 1) + 1;
    const inputEnd = response.indexOf("</TD", inputBegin);
    const input = decode(response.substr(inputBegin, inputEnd - inputBegin));

    const outputsBegin = response.indexOf(">", 
        response.indexOf("class='tdReplace", found)) + 1;
    const outputsEnd = response.indexOf("</TD", outputsBegin);
    var outputs = decode(
      response.substr(outputsBegin, outputsEnd - outputsBegin));

    // FIXME: need to do something else
    if (outputs == "대치어 없음") {
      outputs = [ input ];
    } else {
      outputs = outputs.split("<br/>").slice(0, -1);
    }
    const output = outputs[0];

    const helpBegin = response.indexOf("<TD id='tdHelp", outputsEnd + 1);
    const helpEnd = response.indexOf("</TD>", helpBegin + 1) + 5;
    var help = response.substr(helpBegin, helpEnd - helpBegin);
    help = help.replace(/<br[^>]*>/gi, "\n");
    help = help.replace(/<[^>]*>/g, "");
    help = help.replace(/^[\n ][\n ]*/g, "");
    help = decode(help);

    var json = {
      text: input,
      match: output,
      help: help
    };

    if (outputs.length != 1) {
      json['alternativeMatches'] = outputs.slice(1);
    }

    typos.push(json);
  }

  return typos;
}

const PUSAN_UNIV_MAX_WORDS  = 280; // passive setting, actually 300
const PUSAN_UNIV_URL        = 'http://speller.cs.pusan.ac.kr/PnuWebSpeller/' + 
                              'lib/check.asp';

function checkSpell(sentence, timeout, check, end, error) {
  const data = split(sentence, PUSAN_UNIV_MAX_WORDS);
  var count = data.length;

  const getResponse = function (err, response, body) {
    count--;
    if (!err && response.statusCode == 200) {
      check(getJSON(body));
    } else {
      console.error("-- 한스펠 오류: " +
        "부산대 서버 접속 오류로 일부 문장 교정 실패");
      if (error) error(response.statusCode);
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

module.exports = checkSpell;
