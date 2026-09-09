#!/usr/local/bin/bash
npm run lint && npm run build && npm test
if [[ $? -eq 0 ]]
then
	gsed -i -E "s/\"version\": \".+\"/\"version\": \"$1\"/" package.json
	git fetch --prune --prune-tags origin
	git add -A
	git commit -m "chore: bump version to $1"
	git push
	git tag "$1"
	git push origin "$1"

	# GitHub release
	gsed -n "/## v$1/,/##/{/^## .*/d;/./,\$!d;p}" CHANGELOG.md > release-notes.md
	gh release create "$1" --notes-file release-notes.md -t "$1" --verify-tag --latest="${2-true}"
	rm release-notes.md

	# npm publish
	npm publish --tag "${2-latest}"
fi
