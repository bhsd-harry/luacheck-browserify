/* eslint-disable camelcase */
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
 * @param {boolean} [ignore] 是否忽略格式问题
 */
const execute = (diagnose, ignore) => {
	for (const file of fs.readdirSync('spec/samples/')) {
		if (file.endsWith('.lua')) {
			it(file, async () => {
				const codes = fs.readFileSync(path.join('spec', 'samples', file), 'utf8');
				let oldWarnings = tests[file],
					warnings = await diagnose(codes, file);
				if (ignore) {
					oldWarnings = oldWarnings.filter(({code}) => code !== '631');
					warnings = warnings.filter(({code}) => code !== '631');
				}
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

const std = {
	read_globals: {
		_VERSION: {},
		assert: {},
		error: {},
		getfenv: {},
		getmetatable: {},
		ipairs: {},
		next: {},
		pairs: {},
		pcall: {},
		rawequal: {},
		rawget: {},
		rawset: {},
		select: {},
		setmetatable: {},
		tonumber: {},
		tostring: {},
		type: {},
		unpack: {},
		xpcall: {},
		require: {},
		_G: {
			other_fields: true,
			read_only: false,
		},
		debug: {
			fields: {
				traceback: {},
			},
		},
		math: {
			fields: {
				abs: {},
				acos: {},
				asin: {},
				atan: {},
				atan2: {},
				ceil: {},
				cos: {},
				cosh: {},
				deg: {},
				exp: {},
				floor: {},
				fmod: {},
				frexp: {},
				huge: {},
				ldexp: {},
				log: {},
				log10: {},
				max: {},
				min: {},
				modf: {},
				pi: {},
				pow: {},
				rad: {},
				random: {},
				randomseed: {},
				sin: {},
				sinh: {},
				sqrt: {},
				tan: {},
				tanh: {},
			},
		},
		os: {
			fields: {
				clock: {},
				date: {},
				difftime: {},
				time: {},
			},
		},
		package: {
			fields: {
				loaded: {other_fields: true},
				loaders: {other_fields: true},
				preload: {other_fields: true},
				seeall: {},
			},
		},
		string: {
			fields: {
				byte: {},
				char: {},
				find: {},
				format: {},
				gmatch: {},
				gsub: {},
				len: {},
				lower: {},
				match: {},
				rep: {},
				reverse: {},
				sub: {},
				ulower: {},
				upper: {},
				uupper: {},
			},
		},
		table: {
			fields: {
				concat: {},
				insert: {},
				maxn: {},
				remove: {},
				sort: {},
			},
		},
		mw: {
			fields: {
				addWarning: {},
				allToString: {},
				clone: {},
				getCurrentFrame: {},
				incrementExpensiveFunctionCount: {},
				isSubsting: {},
				loadData: {},
				loadJsonData: {},
				dumpObject: {},
				log: {},
				logObject: {},
				hash: {
					fields: {
						hashValue: {},
						listAlgorithms: {},
					},
				},
				html: {
					fields: {
						create: {},
					},
				},
				language: {
					fields: {
						fetchLanguageName: {},
						fetchLanguageNames: {},
						getContentLanguage: {},
						getFallbacksFor: {},
						isKnownLanguageTag: {},
						isSupportedLanguage: {},
						isValidBuiltInCode: {},
						isValidCode: {},
						new: {},
					},
				},
				message: {
					fields: {
						new: {},
						newFallbackSequence: {},
						newRawMessage: {},
						rawParam: {},
						numParam: {},
						getDefaultLanguage: {},
					},
				},
				site: {
					fields: {
						currentVersion: {},
						scriptPath: {},
						server: {},
						siteName: {},
						stylePath: {},
						namespaces: {other_fields: true},
						contentNamespaces: {other_fields: true},
						subjectNamespaces: {other_fields: true},
						talkNamespaces: {other_fields: true},
						stats: {
							fields: {
								pages: {},
								articles: {},
								files: {},
								edits: {},
								users: {},
								activeUsers: {},
								admins: {},
								pagesInCategory: {},
								pagesInNamespace: {},
								usersInGroup: {},
								interwikiMap: {},
							},
						},
					},
				},
				svg: {
					fields: {
						new: {},
					},
				},
				text: {
					fields: {
						decode: {},
						encode: {},
						jsonDecode: {},
						jsonEncode: {},
						killMarkers: {},
						listToText: {},
						nowiki: {},
						split: {},
						gsplit: {},
						tag: {},
						trim: {},
						truncate: {},
						unstripNoWiki: {},
						unstrip: {},
						JSON_PRESERVE_KEYS: {},
						JSON_TRY_FIXING: {},
						JSON_PRETTY: {},
					},
				},
				titl: {
					fields: {
						equals: {},
						compare: {},
						getCurrentTitle: {},
						new: {},
						newBatch: {},
						makeTitle: {},
					},
				},
				uri: {
					fields: {
						encode: {},
						decode: {},
						anchorEncode: {},
						buildQueryString: {},
						parseQueryString: {},
						canonicalUrl: {},
						fullUrl: {},
						localUrl: {},
						new: {},
						validate: {},
					},
				},
				ustring: {
					fields: {
						maxPatternLength: {},
						maxStringLength: {},
						byte: {},
						byteoffset: {},
						char: {},
						codepoint: {},
						find: {},
						format: {},
						gcodepoint: {},
						gmatch: {},
						gsub: {},
						isutf8: {},
						len: {},
						lower: {},
						match: {},
						rep: {},
						sub: {},
						toNFC: {},
						toNFD: {},
						toNFKC: {},
						toNFKD: {},
						upper: {},
					},
				},
				ext: {other_fields: true},
			},
		},
	},
};

describe('custom globals', () => {
	execute(code => luacheck.check(code, std), true);
});

describe('full configurations', () => {
	execute(code => luacheck.check(code, {
		std,
		max_line_length: false,
		max_code_line_length: false,
		max_string_line_length: false,
		max_comment_line_length: false,
	}));
});
