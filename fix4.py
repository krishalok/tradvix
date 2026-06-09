with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix 1 - ariaIdx should use ref not state
code = code.replace(
    "  const [ariaIdx,setAriaIdx]=useState(0);",
    "  const ariaIdxRef=useRef(0);\n  const [ariaIdx,setAriaIdx]=useState(0);"
)

code = code.replace(
    "const id=setInterval(()=>setAriaIdx(i=>(i+1)%ariaLines.length),8000);",
    "const id=setInterval(()=>{ariaIdxRef.current=(ariaIdxRef.current+1)%ariaLines.length;setAriaIdx(ariaIdxRef.current);},8000);"
)

# Fix 2 - TypeText causes re-renders - make it not propagate
# The TypeText component calls setShown which re-renders App
# Move ariaLines display to use a ref-based approach
code = code.replace(
    "{ariaLines[ariaIdx]&&<TypeText text={ariaLines[ariaIdx].replace(/\\*\\*(.*?)\\*\\*/g,'$1')} speed={20}/>}",
    "{ariaLines[ariaIdx]&&<span style={{fontFamily:'system-ui',fontSize:13,color:'#374151',lineHeight:1.6}}>{ariaLines[ariaIdx].replace(/\\*\\*(.*?)\\*\\*/g,'$1')}</span>}"
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')