local p = {}

local isoTestData = ''

local bit = require('bit')

function p.tooFewArgs()
  require()
end

function p.getAllArgs( frame )
    local buf = {}
	local names = {}
	local values = {}
    for name, value in pairs( frame.args ) do
		table.insert(names, name)
		values[name] = value
	end
	table.sort(names, function (a, b) return tostring(a) < tostring(b) end)
	for index, name in ipairs(names) do
        if #buf ~= 0 then
            table.insert( buf, ', ' )
        end
        table.insert( buf, name .. '=' .. values[name] )
    end
    return table.concat( buf )
end

function p.getAllArgs2( frame )
    local buf = {}
	local names = {}
	local values = {}
    for name, value in frame:argumentPairs() do
		table.insert(names, name)
		values[name] = value
	end
	table.sort(names, function (a, b) return tostring(a) < tostring(b) end)
	for index, name in ipairs(names) do
        if #buf ~= 0 then
            table.insert( buf, ', ' )
        end
        table.insert( buf, name .. '=' .. values[name] )
    end
    return table.concat( buf )
end

function p.getNumericArgs( frame )
	local buf = {}
	for index, value in ipairs(frame.args) do
		if #buf ~= 0 then
			table.insert( buf, ', ' )
		end
		table.insert( buf, index .. '=' .. value )
	end
	return table.concat( buf )
end

function p.getArg( frame )
    local name = frame.args[1]
    return frame:getArgument( name ):expand()
end

function p.getArgLength( frame )
	local name = frame.args[1]
	return #(frame.args[name])
end

function p.getArgType( frame )
	local name = frame.args[1]
	return type( frame.args[name] )
end

function p.hello()
  return 'hello'
end

function p.emptyTable()
  return {}
end

function p.import()
  return require('Module:Test2').countBeans()
end

function p.bitop()
    return bit.bor(1, bit.bor(2, bit.bor(4, 8)))
end

function p.isolationTestUpvalue( frame )
    isoTestData = isoTestData .. frame.args[1]
    return isoTestData
end

function p.isolationTestGlobal( frame )
	if isoTestDataGlobal == nil then
		isoTestDataGlobal = ''
	end
    isoTestDataGlobal = isoTestDataGlobal .. frame.args[1]
    return isoTestDataGlobal
end

function p.getParentArgs( frame )
	return p.getAllArgs( frame:getParent() )
end

function p.testExpandTemplate( frame )
	return frame:expandTemplate{
		title = 'Scribunto_all_args',
		args = { x = 1, y = 2, z = '|||' }
	}
end

function p.testExpandTemplateWithHeaders( frame )
	return frame:expandTemplate{
		title = 'Scribunto_template_with_headers'
	}
end

function p.testNewTemplateParserValue( frame )
	return
		frame:newTemplateParserValue{
			title = 'Scribunto_all_args',
			args = { x = 1, y = 2, z = 'blah' }
		} : expand()
end

function p.testPreprocess( frame )
	return frame:preprocess( '{{Scribunto_all_args|{{{1}}}}}|x=y' )
end

function p.testNewParserValue( frame )
	return frame:newParserValue( '{{Scribunto_all_args|{{{1}}}}}|x=y' ):expand()
end

function p.null( frame )
	return '\0'
end

function p.isSubsting( frame )
	return tostring( mw.isSubsting() )
end

function p.getFrameTitle( frame )
	return frame:getTitle()
end

p['test=InFunctionName'] = function( frame )
	return frame.args[1]
end

function p.testStrippedCss( frame )
	return mw.html.create( 'div' ):css( 'color', frame.args[1] )
end

function p.testFrameCaching( frame )
	return string.format(
		'Parent frame is the root: %s. Child frame is the root: %s.',
		frame:getParent():preprocess('<includeonly>no</includeonly><noinclude>yes</noinclude>'),
		frame:preprocess('<includeonly>no</includeonly><noinclude>yes</noinclude>')
	)
end

function p.testIsRedirect( frame )
	local name = frame.args[1]
	local title = mw.title.new( name )
	if title.redirectTarget then
		return string.format( "redirects to %s", title.redirectTarget.prefixedText )
	else
		return "not a redirect"
	end
end

return p
