test('valid functions export', () => {
  const check = function () {
    const hanspell = require('../lib/index');
    const daum = require('../lib/daum-check-spell');
    const pnu = require('../lib/pusan-univ-check-spell');

    expect(hanspell).not(null);
    expect(hanspell.checkSpellWithDAUM).not(null);
    expect(hanspell.checkSpellWithPNU).not(null);
  };
});
