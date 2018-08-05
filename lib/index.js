/**
 * Export all hanspell implementations.
 */
'use strict';

const checkSpellWithDAUM = require('./daum-check-spell');
const checkSpellWithPNU = require('./pusan-univ-check-spell');

module.exports = { checkSpellWithDAUM, checkSpellWithPNU };
