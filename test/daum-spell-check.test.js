const assert = require('assert');
const spellCheck = require('../lib/index').spellCheckByDAUM;

describe('spellCheckByDAUM', function () {
  it('should fetch 2 data', function (done) {
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
      assert.equal(data.length, 2);
      assert.equal(data[0].text, "스쳐지나가게");
      assert.equal(data[0].match, "스쳐 지나가게");
      assert.notEqual(data[0].context.indexOf("람이 스쳐지나가게 내"), -1);
      assert.equal(data[1].text, "혼속에");
      assert.equal(data[1].match, "혼 속에");
      assert.notEqual(data[1].context.indexOf("랑이 내 혼속에 살아"), -1);
    };
    spellCheck(sentence, timeout, check, done);
  });
  it('should fetch 3 data', function (done) {
    const sentence = '한바퀴 돌껀데 말했더만';
    const timeout = 4000;
    const check = function (data) {
      assert.notEqual(data[0].help.indexOf('수사 또는 수관형사와'), -1);
      assert.notEqual(data[0].help.indexOf('다섯 마리'), -1);
      assert.notEqual(data[1].help.indexOf('잘못된 표기로 의존명사'), -1);
      assert.notEqual(data[1].help.indexOf('그 일은 내가'), -1);
      assert.notEqual(data[2].help.indexOf('잘못된 어미입니다'), -1);
      assert.notEqual(data[2].help.indexOf('잤더니만'), -1);
    };
    spellCheck(sentence, timeout, check, done);
  });
});
