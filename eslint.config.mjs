import {jsDoc, node, browserES10, extend} from '@bhsd/code-standard';

export default extend(
	jsDoc,
	...node,
	{
		ignores: [
			'doc/',
			'build/',
		],
	},
	{
		files: ['**/*.js'],
		rules: {
			'n/no-unsupported-features/es-syntax': [
				2,
				{
					version: '^26.0.0',
				},
			],
			'n/no-unsupported-features/node-builtins': [
				2,
				{
					allowExperimental: true,
					version: '^26.0.0',
				},
			],
		},
	},
	{
		files: ['src/wasm.ts'],
		...browserES10,
	},
);
