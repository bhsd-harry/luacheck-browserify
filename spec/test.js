/* global luacheck */
'use strict';

const fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	/** @type {Record<string, import('../dist/wasm').Diagnostic[]>} */ tests = require('./tests.json');

describe('Luacheck', () => {
	for (const file of fs.readdirSync('spec/samples/')) {
		if (file.endsWith('.lua')) {
			it(file, async () => {
				const code = fs.readFileSync(path.join('spec', 'samples', file), 'utf8'),
					warnings = await (await luacheck()).queue(code),
					oldWarnings = tests[file];
				tests[file] = warnings.map(
					warning => Object.fromEntries(Object.entries(warning).sort(([a], [b]) => a.localeCompare(b))),
				);
				assert.deepStrictEqual(warnings, oldWarnings);
			});
		}
	}
	after(() => {
		fs.writeFileSync('spec/tests.json', `${JSON.stringify(tests, null, '\t')}\n`);
	});
});

describe('luacheck.check', () => {
	for (const file of fs.readdirSync('spec/samples/')) {
		if (file.endsWith('.lua')) {
			it(file, async () => {
				const code = fs.readFileSync(path.join('spec', 'samples', file), 'utf8'),
					warnings = await luacheck.check(code),
					oldWarnings = tests[file];
				assert.deepStrictEqual(warnings, oldWarnings);
			});
		}
	}
});
