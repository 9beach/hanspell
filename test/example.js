const hanspell = require('../lib/index');

const sentence = '리랜드는 얼굴 골격이 굵은게,';

const end = function () { console.log("// check ends"); };
const error = function (err) { console.error("HTTP status code: " + err); };

hanspell.checkSpellWithDAUM(sentence, 6000, console.log, end, error);
hanspell.checkSpellWithPNU(sentence, 6000, console.log, end, error);
