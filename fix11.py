with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Make sure chatOpen starts as false
code = code.replace(
    "const [chatOpen,setChatOpen]=useState(true);",
    "const [chatOpen,setChatOpen]=useState(false);"
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done:', 'chatOpen default:', 'false' if 'useState(false)' in code else 'TRUE - still broken')