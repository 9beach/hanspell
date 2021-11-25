/**
 * @fileOverview Interface for DAUM spell checker.
 */

const Entities = require('html-entities').AllHtmlEntities;
const request = require('request');

const split = require('./split-string').byLength;

const entities = new Entities();
const { decode } = entities;

// Parses attribute from server response.
function getAttr(string, key) {
  const found = string.indexOf(key);
  const firstQuote = string.indexOf('"', found + 1);
  const secondQuote = string.indexOf('"', firstQuote + 1);
  return string.substr(firstQuote + 1, secondQuote - firstQuote - 1);
}

// Parses server response.
function parseJSON(response) {
  const typos = [];
  let found = -1;

  for (;;) {
    found = response.indexOf('data-error-type', found + 1);
    if (found === -1) {
      break;
    }

    const end = response.indexOf('>', found + 1);
    const line = response.substr(found, end - found);
    const typo = {};

    typo.type = decode(getAttr(line, 'data-error-type='));
    typo.token = decode(getAttr(line, 'data-error-input='));
    typo.suggestions = [decode(getAttr(line, 'data-error-output='))];
    typo.context = decode(getAttr(line, 'data-error-context='));

    const infoBegin = response.indexOf('<div>', found);
    let infoEnd = response.indexOf('</div>', infoBegin + 1);
    // In case, info has another <div>.
    const infoNextEnd = response.indexOf('</div>', infoEnd + 1);
    const nextFound = response.indexOf('inner_spell', infoBegin);
    if (infoNextEnd !== -1 && (nextFound === -1 || nextFound > infoNextEnd)) {
      infoEnd = infoNextEnd;
    }

    typo.info = decode(response.substr(infoBegin, infoEnd + 6 - infoBegin))
      .replace(/\t/g, '')
      .replace(/<strong class[^>]*>[^>]*>\n/gi, '')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\n\n\n\n/g, '\n(예)\n')
      .replace(/\n\n*$/g, '')
      .replace(/^[ \n][ \n]*/g, '');

    if (typo.info === '도움말이 없습니다.') delete typo.info;

    typos.push(typo);
  }

  return typos;
}

const DAUM_URL = 'https://dic.daum.net/grammar_checker.do';
const DAUM_MAX_CHARS = 1000;
const DAUM_MIN_INTERVAL = 400;

// Splits a long sentence, and makes spell check requests to the server.
// `check` is called at each short sentence with the parsed JSON parameter.
function spellCheck(sentence, timeout, check, end, error) {
  if (sentence.length === 0) {
    if (end !== null) {
      end();
    }
    return;
  }

  const data = split(sentence, '.,\n', DAUM_MAX_CHARS);
  let count = data.length;

  const getResponse = (err, response, body) => {
    count -= 1;
    if (!err && response.statusCode === 200) {
      if (body.indexOf('="screen_out">맞춤법 검사기 본문</h2>') === -1) {
        console.error(
          `-- 한스펠 오류: 다음 서비스가 유효하지 않은 양식을 반환했습니다. (${DAUM_URL})`,
        );
        console.log(body);
        if (error) error(err);
      } else {
        check(parseJSON(body));
      }
    } else {
      console.error(
        '-- 한스펠 오류: 다음 서버의 접속 오류로 일부 문장 교정에 실패했습니다.',
      );
      if (error) error(err);
    }
    if (count === 0 && end !== null) end();
  };

  let i = 0;

  function post() {
    request.post(
      {
        url: DAUM_URL,
        timeout,
        form: {
          sentence: data[i],
        },
      },
      getResponse,
    );

    i += 1;
    if (i < data.length) {
      setTimeout(post, DAUM_MIN_INTERVAL);
    }
  }

  post();
}

module.exports = spellCheck;
