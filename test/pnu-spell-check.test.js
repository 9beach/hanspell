const assert = require('assert');
const spellCheck = require('../lib/index').spellCheckByPNU;

const never = () => {
  assert.equal(true, false);
};

describe('spellCheckByPNU', () => {
  it('should fetch 0 data', (done) => {
    const sentence = '';
    const timeout = 4000;
    const check = (data) => {
      assert.equal(data.length, 0);
    };
    spellCheck(sentence, timeout, check, done, never);
  });
  it('should fetch 4 data', (done) => {
    const sentence = `여름 저녁이 푸르를 때\t난 가리라
보리 무성한 사이\t\t\t가느다란 풀 짓밟힌 샛길 속으로.
몽상가인 난, 발에 신선함을 느끼리라.
난 내 벗은 머리를 바람이 스쳐지나가게 내버려두리라.

난 말하지 않으련다, 아무것도 생각지 않으련다.
그러나 한없는 사랑이 내 혼속에 살아오리니
그럼 유랑민처럼 멀리 아주 멀리 가리라,
여인과 같이 있는 것처럼 행복되게, 이리저리 자연을`;
    const timeout = 4000;
    const check = (data) => {
      assert.equal(data.length, 4);
      assert.equal(data[0].token, '스쳐지나가게');
      assert.equal(data[0].suggestions[0], '스쳐 지나가게');
      assert.equal(data[1].token, '내버려두리라');
      assert.equal(data[1].suggestions[0], '내버려 도리라');
      assert.equal(data[2].token, '혼속에');
      assert.equal(data[2].suggestions[0], '혼 속에');
      assert.equal(data[3].token, '행복되게');
      assert.equal(data[3].suggestions[0], '행복하게');
    };
    spellCheck(sentence, timeout, check, done, never);
  });
});
