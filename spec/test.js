/* global luacheck */
'use strict';

const fs = require('fs'),
	path = require('path'),
	assert = require('assert');
require('../dist/wasm.js');
const init = process.argv[2] === 'init',
	/** @type {Record<string, import('../dist/wasm').Diagnostic[]>} */ tests = init ? {} : require('./tests.json');

(async () => {
	const Luacheck = await luacheck();
	for (const file of fs.readdirSync('spec/samples/')) {
		if (file.endsWith('.lua')) {
			const warnings = await Luacheck.queue(fs.readFileSync(path.join('spec', 'samples', file), 'utf8'));
			if (init) {
				tests[file] = warnings.map(
					warning => Object.fromEntries(Object.entries(warning).sort(([a], [b]) => a.localeCompare(b))),
				);
			} else {
				assert.deepStrictEqual(warnings, tests[file]);
			}
		}
	}
	if (init) {
		fs.writeFileSync('spec/tests.json', `${JSON.stringify(tests, null, '\t')}\n`);
	}
})();
