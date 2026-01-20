'use strict';

const fs = require('fs'),
	{bundle} = require('luabundle'),
	luamin = require('luamin');

const bundledLua = bundle('./luacheck/init.lua', {
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
			].reverse().map(name => `luacheck.stages.${name}`);
		},
	}),
	i = bundledLua.lastIndexOf('\n') + 1,
	extra = fs.readFileSync('wasm.lua', 'utf8'),
	j = extra.indexOf('\n') + 1,
	full = `${bundledLua.slice(0, i)}local luacheck=${bundledLua.slice(i + 7)}\n${extra.slice(j)}`,
	min = luamin.minify(full);
fs.writeFileSync('../esbuild/bundle.lua', full);
fs.writeFileSync('bundle.lua', `${min}\nreturn check`);
fs.writeFileSync('bundle.json', `${JSON.stringify({script: min}, null, '\t')}\n`);
