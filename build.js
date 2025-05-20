'use strict';

const fs = require('fs'),
	esbuild = require('esbuild');

const config = {
	entryPoints: ['./src/wasm.ts'],
	charset: 'utf8',
	bundle: true,
	format: 'iife',
	logLevel: 'info',
	external: [
		'module',
		'url',
	],
};

(async () => {
	await esbuild.build({
		...config,
		minify: true,
		sourcemap: true,
		target: 'es2019',
		outfile: 'dist/index.min.js',
	});

	await esbuild.build({
		...config,
		target: 'es2017',
		outfile: 'dist/es8.min.js',
		plugins: [
			{
				name: 'alias',
				setup(build) {
					build.onLoad(
						{filter: /\/wasmoon\/dist\/index.js$/}, // eslint-disable-line require-unicode-regexp
						({path}) => ({
							contents: fs.readFileSync(path, 'utf8')
								.replaceAll('await import(', 'require(')
								.replaceAll(
									'BigInt(',
									'(typeof BigInt === "function" ? BigInt : Number)(',
								),
						}),
					);
				},
			},
		],
	});

	fs.copyFileSync(require.resolve('wasmoon/LICENSE'), 'dist/third-party-notices.txt');
})();
