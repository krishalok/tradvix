with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove chatInput, chatHistory, chatLoading states - AriaChat handles its own state now
code = code.replace("  const [chatInput,setChatInput]=useState(\"\");\n", "")
code = code.replace("  const [chatHistory,setChatHistory]=useState([]);\n", "")
code = code.replace("  const [chatLoading,setChatLoading]=useState(false);\n", "")

# Remove sendChat function
import re
code = re.sub(r"  // ── CHAT ─+\n  const sendChat=async\(\)=>\{.*?\};\n", "", code, flags=re.DOTALL)

# Fix token - store once
code = code.replace(
    "<AriaChat open={chatOpen} onClose={()=>{setChatOpen(false);chatOpenRef.current=false;}} sheet={sheet} token={getToken()}/>",
    "<AriaChat open={chatOpen} onClose={()=>{setChatOpen(false);chatOpenRef.current=false;}} sheet={sheet} token={localStorage.getItem('tv_token')}/>"
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')