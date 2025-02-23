local std = {
	read_globals = {
		'_G',
		'_VERSION',
		'assert',
		'error',
		'getfenv',
		'getmetatable',
		'ipairs',
		'next',
		'pairs',
		'pcall',
		'rawequal',
		'rawget',
		'rawset',
		'select',
		'setmetatable',
		'tonumber',
		'tostring',
		'type',
		'unpack',
		'xpcall',
		'require',
		debug = {
			fields = {
				traceback = {},
			},
		},
		math = {
			fields = {
				abs = {},
				acos = {},
				asin = {},
				atan = {},
				atan2 = {},
				ceil = {},
				cos = {},
				cosh = {},
				deg = {},
				exp = {},
				floor = {},
				fmod = {},
				frexp = {},
				huge = {},
				ldexp = {},
				log = {},
				log10 = {},
				max = {},
				min = {},
				modf = {},
				pi = {},
				pow = {},
				rad = {},
				random = {},
				randomseed = {},
				sin = {},
				sinh = {},
				sqrt = {},
				tan = {},
				tanh = {},
			},
		},
		os = {
			fields = {
				clock = {},
				date = {},
				difftime = {},
				time = {},
			},
		},
		package = {
			fields = {
				loaded = {},
				loaders = {},
				preload = {},
				seeall = {},
			},
		},
		string = {
			fields = {
				byte = {},
				char = {},
				find = {},
				format = {},
				gmatch = {},
				gsub = {},
				len = {},
				lower = {},
				match = {},
				rep = {},
				reverse = {},
				sub = {},
				ulower = {},
				upper = {},
				uupper = {},
			},
		},
		table = {
			fields = {
				concat = {},
				insert = {},
				maxn = {},
				remove = {},
				sort = {},
			},
		},
		mw = {
			fields = {
				addWarning = {},
				allToString = {},
				clone = {},
				getCurrentFrame = {},
				incrementExpensiveFunctionCount = {},
				isSubsting = {},
				loadData = {},
				loadJsonData = {},
				dumpObject = {},
				log = {},
				logObject = {},
				hash = {
					fields = {
						hashValue = {},
						listAlgorithms = {},
					},
				},
				html = {
					fields = {
						create = {},
					},
				},
				language = {
					fetchLanguageName = {},
					fetchLanguageNames = {},
					getContentLanguage = {},
					getFallbacksFor = {},
					isKnownLanguageTag = {},
					isSupportedLanguage = {},
					isValidBuiltInCode = {},
					isValidCode = {},
					new = {},
				},
				message = {
					fields = {
						new = {},
						newFallbackSequence = {},
						newRawMessage = {},
						rawParam = {},
						numParam = {},
						getDefaultLanguage = {},
					},
				},
				site = {
					fields = {
						currentVersion = {},
						scriptPath = {},
						server = {},
						siteName = {},
						stylePath = {},
						namespaces = {},
						contentNamespaces = {},
						subjectNamespaces = {},
						talkNamespaces = {},
						stats = {
							fields = {
								pages = {},
								articles = {},
								files = {},
								edits = {},
								users = {},
								activeUsers = {},
								admins = {},
								pagesInCategory = {},
								pagesInNamespace = {},
								usersInGroup = {},
								interwikiMap = {},
							},
						},
					},
				},
				text = {
					fields = {
						decode = {},
						encode = {},
						jsonDecode = {},
						jsonEncode = {},
						killMarkers = {},
						listToText = {},
						nowiki = {},
						split = {},
						gsplit = {},
						tag = {},
						trim = {},
						truncate = {},
						unstripNoWiki = {},
						unstrip = {},
						JSON_PRESERVE_KEYS = {},
						JSON_TRY_FIXING = {},
						JSON_PRETTY = {},
					},
				},
				title = {
					fields = {
						equals = {},
						compare = {},
						getCurrentTitle = {},
						new = {},
						makeTitle = {},
					},
				},
				uri = {
					fields = {
						encode = {},
						decode = {},
						anchorEncode = {},
						buildQueryString = {},
						parseQueryString = {},
						canonicalUrl = {},
						fullUrl = {},
						localUrl = {},
						new = {},
						validate = {},
					},
				},
				ustring = {
					fields = {
						maxPatternLength = {},
						maxStringLength = {},
						byte = {},
						byteoffset = {},
						char = {},
						codepoint = {},
						find = {},
						format = {},
						gcodepoint = {},
						gmatch = {},
						gsub = {},
						isutf8 = {},
						len = {},
						lower = {},
						match = {},
						rep = {},
						sub = {},
						toNFC = {},
						toNFD = {},
						toNFKC = {},
						toNFKD = {},
						upper = {},
					},
				},
				ext = {},
			},
		},
	},
}
local opt = {
	std = std,
	max_line_length = false,
	max_code_line_length = false,
	max_string_line_length = false,
	max_comment_line_length = false,
}
function check(str, std_name)
	return luacheck.check_strings({str}, std_name and {std = std_name} or opt)[1]
end
