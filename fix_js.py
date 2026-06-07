with open('index.html', 'r') as f:
    content = f.read()

# Fix the intersection observer missing closing brackets
content = content.replace("const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),{threshold:0.12\n", "const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),{threshold:0.12});\n")

content = content.replace("},{threshold:0.5\n", "},{threshold:0.5});\n")

with open('index.html', 'w') as f:
    f.write(content)
