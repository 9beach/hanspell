const checkSpell = require('../lib/index').checkSpellWithDAUM;
const sentence = 
`여름 저녁이 푸르를 때 난 가리라 
보리 무성한 사이 가느다란 풀 짓밟힌 샛길 속으로. 
몽상가인 난, 발에 신선함을 느끼리라. 
난 내 벗은 머리를 바람이 스쳐지나가게 내버려두리라. 

난 말하지 않으련다, 아무것도 생각지 않으련다. 
그러나 한없는 사랑이 내 혼속에 살아오리니 
그럼 유랑민처럼 멀리 아주 멀리 가리라, 
여인과 같이 있는 것처럼 행복되게, 이리저리 자연을`;

test('daum check spell', done => {
  const timeout = 4000;
  const check = function (data) {
    expect(data.length).toBe(2);
    expect(data[0].text).toEqual("스쳐지나가게");
    expect(data[0].match).toEqual("스쳐 지나가게");
    expect(data[0].context.indexOf("람이 스쳐지나가게 내")).not.toBe(-1);
    expect(data[1].text).toEqual("혼속에");
    expect(data[1].match).toEqual("혼 속에");
    expect(data[1].context.indexOf("랑이 내 혼속에 살아")).not.toBe(-1);
  };
  const end = function () {
      done();
  };

  checkSpell(sentence, timeout, check, end);
});

test('daum check spell with examples', done => {
  const sentence = '한바퀴 돌껀데 말했더만';
  const timeout = 4000;
  const check = function (data) {
    expect(data[0].help.indexOf('수사 또는 수관형사와')).not.toBe(-1);
    expect(data[0].help.indexOf('다섯 마리')).not.toBe(-1);
    expect(data[1].help.indexOf('잘못된 표기로 의존명사')).not.toBe(-1);
    expect(data[1].help.indexOf('그 일은 내가')).not.toBe(-1);
    expect(data[2].help.indexOf('잘못된 어미입니다')).not.toBe(-1);
    expect(data[2].help.indexOf('잤더니만')).not.toBe(-1);
  };
  const end = function () {
    done();
  };
  checkSpell(sentence, timeout, check, end);
});
