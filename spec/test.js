/* global luacheck */
'use strict';

/** @typedef {import('../dist/wasm').Diagnostic} Diagnostic */

const fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	/** @type {Record<string, Diagnostic[]>} */ tests = require('./tests.json');

/**
 * 测试
 * @param {(code: string, file: string) => Promise<Diagnostic[]>} diagnose 诊断函数
 */
const execute = diagnose => {
	for (const file of fs.readdirSync('spec/samples/')) {
		if (file.endsWith('.lua')) {
			it(file, async () => {
				const code = fs.readFileSync(path.join('spec', 'samples', file), 'utf8'),
					oldWarnings = tests[file],
					warnings = await diagnose(code, file);
				assert.deepStrictEqual(warnings, oldWarnings);
			});
		}
	}
};

describe('Luacheck', () => {
	execute(async (code, file) => {
		const warnings = await luacheck().queue(code);
		tests[file] = warnings.map(
			warning => Object.fromEntries(Object.entries(warning).sort(([a], [b]) => a.localeCompare(b))),
		);
		return warnings;
	});
	after(() => {
		fs.writeFileSync('spec/tests.json', `${JSON.stringify(tests, null, '\t')}\n`);
	});
});

describe('luacheck.check', () => {
	execute(code => luacheck.check(code));
});
