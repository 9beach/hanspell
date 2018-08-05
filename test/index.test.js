test('valid functions export', () => {
  const hanspell = require('../lib/index');

  expect(hanspell).not.toBe(null);
  expect(hanspell.checkSpellWithDAUM).not.toBe(null);
  expect(hanspell.checkSpellWithPNU).not.toBe(null);
});
