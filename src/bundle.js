/* eslint-disable require-unicode-regexp */
'use strict';

const fs = require('fs'),
	path = require('path'),
	{bundle} = require('luabundle'),
	luamin = require('lua-format'),
	esbuild = require('esbuild'),
	{ReplacableString} = require('@bhsd/nodejs');

const preprocess = ({name, content}) => {
	if (name === 'luacheck.builtin_standards') {
		const s = new ReplacableString(content, 'luacheck/builtin_standards/init.lua');
		s.replaceAll(
			/^builtin_standards\.(?:busted|rockspec|luacheckrc|ldoc|sile) = \{$.+?^\}$/gmsu,
			'',
			5,
		);
		return s.input;
	}
	return /^luacheck\.builtin_standards\.(?:love|luanti|playdate|ngx)$/u.test(name)
		? 'return {}'
		: content;
};

const bundleLua = proc => {
	const bundledLua = bundle('./luacheck/init.lua', {
			paths: [
				'./?.lua',
				'./?/init.lua',
			],
			force: true,
			isolate: true,
			metadata: false,
			expressionHandler() {
				return [
					'parse',
					'unwrap_parens',
					'linearize',
					'parse_inline_options',
					'name_functions',
					'resolve_locals',
					'detect_bad_whitespace',
					'detect_compound_operators',
					'detect_cyclomatic_complexity',
					'detect_empty_blocks',
					'detect_empty_statements',
					'detect_globals',
					'detect_reversed_fornum_loops',
					'detect_unbalanced_assignments',
					'detect_uninit_accesses',
					'detect_unreachable_code',
					'detect_unused_fields',
					'detect_unused_locals',
				].toReversed().map(name => `luacheck.stages.${name}`);
			},
			...proc && {preprocess},
		}),
		i = bundledLua.lastIndexOf('\n') + 1,
		extra = fs.readFileSync('wasm.lua', 'utf8'),
		j = extra.indexOf('\n') + 1,
		full = `${bundledLua.slice(0, i)}local luacheck=${bundledLua.slice(i + 7)}\n${extra.slice(j)}`,
		min = luamin.Minify(full, { // eslint-disable-line new-cap
			RenameVariables: true,
			Solvemath: true,
		});
	if (proc) {
		fs.writeFileSync('../build/bundle.lua', full);
	} else {
		fs.writeFileSync('bundle.lua', `${min}\nreturn check`);
	}
	fs.writeFileSync('bundle.json', `${JSON.stringify({script: min}, null, '\t')}\n`);
};

const /** @type {esbuild.BuildOptions} */ esbuildConfig = {
	entryPoints: ['../src/wasm.ts'],
	charset: 'utf8',
	bundle: true,
	format: 'iife',
	logLevel: 'info',
	external: [
		'module',
		'url',
	],
};

const stub = 'wasm-stub',
	binary = 'wasm-binary';
const /** @type {esbuild.Plugin} */ plugin = {
	name: 'wasm',
	setup(build) {
		build.onResolve(
			{filter: /\.wasm$/},
			({namespace, path: p}) => namespace === stub
				? {path: p, namespace: binary}
				: {
					path: path.relative('.', require.resolve(p)),
					namespace: stub,
				},
		);
		build.onLoad(
			{filter: /^/, namespace: stub},
			({path: p}) => ({
				contents: `import wasm from ${JSON.stringify(p)};
const blob = new Blob([wasm], {type: 'application/wasm'});
export default URL.createObjectURL(blob);`,
			}),
		);
		build.onLoad(
			{filter: /^/, namespace: binary},
			({path: p}) => ({
				contents: fs.readFileSync(p),
				loader: 'binary',
			}),
		);
	},
};

(async () => {
	// bundle for common use
	bundleLua();
	await esbuild.build({
		...esbuildConfig,
		minify: true,
		target: 'es2019',
		outfile: '../dist/index.min.js',
		plugins: [plugin],
	});

	// bundle for MediaWiki
	bundleLua(true);
	await esbuild.build({
		...esbuildConfig,
		format: 'esm',
		outfile: '../build/index.js',
		plugins: [plugin],
	});

	await esbuild.build({
		...esbuildConfig,
		minify: true,
		target: 'es2019',
		outfile: '../dist/es.min.js',
		plugins: [
			{
				name: 'alias',
				setup(build) {
					build.onLoad(
						{filter: /\/wasmoon\/dist\/index.js$/},
						({path: p}) => {
							const contents = new ReplacableString(fs.readFileSync(p, 'utf8'), p);
							/** @todo ES2020可移除dynamic import和BigInt的polyfill */
							contents.replaceAll('await import(', 'require(', 1)
								.replaceAll(
									'BigInt(',
									'(typeof BigInt === "function" ? BigInt : Number)(',
									7,
								);
							return {contents: contents.input};
						},
					);
				},
			},
			plugin,
		],
	});
})();
