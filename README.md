# Luacheck-browserify

[![npm version](https://badge.fury.io/js/luacheck-browserify.svg)](https://www.npmjs.com/package/luacheck-browserify)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

## Contents

* [Overview](#overview)
* [Installation](#installation)
* [Basic usage](#basic-usage)
* [Related projects](#related-projects)
* [Documentation](#documentation)

## Overview

[Luacheck](https://github.com/mpeterv/luacheck) is a static analyzer and a linter for [Lua](http://www.lua.org). Luacheck detects various issues such as usage of undefined global variables, unused variables and values, accessing uninitialized variables, unreachable code and more. Most aspects of checking are configurable: there are options for defining custom project-related globals, for selecting set of standard globals (version of Lua standard library), etc. Luacheck itself is written in Lua and runs on different Lua versions.

Luacheck-browserify is a fork of Luacheck that has been modified to work in browser environments. The Lua code is executed using [Wasmoon](https://github.com/ceifa/wasmoon). Luacheck-browserify can also be specifically configured to check [Lua modules in MediaWiki sites](https://www.mediawiki.org/wiki/Lua/Overview).

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

After Luacheck-browserify is installed, a global async function `luacheck` is available. The `luacheck` function takes a required string argument to specify the standard globals similar to the [`--std` CLI option](https://luacheck.readthedocs.io/en/stable/cli.html#command-line-options), and its return value is resolved with a class instance with an async `queue` method that can be called with a string of Lua code to check. The `queue` method returns a promise that is resolved with an array of warnings.

```javascript
const Luacheck = await luacheck('max');
console.log(await Luacheck.queue('local a, b, c = nil'));
```

For more info about the warnings, see [Luacheck documentation](https://luacheck.readthedocs.io/en/stable/warnings.html).

## Related projects

### Editor support

There are a few plugins which allow using Luacheck directly inside an editor, showing warnings inline:

* For CodeMirror, [CodeMirror-MediaWiki](https://github.com/bhsd-harry/codemirror-mediawiki) contains luacheck checker ([Demo](https://bhsd-harry.github.io/codemirror-mediawiki/#Lua)).
* For Monaco editor, [Monaco-Wiki](https://github.com/bhsd-harry/monaco-wiki) contains luacheck checker ([Demo](https://bhsd-harry.github.io/monaco-wiki/#Lua)).

## Documentation

Luacheck Documentation is available [online](https://luacheck.readthedocs.io/en/stable/).
