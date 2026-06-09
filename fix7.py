with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add chatOpenRef
code = code.replace(
    "  const [chatOpen,setChatOpen]=useState(false);",
    "  const [chatOpen,setChatOpen]=useState(false);\n  const chatOpenRef=useRef(false);"
)

# Keep ref in sync
code = code.replace(
    "  const [chatOpen,setChatOpen]=useState(false);\n  const chatOpenRef=useRef(false);",
    "  const [chatOpen,setChatOpen]=useState(false);\n  const chatOpenRef=useRef(false);\n"
)

# Update ref when opening/closing chat
code = code.replace(
    "onClick={()=>setChatOpen(true)} style={{flex:1,background:N",
    "onClick={()=>{setChatOpen(true);chatOpenRef.current=true;}} style={{flex:1,background:N"
)
code = code.replace(
    "onClick={()=>setChatOpen(true)}\nstyle={{background",
    "onClick={()=>{setChatOpen(true);chatOpenRef.current=true;}}\nstyle={{background"
)
code = code.replace(
    "onClose={()=>setChatOpen(false)}",
    "onClose={()=>{setChatOpen(false);chatOpenRef.current=false;}}"
)

# Use ref in interval
code = code.replace(
    "      if(chatOpen)return;",
    "      if(chatOpenRef.current)return;"
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')