with open('index.html', 'r') as f:
    content = f.read()

# Make sure all cursor-related js is really removed
content = content.replace("const dot=document.getElementById('cursor-dot'),ring=document.getElementById('cursor-ring');", "")
content = content.replace("let mx=window.innerWidth/2,my=window.innerHeight/2,rx=mx,ry=my;", "")
content = content.replace("document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px';});", "")
content = content.replace("(function animRing(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing);})();", "")
content = content.replace("document.querySelectorAll('a,button,.exp-card,.skill-pill,.cert-card').forEach(el=>{", "")
content = content.replace("  el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));", "")
content = content.replace("  el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));", "")
content = content.replace("});", "")

with open('index.html', 'w') as f:
    f.write(content)
