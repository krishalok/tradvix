with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    """    const id=setInterval(async()=>{
      if(sheetOpen.current)return;""",
    """    const id=setInterval(async()=>{
      if(sheetOpen.current)return;
      if(chatOpen)return;"""
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')