/**
 * @fileOverview Interface for DAUM spell checker.
 */
'use strict';

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const decode = entities.decode;
const request = require('request');

const split = require('./split-string').byLength;

function getJSON(response) {
  var found = -1;
  var typos = [];

  while (found = response.indexOf("data-error-type", found + 1), found != -1) {
    const end = response.indexOf(">", found + 1);
    var line = response.substr(found, end - found);
    line = line.replace(/data-error-type=/, "\"errorType\": ");
    line = line.replace(/data-error-input=/, ", \"errorInput\": ");
    line = line.replace(/data-error-output=/, ", \"errorOutput\": ");
    line = line.replace(/data-error-context=/, ", \"errorContext\": ");

    var json = JSON.parse("{" + line + "}");
    json.errorInput = decode(json.errorInput);
    json.errorOutput = decode(json.errorOutput);
    json.errorContext = decode(json.errorContext);
    typos.push(json);
  }

  return typos;
}

const DAUM_URL          = 'http://alldic.daum.net/grammar_checker.do';
const DAUM_MAX_CHARS    = 1000;

function checkSpell(sentence, timeout, check, end, error) {
  const data = split(sentence, ".,\n", DAUM_MAX_CHARS);
  var count = data.length;

  const getResponse = function (err, response, body) {
    count--;
    if (!err && response.statusCode == 200) {
      check(getJSON(body));
    } else if (err) {
      console.error("# hanspell-cli error: " +
        "다음 서버 오류로 일부 문장을 교정하지 못했습니다.");
      if (error) error(response.statusCode);
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

module.exports = checkSpell;
