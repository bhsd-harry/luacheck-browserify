# Luacheck-browserify

[![npm version](https://badge.fury.io/js/luacheck-browserify.svg)](https://www.npmjs.com/package/luacheck-browserify)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

[Luacheck](https://github.com/lunarmodules/luacheck) is a static analyzer and a linter for [Lua](https://www.lua.org/). Luacheck detects various issues such as usage of undefined global variables, unused variables and values, accessing uninitialized variables, unreachable code and more. Most aspects of checking are configurable: there are options for defining custom project-related globals, for selecting set of standard globals (version of Lua standard library), for filtering warnings by type and name of related variable, etc.

Luacheck supports checking Lua files using syntax of Lua 5.1 - 5.4, and LuaJIT. Luacheck itself is written in Lua and runs on all of mentioned Lua versions.

Luacheck-browserify is a fork of Luacheck that has been modified to work in browser environments. The Lua code is executed using [Wasmoon](https://www.npmjs.com/package/wasmoon). Luacheck-browserify can also be specifically configured to check [Lua modules in MediaWiki sites](https://www.mediawiki.org/wiki/Lua/Overview).

## Contents

- [Installation](#installation)
- [Basic usage](#basic-usage)
- [Related projects](#related-projects)
- [Documentation](#documentation)

## Installation

### Using CDN

As a NPM package, Luacheck-browserify can be included in a project using a CDN. Add the following script tag to the HTML file:

```html
<script src="https://cdn.jsdelivr.net/npm/luacheck-browserify"></script>
```

or

```html
<script src="https://unpkg.com/luacheck-browserify"></script>
```

## Basic usage

After Luacheck-browserify is installed, a global async function `luacheck` is available. The `luacheck` function takes a required string argument to specify the standard globals similar to the [`--std` CLI option](https://luacheck.readthedocs.io/en/stable/cli.html#command-line-options), and its return value resolves with a class instance with an async `queue` method that can be called with a string of Lua code to check. The `queue` method returns a promise that resolves with an array of warnings.

```javascript
const Luacheck = luacheck('max');
console.log(await Luacheck.queue('local a, b, c = nil'));
```

Otherwise, the `luacheck.check` function can be called with a string of Lua code and a string of standard globals to return a promise that resolves with an array of warnings.

```javascript
console.log(await luacheck.check('local a, b, c = nil', 'lua55c'));
```

The warnings are objects with the following properties:

```typescript
interface {
	line: number;
	column: number;
	end_column: number;
	code: string;
	msg: string;
	/** 0: info, 1: warning, 2: error */
	severity: 0 | 1 | 2;
}
```

For more info about the warnings, see [Luacheck documentation](https://luacheck.readthedocs.io/en/stable/warnings.html).

## Related projects

### Editor support

There are a few plugins which allow using Luacheck directly inside an editor, showing warnings inline:

* For CodeMirror, [CodeMirror-MediaWiki](https://www.npmjs.com/package/@bhsd/codemirror-mediawiki) contains luacheck checker ([Demo](https://bhsd-harry.github.io/codemirror-mediawiki/#Lua)).
* For Monaco editor, [Monaco-Wiki](https://www.npmjs.com/package/monaco-wiki) contains luacheck checker ([Demo](https://bhsd-harry.github.io/monaco-wiki/#Lua)).

## Documentation

Luacheck Documentation is available [online](https://luacheck.readthedocs.io/en/stable/).
