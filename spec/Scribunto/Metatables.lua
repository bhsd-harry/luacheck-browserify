local p, mt1, mt2 = {}, {}, {}

mt1.__index = {}

function p.zero(frame)
	return 'You called the zero method from p'
end

function mt1.__index.one(frame)
	return 'You called the one method from mt1'
end

function mt2.__index(t, k)
	return function(frame)
		return 'You called the ' .. k .. ' method from mt2'
	end
end

setmetatable(mt1.__index, mt2)
setmetatable(p, mt1)

return p
