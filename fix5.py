with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Find TypeText and replace with static text
code = code.replace(
    '<TypeText text={ariaLines[ariaIdx].replace(/\\*\\*(.*?)\\*\\*/g,\'$1\')} speed={20}/>',
    '<span>{ariaLines[ariaIdx].replace(/\\*\\*(.*?)\\*\\*/g,\'$1\')}</span>'
)

# Also try other variations
code = code.replace(
    "speed={20}/>}",
    "speed={20}/>}"
)

print("TypeText occurrences:", code.count("TypeText"))

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')