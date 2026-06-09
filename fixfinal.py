with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace controlled input with uncontrolled
code = code.replace(
    '<input value={chatInput} onChange={e=>{e.stopPropagation();setChatInput(e.target.value);}}',
    '<input id="chat-in" defaultValue=""'
)

# Fix sendChat to use DOM
code = code.replace(
    "  const sendChat=async()=>{\n    if(!chatInput.trim())return;\n    const msg=chatInput.trim();setChatInput(\"\");",
    "  const sendChat=async()=>{\n    const el=document.getElementById('chat-in');\n    const msg=(el?.value||'').trim();\n    if(!msg)return;\n    if(el)el.value='';"
)

# Fix send button disabled
code = code.replace(
    "disabled={!chatInput.trim()||chatLoading}",
    "disabled={chatLoading}"
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')