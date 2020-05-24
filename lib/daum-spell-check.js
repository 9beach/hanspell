/**
 * @fileOverview Interface for DAUM spell checker.
 */
'use strict';

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const decode = entities.decode;
const request = require('request');

const split = require('./split-string').byLength;

// parses attribute from server response
function getAttr(string, key) {
  const found = string.indexOf(key);
  const firstQuote = string.indexOf('"', found + 1);
  const secondQuote = string.indexOf('"', firstQuote + 1);
  return string.substr(firstQuote + 1, secondQuote - firstQuote - 1);
}

// parses server response
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
    info = info.replace(/\n\n\n\n\n/g, '\n(예)\n');
    info = info.replace(/\n\n*$/g, "");
    info = info.replace(/^[ \n][ \n]*/g, "");

    aTypo['info'] = info;

    typos.push(aTypo);
  }

  return typos;
}

const DAUM_URL          = 'https://dic.daum.net/grammar_checker.do';
const DAUM_MAX_CHARS    = 1000;

// requests spell check to the server. `check` is called at each response
// with the parsed JSON parameter.
function spellCheck(sentence, timeout, check, end, error) {
  const data = split(sentence, ".,\n", DAUM_MAX_CHARS);
  var count = data.length;

  const getResponse = function (err, response, body) {
    count--;
    if (!err && response.statusCode == 200) {
      if (body.indexOf("=\"screen_out\">맞춤법 검사기 본문</h2>") == -1) {
        console.error("-- 한스펠 오류: " +
          "다음 서비스가 유효하지 않은 양식을 반환했습니다. (" +
          DAUM_URL + ")");
        console.log(body);
        if (error) error(err);
      } else {
        check(getJSON(body));
      }
    } else {
      console.error("-- 한스펠 오류: " +
        "다음 서버의 접속 오류로 일부 문장 교정에 실패했습니다.");
      if (error) error(err);
    }
    if (count == 0 && end != null) end();
  };

  for (var i = 0; i < data.length; ++i) {
    request.post({
      url: DAUM_URL,
      timeout: timeout,
      form: {
        sentence: data[i]
      }
    }, getResponse);
  }
}

module.exports = spellCheck;
