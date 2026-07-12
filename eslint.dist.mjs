import {dist, distES10} from '@bhsd/code-standard';

export default [
	dist,
	{
		files: ['dist/es*.min.js'],
		languageOptions: {
			ecmaVersion: 10,
		},
		rules: {
			...distES10.rules,
			'es-x/no-promise-prototype-finally': 0,
		},
	},
	{
		rules: {
			'es-x/no-resizable-and-growable-arraybuffers': 0,
			'es-x/no-uint8array-frombase64': 0,
		},
	},
];
