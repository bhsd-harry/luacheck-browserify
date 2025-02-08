'use strict';

const config = require('@bhsd/common/eslintrc.node.cjs');

module.exports = {
	...config,
	overrides: [
		...config.overrides,
		{
			files: 'spec/test.js',
			env: {
				mocha: true,
			},
		},
	],
};
