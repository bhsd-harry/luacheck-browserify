/* eslint-env node */
'use strict';

const config = require('@bhsd/common/eslintrc.dist.cjs');

module.exports = {
	...config,
	rules: {
		...config.rules,
		'es-x/no-bigint': 0,
		'es-x/no-dynamic-import': 0,
		'es-x/no-resizable-and-growable-arraybuffers': 0,
		'es-x/no-weakrefs': 0,
	},
};
