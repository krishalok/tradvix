with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Find the ChatPanel inline function and replace with AriaChat
# It starts at "if(!chatOpen)return null;"
start = code.find('    if(!chatOpen)return null;')
end = code.find('  };\n\n  // ── MAIN RENDER', start)

if start > 0 and end > 0:
    old_panel = code[start:end]
    new_panel = '    return <AriaChat open={chatOpen} onClose={()=>setChatOpen(false)} sheet={sheet} token={getToken()}/>;'
    code = code[:start] + new_panel + '\n  ' + code[end:]
    print("Replaced ChatPanel with AriaChat")
else:
    print("Pattern not found, start:", start, "end:", end)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)