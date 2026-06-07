import re

with open('index.html', 'r') as f:
    content = f.read()

# Remove Google Fonts
content = re.sub(r'<link rel="preconnect" href="https://fonts\.googleapis\.com">\n', '', content)
content = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=.*?" rel="stylesheet">\n', '', content)

# Update CSS variables and body
css_vars = """  :root {
    --bg: #fbfbfd;
    --surface: #ffffff;
    --surface2: #f5f5f7;
    --gold: #0071e3;
    --gold-light: #47a9ff;
    --gold-dim: #0051a8;
    --cream: #1d1d1f;
    --cream-dim: #86868b;
    --cream-muted: #a1a1a6;
    --border: #d2d2d7;
    --border-dim: #e5e5ea;
  }
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{background:var(--bg);color:var(--cream);font-family:-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;font-size:16px;line-height:1.6;overflow-x:hidden;}"""

content = re.sub(r'  :root \{.*?\n  body\{.*?\}', css_vars, content, flags=re.DOTALL)

# Remove cursor CSS
content = re.sub(r'\n  #cursor-dot\{.*?\}\n  #cursor-ring\{.*?\}\n  body\.hovering #cursor-dot\{.*?\}\n  body\.hovering #cursor-ring\{.*?\}', '', content, flags=re.DOTALL)

# Remove cursor HTML
content = re.sub(r'\n<div id="cursor-dot"></div>\n<div id="cursor-ring"></div>\n', '', content)

# Remove cursor JS
js_remove = """const dot=document.getElementById('cursor-dot'),ring=document.getElementById('cursor-ring');
let mx=window.innerWidth/2,my=window.innerHeight/2,rx=mx,ry=my;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px';});
(function animRing(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing);})();
document.querySelectorAll('a,button,.exp-card,.skill-pill,.cert-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));
});
"""
content = content.replace(js_remove, '')

# Remove all cursor:none;
content = content.replace('cursor:none;', '')

# Remove all font-family declarations in CSS except body
content = re.sub(r"font-family:'[^']+',(?:sans-serif|serif|monospace);", '', content)

with open('index.html', 'w') as f:
    f.write(content)
