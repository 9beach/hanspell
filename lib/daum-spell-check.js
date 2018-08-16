/**
 * @fileOverview Interface for DAUM spell checker.
 */
'use strict';

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const decode = entities.decode;
const request = require('request');

const split = require('./split-string').byLength;

function getAttr(string, key) {
  const found = string.indexOf(key);
  const firstQuote = string.indexOf('"', found + 1);
  const secondQuote = string.indexOf('"', firstQuote + 1);
  return string.substr(firstQuote + 1, secondQuote - firstQuote - 1);
}

function getJSON(response) {
  var found = -1;
  var typos = [];

  while (found = response.indexOf("data-error-type", found + 1), found != -1) {
    const end = response.indexOf(">", found + 1);
    var line = response.substr(found, end - found);
    var aTypo = {};

    aTypo.type = decode(getAttr(line, "data-error-type="));
    aTypo.token = decode(getAttr(line, "data-error-input="));
    aTypo.suggestions = [ decode(getAttr(line, "data-error-output=")) ];
    aTypo.context = decode(getAttr(line, "data-error-context="));

    const infoBegin = response.indexOf('<div>', found);
    var infoEnd = response.indexOf('</div>', infoBegin + 1);
    // in case info has another <div>
    const infoNextEnd = response.indexOf('</div>', infoEnd + 1);
    const nextFound = response.indexOf('inner_spell', infoBegin);
    if (infoNextEnd != -1 && (nextFound == -1 || nextFound > infoNextEnd)) {
      infoEnd = infoNextEnd;
    }

    var info = decode(response.substr(infoBegin, infoEnd + 6 - infoBegin));
    info = info.replace(/\t/g, '');
    info = info.replace(/<strong class[^>]*>[^>]*>\n/gi, '');
    info = info.replace(/<br[^>]*>/gi, "\n");
    info = info.replace(/<[^>]*>/g, "");
    info = info.replace(/\n\n\n\n\n/g, '\n\n(예)\n');
    info = info.replace(/\n\n*$/g, "");
    info = info.replace(/^[ \n][ \n]*/g, "");

    aTypo['info'] = info;

    typos.push(aTypo);
  }

  return typos;
}

const DAUM_URL          = 'http://alldic.daum.net/grammar_checker.do';
const DAUM_MAX_CHARS    = 1000;

function spellCheck(sentence, timeout, check, end, error) {
  const data = split(sentence, ".,\n", DAUM_MAX_CHARS);
  var count = data.length;

  const getResponse = function (err, response, body) {
    count--;
    if (!err && response.statusCode == 200) {
      check(getJSON(body));
    } else if (err) {
      console.error("-- 한스펠 오류: " +
        "다음 서버 접속 오류로 일부 문장 교정 실패");
      if (error) error(err);
    }
    if (count == 0 && end != null) end();
  };

  for (var i = 0; i < data.length; ++i) {
    request.post({
      url: DAUM_URL,
      timeout: timeout,
      form: {
        sentence: sentence
      }
    }, getResponse);
  }
}

module.exports = spellCheck;
