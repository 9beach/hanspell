const assert = require('assert');
const spellCheck = require('../lib/index').spellCheckByPNU;

describe('spellCheckByPNU', function () {
  it('should fetch 4 data', function (done) {
    const sentence = 
`여름 저녁이 푸르를 때 난 가리라
보리 무성한 사이 가느다란 풀 짓밟힌 샛길 속으로.
몽상가인 난, 발에 신선함을 느끼리라.
난 내 벗은 머리를 바람이 스쳐지나가게 내버려두리라.

난 말하지 않으련다, 아무것도 생각지 않으련다.
그러나 한없는 사랑이 내 혼속에 살아오리니
그럼 유랑민처럼 멀리 아주 멀리 가리라,
여인과 같이 있는 것처럼 행복되게, 이리저리 자연을`;
    const timeout = 4000;
    const check = function (data) {
      assert.equal(data.length, 4);
      assert.equal(data[0].text, "스쳐지나가게");
      assert.equal(data[0].match, "스쳐 지나가게");
      assert.equal(data[1].text, "내버려두리라");
      assert.equal(data[1].match, "내버려 도리라");
      assert.equal(data[2].text, "혼속에");
      assert.equal(data[2].match, "혼 속에");
      assert.equal(data[3].text, "행복되게");
      assert.equal(data[3].match, "행복하게");
    };
    spellCheck(sentence, timeout, check, done);
  });
  it('should have alternative matches', function (done) {
    const sentence = '리랜드는 얼굴 골격이 굵은 게, 어머니 쪽을 닮았다.';
    const timeout = 4000;
    const check = function (data) {
      assert.notEqual(data[0].help.indexOf('이 어절은 분석할 수 없으므로'), -1);
      assert.equal(data[0].alternativeMatches.length, 1);
      assert.equal(data[0].alternativeMatches[0].indexOf('시랜드'), 0);
    };
    spellCheck(sentence, timeout, check, done);
  });
});
