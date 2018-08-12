const checkSpell = require('../lib/index').checkSpellWithPNU;
const sentence = 
`여름 저녁이 푸르를 때 난 가리라
보리 무성한 사이 가느다란 풀 짓밟힌 샛길 속으로.
몽상가인 난, 발에 신선함을 느끼리라.
난 내 벗은 머리를 바람이 스쳐지나가게 내버려두리라.

난 말하지 않으련다, 아무것도 생각지 않으련다.
그러나 한없는 사랑이 내 혼속에 살아오리니
그럼 유랑민처럼 멀리 아주 멀리 가리라,
여인과 같이 있는 것처럼 행복되게, 이리저리 자연을`;

test('pusan univ. check spell', done => {
  const timeout = 4000;
  const check = function (data) {
    expect(data.length).toBe(4);
    expect(data[0].text).toEqual("스쳐지나가게");
    expect(data[0].match).toEqual("스쳐 지나가게");
    expect(data[1].text).toEqual("내버려두리라");
    expect(data[1].match).toEqual("내버려 도리라");
    expect(data[2].text).toEqual("혼속에");
    expect(data[2].match).toEqual("혼 속에");
    expect(data[3].text).toEqual("행복되게");
    expect(data[3].match).toEqual("행복하게");
  };
  const end = function () {
      done();
  };

  checkSpell(sentence, timeout, check, end);
});

test('pusan univ. check spell with alternative matches', done => {
  const sentence = '리랜드는 얼굴 골격이 굵은 게, 어머니 쪽을 닮았다.';
  const timeout = 4000;
  const check = function (data) {
    expect(data[0].help.indexOf('이 어절은 분석할 수 없으므로')).not.toBe(-1);
    expect(data[0].alternativeMatches.length).toBe(1);
    expect(data[0].alternativeMatches[0].indexOf('시랜드')).toBe(0);
  };
  const end = function () {
    done();
  };
  checkSpell(sentence, timeout, check, end);
});

