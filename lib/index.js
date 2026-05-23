/**
 * Export all hanspell implementations.
 */

const spellCheckByDAUM = require('./daum-spell-check');
const spellCheckByNAVER = require('./naver-spell-check');

module.exports = { spellCheckByDAUM, spellCheckByNAVER };
