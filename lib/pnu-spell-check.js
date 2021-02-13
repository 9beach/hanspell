/**
 * @fileOverview Interface for Pusan National University spell checker.
 */

/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

const request = require('request');
const Entities = require('html-entities').AllHtmlEntities;

const split = require('./split-string').byWordCount;

const entities = new Entities();
const { decode } = entities;

// Parses server response.
function getJSON(response) {
  try {
    return response
      .match(/\tdata = \[.*;/g)
      .map((typo) => JSON.parse(typo.substring(8, typo.length - 1)))
      .flat()
      .map((json) => json.errInfo) // errInfo is array.
      .flat()
      .map((pnutypo) => {
        let suggestions = pnutypo.candWord.replace(/\|$/, '');
        if (suggestions === '') {
          suggestions = decode(pnutypo.orgStr);
        }
        const info = pnutypo.help
          .replace(/< *[bB][rR] *\/>/g, '\n')
          .replace(/\n\n/, '\n')
          .replace(/\n\(예\) /, '\n(예)\n');

        return {
          token: decode(pnutypo.orgStr),
          suggestions: decode(suggestions).split('|'),
          info: decode(info),
        };
      });
  } catch (err) {}

  return [];
}

const PUSAN_UNIV_MAX_WORDS = 280;
const PUSAN_UNIV_URL = 'http://speller.cs.pusan.ac.kr/results';

// Requests spell check to the server. `check` is called at each response
// with the parsed JSON parameter.
function spellCheck(sentence, timeout, check, end, error) {
  // Due to PNU server's weired logic
  const data = split(sentence.replace(/\n/g, '\n '), PUSAN_UNIV_MAX_WORDS);
  let count = data.length;

  const getResponse = (err, response, body) => {
    if (!err && response.statusCode === 200) {
      if (body.indexOf('<title>한국어 맞춤법/문법 검사기</title>') === -1) {
        console.error(
          `${
            '-- 한스펠 오류: ' +
            '부산대 서비스가 유효하지 않은 양식을 반환했습니다. ('
          }${PUSAN_UNIV_URL})`,
        );
        if (error) error(err);
      } else {
        check(getJSON(body));
      }
    } else {
      console.error(
        '-- 한스펠 오류: ' +
          '부산대 서버의 접속 오류로 일부 문장 교정에 실패했습니다.',
      );
      if (error) error(err);
    }
    count -= 1;
    if (count === 0 && end !== null) end();
  };

  data.forEach((part) =>
    request.post(
      {
        url: PUSAN_UNIV_URL,
        timeout,
        form: {
          text1: part,
        },
      },
      getResponse,
    ),
  );
}

module.exports = spellCheck;
