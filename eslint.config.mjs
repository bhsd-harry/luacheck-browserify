import {jsDoc, node, browser, extend} from '@bhsd/code-standard';

export default extend(
	jsDoc,
	...node,
	{
		ignores: [
			'doc/',
			'esbuild/',
			'*.yml',
			'*.yaml',
			'!.codacy.yml',
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
		...browser,
	},
);
