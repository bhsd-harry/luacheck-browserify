'use strict';

const config = require('@bhsd/common/eslintrc.node.cjs');

module.exports = {
	...config,
	ignorePatterns: [
		...config.ignorePatterns,
		'doc/',
	],
	overrides: [
		...config.overrides,
		{
			files: 'spec/test.js',
			env: {
				mocha: true,
			},
		},
	],
};
