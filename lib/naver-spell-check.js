/**
 * @fileOverview Interface for Naver spell checker.
 */

const { decode } = require('html-entities');

const split = require('./split-string').byWordCount;

// Naver의 SpellerProxy는 GET 쿼리스트링 길이 한도가 약 3300자 (대략 한글
// 100단어). 안전 여유를 두고 80단어로 청크를 자릅니다.
const NAVER_MAX_WORDS = 80;
const NAVER_MIN_INTERVAL = 400;
const NAVER_PROXY_URL =
  'https://m.search.naver.com/p/csearch/ocontent/util/SpellerProxy';
const NAVER_PASSPORT_PAGE =
  'https://search.naver.com/search.naver?query=%EB%A7%9E%EC%B6%A4%EB%B2%95+%EA%B2%80%EC%82%AC%EA%B8%B0';
const NAVER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const COLOR_INFO = {
  red: '맞춤법 오류입니다.',
  green: '띄어쓰기 오류입니다.',
  blue: '표준어 의심이거나 대치어 추천입니다.',
  violet: '통계적 교정입니다.',
};

let cachedPassportKey = null;

async function fetchPassportKey() {
  const res = await fetch(NAVER_PASSPORT_PAGE, {
    headers: { 'User-Agent': NAVER_UA },
  });
  const body = await res.text();
  const m = body.match(/passportKey=([a-f0-9]+)/);
  if (!m) {
    throw new Error('네이버 passportKey 추출 실패');
  }
  return m[1];
}

async function getPassportKey(forceRefresh) {
  if (!forceRefresh && cachedPassportKey) return cachedPassportKey;
  cachedPassportKey = await fetchPassportKey();
  return cachedPassportKey;
}

// Strips the `jQuery(...)` JSONP wrapper.
function unwrapJsonp(body) {
  const start = body.indexOf('(');
  const end = body.lastIndexOf(')');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('네이버 응답 파싱 실패');
  }
  return JSON.parse(body.substring(start + 1, end));
}

// Parses Naver response into `[{ token, suggestions, info }]`.
function parseResult(result) {
  if (!result || result.errata_count === 0) return [];

  const origins = [];
  const reSpan = /<span class='result_underline'>([\s\S]*?)<\/span>/g;
  let m = reSpan.exec(result.origin_html);
  while (m !== null) {
    origins.push(m[1]);
    m = reSpan.exec(result.origin_html);
  }

  const fixes = [];
  const reEm = /<em class='([a-z]+)_text'>([\s\S]*?)<\/em>/g;
  m = reEm.exec(result.html);
  while (m !== null) {
    fixes.push({ color: m[1], text: m[2] });
    m = reEm.exec(result.html);
  }

  const len = Math.min(origins.length, fixes.length);
  const typos = [];
  for (let i = 0; i < len; i += 1) {
    typos.push({
      token: decode(origins[i]),
      suggestions: [decode(fixes[i].text)],
      info: COLOR_INFO[fixes[i].color] || '',
    });
  }
  return typos;
}

async function callNaver(text, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const tryOnce = async () => {
    const key = await getPassportKey(false);
    const url = `${NAVER_PROXY_URL}?_callback=jQuery&q=${encodeURIComponent(
      text,
    )}&where=nexearch&color_blindness=0&passportKey=${key}`;
    return fetch(url, {
      headers: {
        'User-Agent': NAVER_UA,
        Referer: 'https://search.naver.com/',
      },
      signal: controller.signal,
    });
  };

  try {
    let res = await tryOnce();
    let body = await res.text();
    if (body.includes('유효한 키가 아닙니다')) {
      cachedPassportKey = null;
      res = await tryOnce();
      body = await res.text();
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return body;
  } finally {
    clearTimeout(timer);
  }
}

// Splits a long sentence, and makes spell check requests to the server.
// `check` is called at each short sentence with the parsed array.
function spellCheck(sentence, timeout, check, end, error) {
  if (sentence.length === 0) {
    if (end) end();
    return;
  }

  // Removes HTML tags.
  const cleaned = sentence.replace(/<[^ㄱ-ㅎㅏ-ㅣ가-힣>]+>/g, '');
  const parts = split(cleaned, NAVER_MAX_WORDS);
  let count = parts.length;

  const handleOne = async (part) => {
    try {
      const body = await callNaver(part, timeout);
      const json = unwrapJsonp(body);
      const result = json && json.message && json.message.result;
      if (!result) {
        const err = (json && json.message && json.message.error) || '응답 없음';
        console.error(
          `-- 한스펠 오류: 네이버 서비스가 유효하지 않은 양식을 반환했습니다. (${err})`,
        );
        if (error) error(new Error(err));
      } else {
        check(parseResult(result));
      }
    } catch (err) {
      console.error(
        '-- 한스펠 오류: 네이버 서버의 접속 오류로 일부 문장 교정에 실패했습니다.',
      );
      if (error) error(err);
    } finally {
      count -= 1;
      if (count === 0 && end) end();
    }
  };

  let i = 0;
  function fireNext() {
    handleOne(parts[i]);
    i += 1;
    if (i < parts.length) setTimeout(fireNext, NAVER_MIN_INTERVAL);
  }
  fireNext();
}

module.exports = spellCheck;
