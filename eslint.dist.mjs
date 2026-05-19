import {dist, distES8} from '@bhsd/code-standard';

export default [
	dist,
	{
		files: ['dist/es*.min.js'],
		languageOptions: {
			ecmaVersion: 8,
		},
		rules: {
			...distES8.rules,
			'es-x/no-promise-prototype-finally': 0,
		},
	},
	{
		rules: {
			'es-x/no-resizable-and-growable-arraybuffers': 0,
			'es-x/no-weakrefs': 0,
		},
	},
];
