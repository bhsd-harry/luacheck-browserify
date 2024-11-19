'use strict';

const fs = require('fs');
const {bundle} = require('luabundle');

const bundledLua = bundle('./luacheck/init.lua', {force: true, isolate: true, metadata: false}),
	i = bundledLua.lastIndexOf('\n');
fs.writeFileSync('bundle.json', JSON.stringify(`${bundledLua.slice(0, i + 1)}luacheck =${bundledLua.slice(i + 7)}`));
