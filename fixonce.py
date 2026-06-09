with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add a ref to store input value persistently
code = code.replace(
    "  const [chatInput,setChatInput]=useState(\"\");",
    "  const [chatInput,setChatInput]=useState(\"\");\n  const chatDraft=useRef(\"\");"
)

# Replace the input - use ref to preserve value across re-renders
code = code.replace(
    '<input id="chat-in" defaultValue=""',
    '<input id="chat-in" defaultValue="" onChange={e=>chatDraft.current=e.target.value}'
)

# On re-render restore the value
code = code.replace(
    '<input id="chat-in" defaultValue="" onChange={e=>chatDraft.current=e.target.value}',
    '<input id="chat-in" key="chat-stable" defaultValue="" onChange={e=>{chatDraft.current=e.target.value;document.getElementById("chat-in").value=chatDraft.current;}}'
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')