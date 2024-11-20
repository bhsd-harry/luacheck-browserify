'use strict';

const fs = require('fs');
const {bundle} = require('luabundle');

const bundledLua = bundle('./luacheck/init.lua', {force: true, isolate: true, metadata: false}),
	i = bundledLua.lastIndexOf('\n'),
	f = fs.readFileSync('wasm.lua', 'utf8'),
	s = `${bundledLua.slice(0, i + 1)}local luacheck=${bundledLua.slice(i + 7)}\n${f}`;
fs.writeFileSync('bundle.lua', `${s}\nreturn check`);
fs.writeFileSync('bundle.json', JSON.stringify(s));
