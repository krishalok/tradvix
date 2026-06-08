with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix - memoize the AriaChat call so it doesn't re-render
code = code.replace(
    'return <AriaChat open={chatOpen} onClose={()=>setChatOpen(false)} sheet={sheet} token={getToken()}/>;',
    'const tok=getToken();\n    return <AriaChat open={chatOpen} onClose={()=>setChatOpen(false)} sheet={sheet} token={tok}/>;'
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')