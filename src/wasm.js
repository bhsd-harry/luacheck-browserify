'use strict';

const {LuaFactory} = require('wasmoon');
const script = require('./bundle.json');

(async () => {
	const factory = new LuaFactory(),
		lua = await factory.createEngine();
	await lua.doString(script);
	Object.assign(globalThis, {luacheck: lua.global.get('check')});
})();
