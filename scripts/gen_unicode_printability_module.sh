#!/usr/bin/env bash
set -eu
set -o pipefail

# Generates luacheck.unicode_printability_boundaries module given Unicode version.
# Should be executed from root Luacheck directory.

url="https://www.unicode.org/Public/$1/ucd/UnicodeData.txt"
cache="scripts/UnicodeData-$1.txt"

if [ ! -e "$cache" ]; then
    wget -O "$cache" "$url"
fi

(
    echo "-- Autogenerated using data from $url";
    lua scripts/unicode_data_to_printability_module.lua < "$cache"
) > src/luacheck/unicode_printability_boundaries.lua