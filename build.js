/* eslint-disable require-unicode-regexp */
'use strict';

const fs = require('fs'),
	path = require('path'),
	esbuild = require('esbuild');

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

const /** @type {esbuild.Plugin} */ plugin = {
	name: 'wasm',
	setup(build) {
		build.onResolve(
			{filter: /\.wasm$/},
			({namespace, path: p}) => {
				if (namespace === 'wasm-stub') {
					return {path: p, namespace: 'wasm-binary'};
				}
				return {
					path: path.relative('.', require.resolve(p)),
					namespace: 'wasm-stub',
				};
			},
		);
		build.onLoad(
			{filter: /.*/, namespace: 'wasm-stub'},
			({path: p}) => ({
				contents: `import wasm from ${JSON.stringify(p)};
const blob = new Blob([wasm], {type: 'application/wasm'});
export default URL.createObjectURL(blob);`,
			}),
		);
		build.onLoad(
			{filter: /.*/, namespace: 'wasm-binary'},
			({path: p}) => ({
				contents: fs.readFileSync(p),
				loader: 'binary',
			}),
		);
	},
};

(async () => {
	let /** @type {esbuild.BuildOptions} */ options = {
		...config,
		format: 'esm',
		outfile: 'esbuild/index.js',
		plugins: [plugin],
	};
	await esbuild.build(options);

	options = {
		...config,
		minify: true,
		sourcemap: true,
		target: 'es2019',
		outfile: 'dist/index.min.js',
		plugins: [plugin],
	};
	await esbuild.build(options);

	options = {
		...config,
		minify: true,
		target: 'es2017',
		outfile: 'dist/es8.min.js',
		plugins: [
			{
				name: 'alias',
				setup(build) {
					build.onLoad(
						{filter: /\/wasmoon\/dist\/index.js$/},
						({path: p}) => ({
							contents: fs.readFileSync(p, 'utf8')
								.replaceAll('await import(', 'require(')
								.replaceAll(
									'BigInt(',
									'(typeof BigInt === "function" ? BigInt : Number)(',
								),
						}),
					);
				},
			},
			plugin,
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
})();
