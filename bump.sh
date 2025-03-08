#!/usr/local/bin/bash
npm run lint && npm run build && npm test
if [[ $? -eq 0 ]]
then
	sed -i '' -E "s/\"version\": \".+\"/\"version\": \"$1\"/" package.json
	git fetch --prune --prune-tags
	git add -A
	git commit -m "chore: bump version to $1"
	git push
	git tag "$1"
	git push origin "$1"
	npm publish --tag "${2-latest}"
fi
