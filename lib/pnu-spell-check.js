/**
 * @fileOverview Interface for Pusan National University spell checker.
 */

const request = require('request');
const Entities = require('html-entities').AllHtmlEntities;

const split = require('./split-string').byWordCount;

const entities = new Entities();
const { decode } = entities;

// Parses server response.
function parseJSON(response) {
  try {
    return response
      .match(/\tdata = \[.*;/g)
      .map((data) => JSON.parse(data.substring(8, data.length - 1)))[0][0]
      .errInfo.map((pnutypo) => {
        let suggestions = pnutypo.candWord.replace(/\|$/, '');
        if (suggestions === '') {
          suggestions = decode(pnutypo.orgStr);
        }
        const info = pnutypo.help
          .replace(/< *[bB][rR] *\/>/g, '\n')
          .replace(/\n\n/g, '\n')
          .replace(/\n\(예\) /g, '\n(예)\n')
          .replace(/  \(예\) /g, '\n(예)\n')
          .replace(/   */g, '\n');

        return {
          token: decode(pnutypo.orgStr),
          suggestions: decode(suggestions).split('|'),
          info: decode(info),
        };
      });
  } catch (err) {
    if (
      response.indexOf(
        '기술적 한계로 찾지 못한 맞춤법 오류나 문법  오류가 있을 수 있습니다.',
      ) !== -1
    ) {
      console.error(
        '-- 한스펠 오류: 부산대 서비스가 유효하지 않은 양식을 반환했습니다.',
      );
    }
  }

  return [];
}

const PNU_MAX_WORDS = 250;
const PNU_URL = 'http://speller.cs.pusan.ac.kr/results';

// Splits a long sentence, and makes spell check requests to the server.
// `check` is called at each short sentence with the parsed JSON parameter.
function spellCheck(sentence, timeout, check, end, error) {
  if (sentence.length === 0) {
    if (end !== null) {
      end();
    }
    return;
  }

  // Due to PNU server's weird behavior, replaces '\n' to '\n '.
  const data = split(
    `${sentence.replace(/([^\r])\n/g, '$1\r\n')}\r\n`,
    PNU_MAX_WORDS,
  );
  let count = data.length;

  const getResponse = (err, response, body) => {
    if (!err && response.statusCode === 200) {
      if (body.indexOf('<title>한국어 맞춤법/문법 검사기</title>') === -1) {
        console.error(
          `-- 한스펠 오류: 부산대 서비스가 유효하지 않은 양식을 반환했습니다. (${PNU_URL})`,
        );
        if (error) error(err);
      } else {
        check(parseJSON(body));
      }
    } else {
      console.error(
        '-- 한스펠 오류: 부산대 서버의 접속 오류로 일부 문장 교정에 실패했습니다.',
      );
      if (error) error(err);
    }
    count -= 1;
    if (count === 0 && end !== null) end();
  };

  data.forEach((part) =>
    request.post(
      {
        url: PNU_URL,
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
