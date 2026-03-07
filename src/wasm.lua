local luacheck = require('luacheck')

local empty = {}
local obj = {other_fields = true}

local scribunto = {
	read_globals = {
		_VERSION = empty,
		assert = empty,
		error = empty,
		getfenv = empty,
		getmetatable = empty,
		ipairs = empty,
		next = empty,
		pairs = empty,
		pcall = empty,
		rawequal = empty,
		rawget = empty,
		rawset = empty,
		select = empty,
		setmetatable = empty,
		tonumber = empty,
		tostring = empty,
		type = empty,
		unpack = empty,
		xpcall = empty,
		require = empty,
		_G = {other_fields = true, read_only = false},
		debug = {
			fields = {
				traceback = empty,
			},
		},
		math = {
			fields = {
				abs = empty,
				acos = empty,
				asin = empty,
				atan = empty,
				atan2 = empty,
				ceil = empty,
				cos = empty,
				cosh = empty,
				deg = empty,
				exp = empty,
				floor = empty,
				fmod = empty,
				frexp = empty,
				huge = empty,
				ldexp = empty,
				log = empty,
				log10 = empty,
				max = empty,
				min = empty,
				modf = empty,
				pi = empty,
				pow = empty,
				rad = empty,
				random = empty,
				randomseed = empty,
				sin = empty,
				sinh = empty,
				sqrt = empty,
				tan = empty,
				tanh = empty,
			},
		},
		os = {
			fields = {
				clock = empty,
				date = empty,
				difftime = empty,
				time = empty,
			},
		},
		package = {
			fields = {
				loaded = obj,
				loaders = obj,
				preload = obj,
				seeall = empty,
			},
		},
		string = {
			fields = {
				byte = empty,
				char = empty,
				find = empty,
				format = empty,
				gmatch = empty,
				gsub = empty,
				len = empty,
				lower = empty,
				match = empty,
				rep = empty,
				reverse = empty,
				sub = empty,
				ulower = empty,
				upper = empty,
				uupper = empty,
			},
		},
		table = {
			fields = {
				concat = empty,
				insert = empty,
				maxn = empty,
				remove = empty,
				sort = empty,
			},
		},
		mw = {
			fields = {
				addWarning = empty,
				allToString = empty,
				clone = empty,
				getContentLanguage = empty,
				getCurrentFrame = empty,
				getLanguage = empty,
				incrementExpensiveFunctionCount = empty,
				isSubsting = empty,
				loadData = empty,
				loadJsonData = empty,
				dumpObject = empty,
				log = empty,
				logObject = empty,
				hash = {
					fields = {
						hashValue = empty,
						listAlgorithms = empty,
					},
				},
				html = {
					fields = {
						create = empty,
					},
				},
				language = {
					fields = {
						fetchLanguageName = empty,
						fetchLanguageNames = empty,
						getContentLanguage = empty,
						getFallbacksFor = empty,
						isKnownLanguageTag = empty,
						isSupportedLanguage = empty,
						isValidBuiltInCode = empty,
						isValidCode = empty,
						new = empty,
						FALLBACK_MESSAGES = empty,
						FALLBACK_STRICT = empty,
					},
				},
				message = {
					fields = {
						new = empty,
						newFallbackSequence = empty,
						newRawMessage = empty,
						rawParam = empty,
						numParam = empty,
						getDefaultLanguage = empty,
					},
				},
				site = {
					fields = {
						currentVersion = empty,
						scriptPath = empty,
						server = empty,
						siteName = empty,
						stylePath = empty,
						wikiId = empty,
						namespaces = obj,
						contentNamespaces = obj,
						subjectNamespaces = obj,
						talkNamespaces = obj,
						stats = {
							fields = {
								pages = empty,
								articles = empty,
								files = empty,
								edits = empty,
								users = empty,
								activeUsers = empty,
								admins = empty,
								pagesInCategory = empty,
								pagesInNamespace = empty,
								usersInGroup = empty,
								interwikiMap = empty,
							},
						},
					},
				},
				svg = {
					fields = {
						new = empty,
					},
				},
				text = {
					fields = {
						decode = empty,
						encode = empty,
						jsonDecode = empty,
						jsonEncode = empty,
						killMarkers = empty,
						listToText = empty,
						nowiki = empty,
						split = empty,
						gsplit = empty,
						tag = empty,
						trim = empty,
						truncate = empty,
						unstripNoWiki = empty,
						unstrip = empty,
						JSON_PRESERVE_KEYS = empty,
						JSON_TRY_FIXING = empty,
						JSON_PRETTY = empty,
					},
				},
				title = {
					fields = {
						equals = empty,
						compare = empty,
						getCurrentTitle = empty,
						new = empty,
						newBatch = empty,
						makeTitle = empty,
					},
				},
				uri = {
					fields = {
						encode = empty,
						decode = empty,
						anchorEncode = empty,
						buildQueryString = empty,
						parseQueryString = empty,
						canonicalUrl = empty,
						fullUrl = empty,
						localUrl = empty,
						new = empty,
						validate = empty,
					},
				},
				ustring = {
					fields = {
						maxPatternLength = empty,
						maxStringLength = empty,
						byte = empty,
						byteoffset = empty,
						char = empty,
						codepoint = empty,
						find = empty,
						format = empty,
						gcodepoint = empty,
						gmatch = empty,
						gsub = empty,
						isutf8 = empty,
						len = empty,
						lower = empty,
						match = empty,
						rep = empty,
						sub = empty,
						toNFC = empty,
						toNFD = empty,
						toNFKC = empty,
						toNFKD = empty,
						upper = empty,
					},
				},
				ext = obj,
				wikibase = obj,
			},
		},
	},
}
local opt = {
	std = scribunto,
	max_line_length = false,
	max_code_line_length = false,
	max_string_line_length = false,
	max_comment_line_length = false,
}
function check(str, std_name)
	local options = opt
	if type(std_name) == 'table' and std_name.std ~= nil then
		options = std_name
	elseif std_name ~= nil then
		options = {std = std_name}
	end
	if options.std == 'mediawiki' then
		options.std = scribunto
	end
	return luacheck.check_strings({str}, options)[1]
end
