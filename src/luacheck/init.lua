local check = require "luacheck.check"
local filter = require "luacheck.filter"
local options = require "luacheck.options"

local luacheck = {
   _VERSION = "1.2.0"
}

local function raw_validate_options(fname, opts, context)
   local ok, err = options.validate(options.all_options, opts)

   if not ok then
      if context then
         error(("bad argument #2 to '%s' (%s: %s)"):format(fname, context, err))
      else
         error(("bad argument #2 to '%s' (%s)"):format(fname, err))
      end
   end
end

local function validate_options(fname, items, opts)
   raw_validate_options(fname, opts)

   if opts ~= nil then
      for i in ipairs(items) do
         raw_validate_options(fname, opts[i], ("invalid options at index [%d]"):format(i))

         if opts[i] ~= nil then
            for j, nested_opts in ipairs(opts[i]) do
               raw_validate_options(fname, nested_opts, ("invalid options at index [%d][%d]"):format(i, j))
            end
         end
      end
   end
end

-- Returns report for a string.
function luacheck.get_report(src)
   local msg = ("bad argument #1 to 'luacheck.get_report' (string expected, got %s)"):format(type(src))
   return check(src)
end

-- Applies options to reports. Reports with .fatal field are unchanged.
-- Options are applied to reports[i] in order: options, options[i], options[i][1], options[i][2], ...
-- Returns new array of reports, adds .warnings, .errors and .fatals fields to this array.
function luacheck.process_reports(reports, opts)
   local report = filter.filter(reports, opts)

   return report
end

-- Checks strings with options, returns report.
function luacheck.check_strings(srcs, opts)
   validate_options("luacheck.check_strings", srcs, opts)

   local reports = {}

   for i, src in ipairs(srcs) do
      reports[i] = luacheck.get_report(src)
   end

   return luacheck.process_reports(reports, opts)
end

return luacheck
