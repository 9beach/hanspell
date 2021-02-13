/**
 * Export all hanspell implementations.
 */

const spellCheckByDAUM = require('./daum-spell-check');
const spellCheckByPNU = require('./pnu-spell-check');

module.exports = { spellCheckByDAUM, spellCheckByPNU };
