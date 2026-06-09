with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

import re

# Remove ALL chatDraft occurrences
code = re.sub(r'\s*const chatDraft=useRef\(""\);', '', code)

# Remove ALL chatInput state
code = re.sub(r'\s*const \[chatInput,setChatInput\]=useState\(""\);', '', code)

# Replace the input element completely
code = re.sub(
    r'<input id="chat-in".*?/>',
    '<input id="chat-in" placeholder={`Ask about ${sheet||"the market"}...`} style={{flex:1,border:"1px solid #e5e7eb",borderRadius:24,padding:"10px 16px",fontSize:13,color:N,outline:"none",fontFamily:"system-ui",background:"#f9fafb"}} onKeyDown={e=>{e.stopPropagation();if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}}}/>',
    code,
    flags=re.DOTALL
)

# Replace sendChat function
old_send = re.search(r'const sendChat=async\(\)=>\{.*?\};', code, re.DOTALL)
if old_send:
    code = code.replace(old_send.group(), '''const sendChat=async()=>{
    const el=document.getElementById('chat-in');
    const msg=(el?.value||'').trim();
    if(!msg)return;
    el.value='';
    el.focus();
    const newHistory=[...chatHistory,{role:"user",content:msg}];
    setChatHistory(newHistory);setChatLoading(true);
    try{
      const r=await apiPost('/api/chat',{message:msg,symbol:sheet,history:chatHistory.slice(-6)});
      setChatHistory(h=>[...h,{role:"assistant",content:r.response}]);
    }catch(e){setChatHistory(h=>[...h,{role:"assistant",content:"Sorry, I couldn't process that."}]);}
    setChatLoading(false);
    el?.focus();
  };''')
    print("sendChat replaced")

# Fix send button
code = code.replace(
    'disabled={!chatInput.trim()||chatLoading}',
    'disabled={chatLoading}'
)
code = code.replace(
    'disabled={chatLoading}\n            style={{width:42',
    'disabled={chatLoading} style={{width:42'
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')