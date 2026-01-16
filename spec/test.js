/* eslint-disable camelcase */
/* global luacheck */
'use strict';

/** @typedef {import('../dist/wasm').Diagnostic} Diagnostic */

const fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	/** @type {Record<string, Diagnostic[]>} */ tests = require('./tests.json'),
	/** @type {Record<string, Diagnostic[]>} */ scribuntoTests = require('./ScribuntoTests.json');

/**
 * 测试
 * @param {(code: string, file: string) => Promise<Diagnostic[]>} diagnose 诊断函数
 * @param {Set<string>} [ignores] 忽略的问题
 */
const execute = (diagnose, ignores) => {
	for (const file of fs.readdirSync('spec/samples/')) {
		if (file.endsWith('.lua')) {
			it(file, async () => {
				const codes = fs.readFileSync(path.join('spec/samples', file), 'utf8');
				let oldWarnings = tests[file],
					warnings = await diagnose(codes, file);
				if (ignores) {
					const predicate = ({code, name}) => !ignores.has(code)
						|| code === '111' && name !== '_ENV'
						|| code === '122' && name !== 'package'
						|| code === '143' && name !== 'os';
					oldWarnings = oldWarnings.filter(predicate);
					warnings = warnings.filter(predicate);
				}
				assert.deepStrictEqual(warnings, oldWarnings);
			});
		}
	}
};

const toJson = warnings => warnings.map(
	warning => Object.fromEntries(Object.entries(warning).sort(([a], [b]) => a.localeCompare(b))),
);

describe('Luacheck', () => {
	execute(async (code, file) => {
		const warnings = await luacheck('max').queue(code);
		tests[file] = toJson(warnings);
		return warnings;
	});
	after(() => {
		fs.writeFileSync('spec/tests.json', `${JSON.stringify(tests, null, '\t')}\n`);
	});
});

describe('luacheck.check', () => {
	execute(code => luacheck.check(code, 'max'));
});

const ignores = [
	'111', // Setting an undefined global variable, only for `_ENV`
	'113', // Accessing an undefined global variable
	'122', // Setting a read-only field of a global variable, only for `package`
	'143', // Accessing an undefined field of a global variable, only for `os`
];

/**
 * 测试Scribunto环境
 * @param {(code: string, file: string) => Promise<Diagnostic[]>} diagnose 诊断函数
 */
const executeScribunto = diagnose => {
	for (const file of fs.readdirSync('spec/Scribunto/')) {
		if (file.endsWith('.lua')) {
			it(file, async () => {
				const codes = fs.readFileSync(path.join('spec/Scribunto', file), 'utf8'),
					oldWarnings = scribuntoTests[file],
					warnings = await diagnose(codes, file);
				assert.deepStrictEqual(warnings, oldWarnings);
			});
		}
	}
};

describe('custom globals for MediaWiki', () => {
	const diagnose = code => luacheck.check(code, 'mediawiki');
	execute(diagnose, new Set(ignores));
	executeScribunto(async (code, file) => {
		const warnings = await diagnose(code);
		scribuntoTests[file] = toJson(warnings);
		return warnings;
	});
	after(() => {
		fs.writeFileSync(
			'spec/ScribuntoTests.json',
			`${JSON.stringify(scribuntoTests, null, '\t')}\n`,
		);
	});
});

describe('full configurations for MediaWiki', () => {
	const diagnose = code => luacheck.check(code, {
		std: 'mediawiki',
		max_line_length: false,
		max_code_line_length: false,
		max_string_line_length: false,
		max_comment_line_length: false,
	});
	execute(diagnose, new Set([...ignores, '631']));
	executeScribunto(diagnose);
});
