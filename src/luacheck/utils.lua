-- luacheck: push compat
local unpack = table.unpack or unpack
local pack = table.pack or function(...) return {n = select("#", ...), ...} end
-- luacheck: pop

local utils = {}

function utils.array_to_set(array)
   local set = {}

   for index, value in ipairs(array) do
      set[value] = index
   end

   return set
end

function utils.concat_arrays(array)
   local res = {}

   for _, subarray in ipairs(array) do
      for _, item in ipairs(subarray) do
         table.insert(res, item)
      end
   end

   return res
end

function utils.update(t1, t2)
   for k, v in pairs(t2) do
      t1[k] = v
   end

   return t1
end

local class_metatable = {}

function class_metatable.__call(class, ...)
   local obj = setmetatable({}, class)

   if class.__init then
      local init_returns = pack(class.__init(obj, ...))

      if init_returns.n > 0 then
         return unpack(init_returns, 1, init_returns.n)
      end
   end

   return obj
end

function utils.class()
   local class = setmetatable({}, class_metatable)
   class.__index = class
   return class
end

function utils.is_instance(object, class)
   return rawequal(debug.getmetatable(object), class)
end

utils.Stack = utils.class()

function utils.Stack:__init()
   self.size = 0
end

function utils.Stack:push(value)
   self.size = self.size + 1
   self[self.size] = value
   self.top = value
end

function utils.Stack:pop()
   local value = self[self.size]
   self[self.size] = nil
   self.size = self.size - 1
   self.top = self[self.size]
   return value
end

local ErrorWrapper = utils.class()

function ErrorWrapper:__init(err, traceback)
   self.err = err
   self.traceback = traceback
end

function ErrorWrapper:__tostring()
   return tostring(self.err) .. "\n" .. self.traceback
end

local function error_handler(err)
   if utils.is_instance(err, ErrorWrapper) then
      return err
   else
      return ErrorWrapper(err, debug.traceback())
   end
end

-- Like pcall, but wraps errors in {err = err, traceback = traceback}
-- tables unless already wrapped.
function utils.try(f, ...)
   local args = {...}
   local num_args = select("#", ...)

   local function task()
      return f(unpack(args, 1, num_args))
   end

   return xpcall(task, error_handler)
end

local function ripairs_iterator(array, i)
   if i == 1 then
      return nil
   else
      i = i - 1
      return i, array[i]
   end
end

function utils.ripairs(array)
   return ripairs_iterator, array, #array + 1
end

function utils.sorted_pairs(t)
   local keys = {}

   for key in pairs(t) do
      table.insert(keys, key)
   end

   table.sort(keys)

   local index = 1

   return function()
      local key = keys[index]

      if key == nil then
         return
      end

      index = index + 1

      return key, t[key]
   end
end

function utils.after(str, pattern)
   local _, last_matched_index = str:find(pattern)

   if last_matched_index then
      return str:sub(last_matched_index + 1)
   end
end

function utils.strip(str)
   local _, last_start_space = str:find("^%s*")
   local first_end_space = str:find("%s*$")
   return str:sub(last_start_space + 1, first_end_space - 1)
end

-- `sep` must be nil or a single character. Behaves like python's `str.split`.
function utils.split(str, sep)
   local parts = {}
   local pattern

   if sep then
      pattern = sep .. "([^" .. sep .. "]*)"
      str = sep .. str
   else
      pattern = "%S+"
   end

   for part in str:gmatch(pattern) do
      table.insert(parts, part)
   end

   return parts
end

utils.InvalidPatternError = utils.class()

function utils.InvalidPatternError:__init(err, pattern)
   self.err = err
   self.pattern = pattern
end

function utils.InvalidPatternError:__tostring()
   return self.err
end

-- Behaves like string.match, except it normally returns boolean and
-- throws an instance of utils.InvalidPatternError on invalid pattern.
-- The error object turns into original error when tostring is used on it,
-- to ensure behaviour is predictable when luacheck is used as a module.
function utils.pmatch(str, pattern)
   assert(type(str) == "string")
   assert(type(pattern) == "string")

   local ok, res = pcall(string.match, str, pattern)

   if not ok then
      error(utils.InvalidPatternError(res, pattern), 0)
   else
      return not not res
   end
end

-- Returns validator checking type.
function utils.has_type(type_)
   return function(x)
      if type(x) == type_ then
         return true
      else
         return false, ("%s expected, got %s"):format(type_, type(x))
      end
   end
end

-- Returns validator checking type and allowing false.
function utils.has_type_or_false(type_)
   return function(x)
      if type(x) == type_ then
         return true
      elseif type(x) == "boolean" then
         if x then
            return false, ("%s or false expected, got true"):format(type_)
         else
            return true
         end
      else
         return false, ("%s or false expected, got %s"):format(type_, type(x))
      end
   end
end

-- Returns validator checking that value is an array with elements of type.
function utils.array_of(type_)
   return function(x)
      if type(x) ~= "table" then
         return false, ("array of %ss expected, got %s"):format(type_, type(x))
      end

      for index, item in ipairs(x) do
         if type(item) ~= type_ then
            return false, ("array of %ss expected, got %s at index [%d]"):format(type_, type(item), index)
         end
      end

      return true
   end
end

return utils
