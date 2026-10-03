local package_name = "luacheck-browserify"
local package_version = "dev"
local rockspec_revision = "1"
local github_account_name = "bhsd-harry"
local github_repo_name = package_name

rockspec_format = "3.0"
package = package_name
version = package_version .. "-" .. rockspec_revision

source = {
   url = "git+https://github.com/" .. github_account_name .. "/" .. github_repo_name .. ".git"
}

dependencies = {
   "lua >= 5.1",
}

test_dependencies = {
   "json-lua",
}

build = {
   type = "builtin",
   modules = {}
}
