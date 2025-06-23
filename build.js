'use strict';

const fs = require('fs'),
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
			{filter: /\.wasm$/}, // eslint-disable-line require-unicode-regexp
			({namespace, path}) => {
				if (namespace === 'wasm-stub') {
					return {path, namespace: 'wasm-binary'};
				}
				return {path: require.resolve(path), namespace: 'wasm-stub'};
			},
		);
		build.onLoad(
			{filter: /.*/, namespace: 'wasm-stub'}, // eslint-disable-line require-unicode-regexp
			({path}) => ({
				contents: `import wasm from ${JSON.stringify(path)};
const blob = new Blob([wasm], {type: 'application/wasm'});
export default URL.createObjectURL(blob);`,
			}),
		);
		build.onLoad(
			{filter: /.*/, namespace: 'wasm-binary'}, // eslint-disable-line require-unicode-regexp
			({path}) => ({
				contents: fs.readFileSync(path),
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
						{filter: /\/wasmoon\/dist\/index.js$/}, // eslint-disable-line require-unicode-regexp
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
