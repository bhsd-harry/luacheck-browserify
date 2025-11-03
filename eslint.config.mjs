import {jsDoc, node, browser, extend} from '@bhsd/code-standard';
import globals from 'globals';

export default extend(
	jsDoc,
	...node,
	{
		ignores: [
			'doc/',
			'esbuild/',
		],
	},
	{
		files: ['spec/test.js'],
		languageOptions: {
			globals: globals.mocha,
		},
	},
	{
		files: ['src/wasm.ts'],
		...browser,
	},
);
