import {jsDoc, node, extend} from '@bhsd/code-standard';
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
);
