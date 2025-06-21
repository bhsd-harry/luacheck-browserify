'use strict';

const fs = require('fs'),
	esbuild = require('esbuild'),
	{name, version, homepage} = require('wasmoon/package.json');

const /** @type {esbuild.BuildOptions} */ config = {
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
	let /** @type {esbuild.BuildOptions} */ options = {
		...config,
		minify: true,
		sourcemap: true,
		target: 'es2019',
		outfile: 'dist/index.min.js',
	};
	await esbuild.build(options);

	options = {
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
		banner: {
			js: `if (!Promise.prototype.finally) {
	Promise.prototype.finally = function(callback) {
		if (typeof callback !== 'function') {
			return this.then(callback, callback);
		}
		const P = this.constructor || Promise;
		return this.then(
			value => P.resolve(callback()).then(() => value),
			reason => P.resolve(callback()).then(() => { throw reason; })
		);
	};
}`,
		},
	};
	await esbuild.build(options);

	const license = fs.readFileSync(require.resolve('wasmoon/LICENSE'), 'utf8');
	fs.writeFileSync(
		'ThirdPartyNotices.txt',
		`%% ${name} version ${version} (${homepage})
=========================================
${license}`,
	);
})();
