local JSON = require('json')
local luacheck = require('luacheck')
local min_luacheck = require('bundle')
require('wasm')

local failed = false

local function test(name, errors, results)
	if #errors ~= #results then
		failed = true
		print(string.format(
			'Error in test %s: expected %d results, got %d',
			name, #errors, #results
		))
	end
	for i, expected in ipairs(errors) do
		local actual = results[i]
		for k, v in pairs(actual) do
			if k == 'indexing' then
				if #v ~= #expected[k] then
					failed = true
					print(string.format(
						'Error in test %s at index %d: expected %d indexing entries, got %d',
						name, i, #expected[k], #v
					))
				end
				for j, entry in ipairs(expected[k]) do
					if entry ~= v[j] then
						failed = true
						print(string.format(
							'Error in test %s at index %d: expected indexing entry %d to be %s, got %s',
							name, i, j, JSON:encode(entry), JSON:encode(v[j])
						))
					end
				end
			elseif v ~= expected[k] then
				failed = true
				print(string.format(
					'Error in test %s at index %d: errors %s = %s, got %s',
					name, i, k, JSON:encode(expected[k]), JSON:encode(v)
				))
			end
		end
	end
end

local function native_check(code, std)
	return luacheck.check_strings({code}, {std = std})[1]
end

local function suite(tests, dir, category, f1, f2, std)
	failed = false
	local n = 0
	for name, errors in pairs(tests) do
		n = n + 1
		local file = io.open('../spec/' .. dir .. '/' .. name, 'r')
		local code = file:read('*a')
		file:close()
		test(name, errors, f1(code, std))
		test(name, errors, f2(code, std))
	end

	assert(not failed, string.format('Some %s tests failed', category))
	print(string.format('All %d %s tests passed', n, category))
end

local file = io.open('../spec/tests.json', 'r')
local tests = JSON:decode(file:read('*a'))
file:close()
suite(tests, 'samples', 'Luacheck', native_check, min_luacheck, 'max')

file = io.open('../spec/ScribuntoTests.json', 'r')
tests = JSON:decode(file:read('*a'))
file:close()
suite(tests, 'Scribunto', 'Scribunto', check, min_luacheck)
