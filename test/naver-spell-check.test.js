const assert = require('assert');
const spellCheck = require('../lib/index').spellCheckByNAVER;

const never = () => {
  assert.equal(true, false);
};

describe('spellCheckByNAVER', () => {
  it('should fetch 0 data', (done) => {
    const sentence = '';
    const timeout = 10000;
    const check = (data) => {
      assert.equal(data.length, 0);
    };
    spellCheck(sentence, timeout, check, done, never);
  }).timeout(15000);

  it('should detect typos in a paragraph', (done) => {
    const sentence = `여름 저녁이 푸르를 때 난 가리라
보리 무성한 사이 가느다란 풀 짓밟힌 샛길 속으로.
몽상가인 난, 발에 신선함을 느끼리라.
난 내 벗은 머리를 바람이 스쳐지나가게 내버려두리라.

난 말하지 않으련다, 아무것도 생각지 않으련다.
그러나 한없는 사랑이 내 혼속에 살아오리니
그럼 유랑민처럼 멀리 아주 멀리 가리라,
여인과 같이 있는 것처럼 행복되게, 이리저리 자연을`;
    const timeout = 10000;
    const check = (data) => {
      assert.ok(Array.isArray(data));
      assert.ok(
        data.length >= 1,
        `expected at least 1 typo, got ${data.length}`,
      );
      data.forEach((typo) => {
        assert.equal(typeof typo.token, 'string');
        assert.ok(typo.token.length > 0);
        assert.ok(Array.isArray(typo.suggestions));
        assert.equal(typo.suggestions.length, 1);
        assert.equal(typeof typo.suggestions[0], 'string');
      });
    };
    spellCheck(sentence, timeout, check, done, never);
  }).timeout(15000);

  it('should detect a known typo', (done) => {
    const sentence = '안뇽하세요.';
    const timeout = 10000;
    const check = (data) => {
      assert.equal(data.length, 1);
      assert.equal(data[0].token, '안뇽하세요.');
      assert.equal(data[0].suggestions[0], '안녕하세요.');
    };
    spellCheck(sentence, timeout, check, done, never);
  }).timeout(15000);
});
