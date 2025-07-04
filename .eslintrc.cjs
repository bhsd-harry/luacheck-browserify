'use strict';

const config = require('@bhsd/code-standard/eslintrc.node.cjs');

module.exports = {
	...config,
	ignorePatterns: [
		...config.ignorePatterns,
		'doc/',
		'esbuild/',
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
