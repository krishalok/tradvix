with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add import at top
code = code.replace(
    'import { useState, useEffect, useRef, useCallback } from "react";',
    'import { useState, useEffect, useRef, useCallback } from "react";\nimport AriaChat from "./AriaChat";'
)

# Remove old chatInput state
code = code.replace(
    '  const [chatInput,setChatInput]=useState("");',
    ''
)

# Replace ChatPanel usage with AriaChat
code = code.replace(
    '{chatOpen&&<ChatPanel/>}',
    '{chatOpen&&<AriaChat open={chatOpen} onClose={()=>setChatOpen(false)} sheet={sheet} token={getToken()}/>}'
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')