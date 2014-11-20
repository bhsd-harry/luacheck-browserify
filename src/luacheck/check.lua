local scan = require "luacheck.scan"

--- Checks a Metalua AST. 
-- Returns an array of warnings. 
local function check(ast)
   local callbacks = {}
   local report = {}

   -- Current outer scope. 
   -- Each scope is a table mapping names to tables
   --    {node, mentioned, used, type, is_upvalue, outer[, value]}
   -- Array part contains outer scope, outer closure and outer cycle. 
   local outer = {}

   local function add(w)
      table.insert(report, w)
   end

   local function warning(node, type_, subtype, vartype)
      return {
         type = type_,
         subtype = subtype,
         vartype = vartype,
         name = node[1],
         line = node.line,
         column = node.column
      }
   end

   local function global_warning(node, action, outer)
      local w = warning(node, "global", action, "global")

      if action == "set" and not outer[2] then
         w.notes = {top = true}
      end

      return w
   end

   local function redefined_warning(node, prev_var)
      local w = warning(node, "redefined", "var", prev_var.type)
      w.prev_line = prev_var.node.line
      w.prev_column = prev_var.node.column
      return w
   end

   local function resolve(name)
      local scope = outer
      while scope do
         if scope[name] then
            return scope[name]
         end

         scope = scope[1]
      end
   end

   local function access(variable)
      variable.used = true

      if variable.value then
         variable.value.used = true
      end
   end

   -- If the previous value was unused, adds a warning. 
   local function check_value_usage(variable)
      if not variable.is_upvalue and variable.value and not variable.value.used then
         if variable.value.outer[3] == outer[3] then
            local scope = variable.value.outer

            while scope do
               if scope == outer then
                  local vartype = variable.type

                  if variable.node ~= variable.value.node then
                     vartype = "var"
                  end

                  add(warning(variable.value.node, "unused", "value", vartype))
                  return
               end

               scope = scope[1]
            end
         end
      end
   end

   -- If the variable was unused, adds a warning. 
   local function check_variable_usage(variable)
      if not variable.mentioned then
         add(warning(variable.node, "unused", "var", variable.type))
      else
         if not variable.used then
            add(warning(variable.value.node, "unused", "value", variable.type))
         else
            check_value_usage(variable)
         end
      end
   end

   local function register_variable(node, type_)
      outer[node[1]] = {
         node = node,
         type = type_,
         mentioned = false,
         used = false,
         is_upvalue = false,
         outer = outer
      }
   end

   local function register_value(variable, value_node)
      variable.value = {
         node = value_node,
         used = false,
         outer = outer
      }
   end

   -- If the variable of name does not exist, adds a warning. 
   -- Otherwise returns the variable, marking it as accessed if action == "access"
   -- and updating the `is_upvalue` field. 
   local function check_variable(node, action)
      local name = node[1]
      local variable = resolve(name)

      if not variable then
         if name ~= "..." then
            add(global_warning(node, action, outer))
         end
      else
         if action == "access" then
            access(variable)
         end

         if variable.outer[2] ~= outer[2] then
            variable.is_upvalue = true
         end

         return variable
      end
   end


   function callbacks.on_start(node)
      -- Create new scope. 
      outer = {outer}

      if node.tag == "Function" then
         outer[2] = outer
      else
         outer[2] = outer[1][2]
      end

      if node.tag == "While" or node.tag == "Repeat" or
            node.tag == "Forin" or node.tag == "Fornum" then
         outer[3] = outer
      else
         outer[3] = outer[1][3]
      end
   end

   function callbacks.on_end(_)
      -- Check if some local variables in this scope were left unused. 
      for i, variable in pairs(outer) do
         if type(i) == "string" then
            check_variable_usage(variable)
         end
      end

      -- Delete scope. 
      outer = outer[1]
   end

   function callbacks.on_local(node, type_)
      -- Check if this variable was declared already in this scope. 
      local prev_variable = outer[node[1]]

      if prev_variable then
         check_variable_usage(prev_variable)
         add(redefined_warning(node, prev_variable))
      end

      register_variable(node, type_)
   end

   function callbacks.on_access(node)
      local variable = check_variable(node, "access")

      if variable then
         variable.mentioned = true
      end
   end

   function callbacks.on_assignment(node, is_init)
      local variable = check_variable(node, "set")

      if variable then
         check_value_usage(variable)

         if not is_init then
            variable.mentioned = true
         end

         register_value(variable, node)
      end
   end

   scan(ast, callbacks)
   table.sort(report, function(warning1, warning2)
      return warning1.line < warning2.line or
         warning1.line == warning2.line and warning1.column < warning2.column
   end)
   return report
end

return check
