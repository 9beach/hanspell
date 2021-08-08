const assert = require('assert');
const spellCheck = require('../lib/index').spellCheckByDAUM;

const never = () => {
  assert.equal(true, false);
};

describe('spellCheckByDAUM', () => {
  it('should fetch 0 data', (done) => {
    const sentence = '';
    const timeout = 4000;
    const check = (data) => {
      assert.equal(data.length, 0);
    };
    spellCheck(sentence, timeout, check, done, never);
  });
  it('should fetch 2 data', (done) => {
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
      assert.equal(data.length, 2);
      assert.equal(data[0].token, '스쳐지나가게');
      assert.equal(data[0].suggestions[0], '스쳐 지나가게');
      assert.notEqual(data[0].context.indexOf('람이 스쳐지나가게 내'), -1);
      assert.equal(data[1].token, '혼속에');
      assert.equal(data[1].suggestions[0], '혼 속에');
      assert.notEqual(data[1].context.indexOf('랑이 내 혼속에 살아'), -1);
    };
    spellCheck(sentence, timeout, check, done, never);
  });
  it('should fetch 3 data', (done) => {
    const sentence = '한바퀴 돌껀데 말했더만';
    const timeout = 4000;
    const check = (data) => {
      assert.notEqual(data[0].suggestions.indexOf('한 바퀴'), -1);
      assert.notEqual(data[1].suggestions.indexOf('돌 건데'), -1);
      assert.notEqual(data[2].suggestions.indexOf('말했더니만'), -1);
    };
    spellCheck(sentence, timeout, check, done, never);
  });
  it('should call check function more than once', (done) => {
    const sentence = '한바퀴 돌껀데 말했더만\n'.repeat(200);
    const timeout = 40000;
    let called = 0;
    let suggested = 0;
    const check = (data) => {
      called += 1;
      suggested += data.length;
      assert.ok(data.length > 2);
    };
    const error = (err) => {
      console.error(err);
    };
    const finalCheck = () => {
      assert.ok(called > 1);
      assert.ok(suggested > 5);
      done();
    };
    spellCheck(sentence, timeout, check, finalCheck, error);
  }).timeout(40000);
});
