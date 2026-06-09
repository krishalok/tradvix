with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove the Chat wrapper function and use AriaChat directly
code = code.replace(
    """  const Chat=()=>{
    const tok=getToken();
    return <AriaChat open={chatOpen} onClose={()=>{setChatOpen(false);chatOpenRef.current=false;}} sheet={sheet} token={tok}/>;
    };""",
    ""
)

# Replace <Chat/> usage with direct AriaChat
code = code.replace(
    "<Chat/>",
    "<AriaChat open={chatOpen} onClose={()=>{setChatOpen(false);chatOpenRef.current=false;}} sheet={sheet} token={getToken()}/>"
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')