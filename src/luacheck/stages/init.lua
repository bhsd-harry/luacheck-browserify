local utils = require "luacheck.utils"

local stages = {}

-- Checking is organized into stages run one after another.
-- Each stage is in its own module and provides `run` function operating on a check state,
-- and optionally `warnings` table mapping issue codes to tables with fields `message_format`
-- containing format string for the issue or a function returning it given the issue,
-- and `fields` containing array of extra fields this warning can have.

stages.modules = {}

table.insert(stages.modules, require("luacheck.stages.parse"))
table.insert(stages.modules, require("luacheck.stages.unwrap_parens"))
table.insert(stages.modules, require("luacheck.stages.linearize"))
table.insert(stages.modules, require("luacheck.stages.parse_inline_options"))
table.insert(stages.modules, require("luacheck.stages.name_functions"))
table.insert(stages.modules, require("luacheck.stages.resolve_locals"))
table.insert(stages.modules, require("luacheck.stages.detect_bad_whitespace"))
table.insert(stages.modules, require("luacheck.stages.detect_cyclomatic_complexity"))
table.insert(stages.modules, require("luacheck.stages.detect_empty_blocks"))
table.insert(stages.modules, require("luacheck.stages.detect_empty_statements"))
table.insert(stages.modules, require("luacheck.stages.detect_globals"))
table.insert(stages.modules, require("luacheck.stages.detect_reversed_fornum_loops"))
table.insert(stages.modules, require("luacheck.stages.detect_unbalanced_assignments"))
table.insert(stages.modules, require("luacheck.stages.detect_uninit_accesses"))
table.insert(stages.modules, require("luacheck.stages.detect_unreachable_code"))
table.insert(stages.modules, require("luacheck.stages.detect_unused_fields"))
table.insert(stages.modules, require("luacheck.stages.detect_unused_locals"))

stages.warnings = {}

local base_fields = {"code", "line", "column", "end_column"}

local function register_warnings(warnings)
   for code, warning in pairs(warnings) do
      assert(not stages.warnings[code])
      assert(warning.message_format)
      assert(warning.fields)

      local full_fields = utils.concat_arrays({base_fields, warning.fields})

      stages.warnings[code] = {
         message_format = warning.message_format,
         fields = full_fields,
         fields_set = utils.array_to_set(full_fields)
      }
   end
end

-- Issues that do not originate from normal check stages (excluding global related ones).
register_warnings({
   ["011"] = {message_format = "{msg}", fields = {"msg", "prev_line", "prev_column", "prev_end_column"}},
   ["631"] = {message_format = "line is too long ({end_column} > {max_length})", fields = {}}
})

for _, stage_module in ipairs(stages.modules) do
   if stage_module.warnings then
      register_warnings(stage_module.warnings)
   end
end

function stages.run(chstate)
   for _, stage_module in ipairs(stages.modules) do
      stage_module.run(chstate)
   end
end

return stages
