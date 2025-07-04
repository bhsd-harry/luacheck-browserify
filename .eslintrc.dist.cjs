/* eslint-env node */
'use strict';

const config = require('@bhsd/code-standard/eslintrc.dist.cjs');

module.exports = {
	...config,
	rules: {
		...config.rules,
		'es-x/no-resizable-and-growable-arraybuffers': 0,
		'es-x/no-weakrefs': 0,
	},
	overrides: [
		{
			files: ['dist/es*.min.js'],
			extends: [
				'plugin:es-x/no-new-in-es2018',
				'plugin:es-x/no-new-in-es2019',
				'plugin:es-x/no-new-in-es2020',
			],
			parserOptions: {
				ecmaVersion: 8,
			},
			rules: {
				'es-x/no-bigint': 0,
				'es-x/no-global-this': 0,
				'es-x/no-promise-prototype-finally': 0,
			},
		},
	],
};
