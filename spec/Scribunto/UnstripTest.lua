local p = {}
function p.unstrip(frame)
    return mw.text.nowiki(mw.text.unstripNoWiki(frame.args[1]))
end
return p
