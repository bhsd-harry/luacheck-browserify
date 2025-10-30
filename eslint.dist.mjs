import {dist} from '@bhsd/code-standard';
import esX from 'eslint-plugin-es-x';

export default [
	dist,
	{
		rules: {
			'es-x/no-resizable-and-growable-arraybuffers': 0,
			'es-x/no-weakrefs': 0,
		},
	},
	{
		files: ['dist/es*.min.js'],
		languageOptions: {
			ecmaVersion: 8,
		},
		rules: {
			...esX.configs['flat/no-new-in-es2018'].rules,
			...esX.configs['flat/no-new-in-es2019'].rules,
			...esX.configs['flat/no-new-in-es2020'].rules,
			'es-x/no-promise-prototype-finally': 0,
		},
	},
];
