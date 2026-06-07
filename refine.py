import re

with open('index.html', 'r') as f:
    content = f.read()

# Make nav bar sleek
content = re.sub(
    r'nav\{position:fixed;top:0;left:0;right:0;z-index:100;padding:28px 60px;display:flex;justify-content:space-between;align-items:center;transition:background \.4s,padding \.4s;\}',
    'nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 60px;display:flex;justify-content:space-between;align-items:center;transition:background .4s,padding .4s;background:rgba(251, 251, 253, 0.8);backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid rgba(0,0,0,0.05);}',
    content
)

content = re.sub(
    r'nav\.scrolled\{background:rgba\(7,6,10,0\.88\);backdrop-filter:blur\(16px\);padding:18px 60px;border-bottom:1px solid var\(--border-dim\);\}',
    'nav.scrolled{padding:12px 60px;}',
    content
)

# Hero Center Alignment and Clean Up
content = re.sub(
    r'#hero\{min-height:100vh;display:flex;flex-direction:column;justify-content:flex-end;padding:0 60px 80px;position:relative;overflow:hidden;\}',
    '#hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:120px 60px 80px;position:relative;overflow:hidden;}',
    content
)

# Remove background lines from hero
content = re.sub(
    r'\.hero-bg-lines\{.*?\}',
    '.hero-bg-lines{display:none;}',
    content
)

content = re.sub(
    r'\.hero-eyebrow\{.*?\}',
    '.hero-eyebrow{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--cream-dim);margin-bottom:20px;opacity:0;transform:translateY(20px);animation:revealUp .7s .2s forwards;}',
    content
)

content = re.sub(
    r'\.hero-name\{.*?\}',
    '.hero-name{font-size:clamp(3rem,8vw,7rem);font-weight:700;line-height:1.05;letter-spacing:-.04em;color:var(--cream);margin-bottom:24px;}',
    content
)

content = re.sub(
    r'\.hero-name-inner\{.*?\}',
    '.hero-name-inner{display:block;opacity:0;transform:translateY(20px);animation:revealUp .9s .4s cubic-bezier(.23,1,.32,1) forwards;}',
    content
)

content = re.sub(
    r'\.hero-sub\{.*?\}',
    '.hero-sub{display:flex;flex-direction:column;align-items:center;gap:30px;opacity:0;transform:translateY(20px);animation:revealUp .7s .85s forwards;}',
    content
)

content = re.sub(
    r'\.hero-tagline\{.*?\}',
    '.hero-tagline{font-size:1.2rem;color:var(--cream-dim);max-width:600px;line-height:1.6;font-weight:400;}',
    content
)

# Buttons as Apple Pills
content = re.sub(
    r'\.btn-primary\{.*?\}',
    '.btn-primary{display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;background:var(--gold);color:#fff;font-size:1rem;font-weight:400;letter-spacing:normal;text-transform:none;text-decoration:none;border-radius:980px;transition:background .3s,transform .2s;}',
    content
)

content = re.sub(
    r'\.btn-ghost\{.*?\}',
    '.btn-ghost{display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;background:transparent;color:var(--gold);font-size:1rem;font-weight:400;letter-spacing:normal;text-transform:none;text-decoration:none;border:1px solid var(--gold);border-radius:980px;transition:background .3s,color .3s;}',
    content
)
content = re.sub(
    r'\.btn-ghost:hover\{.*?\}',
    '.btn-ghost:hover{background:var(--gold);color:#fff;}',
    content
)

# Ticker removal from HTML
content = re.sub(
    r'<div class="ticker-wrap">.*?</div>\n</div>',
    '',
    content,
    flags=re.DOTALL
)

# Also remove ticker CSS
content = re.sub(
    r'\.ticker-wrap\{.*?\}\n\.ticker-track\{.*?\}\n\.ticker-item\{.*?\}\n\.ticker-dot\{.*?\}\n@keyframes ticker\{.*?\}',
    '',
    content,
    flags=re.DOTALL
)

# Section Headers & Layouts
content = re.sub(
    r'\.section-label\{.*?\}',
    '.section-label{font-size:1rem;font-weight:600;color:var(--cream);margin-bottom:24px;display:block;}',
    content
)

content = re.sub(
    r'\.about-heading\{.*?\}',
    '.about-heading{font-size:clamp(2rem,3vw,2.5rem);font-weight:600;line-height:1.2;letter-spacing:-.02em;color:var(--cream);margin-bottom:24px;}',
    content
)
content = re.sub(
    r'\.exp-heading\{.*?\}',
    '.exp-heading{font-size:clamp(2rem,3vw,2.5rem);font-weight:600;line-height:1.2;letter-spacing:-.02em;color:var(--cream);margin-bottom:24px;}',
    content
)
content = re.sub(
    r'\.skills-heading\{.*?\}',
    '.skills-heading{font-size:clamp(2rem,3vw,2.5rem);font-weight:600;line-height:1.2;letter-spacing:-.02em;color:var(--cream);margin-bottom:24px;}',
    content
)

# Cards styling
content = re.sub(
    r'\.exp-card\{.*?\}',
    '.exp-card{padding:32px;background:var(--surface);border:1px solid var(--border-dim);border-radius:18px;position:relative;overflow:hidden;transition:box-shadow .4s, transform .4s; box-shadow: 0 4px 6px rgba(0,0,0,0.02);}',
    content
)
content = re.sub(
    r'\.exp-card:hover\{.*?\}',
    '.exp-card:hover{box-shadow: 0 10px 20px rgba(0,0,0,0.05); transform: translateY(-2px);}',
    content
)
content = re.sub(
    r'\.exp-card::before\{.*?\}',
    '',
    content
)
content = re.sub(
    r'\.exp-card:hover::before\{.*?\}',
    '',
    content
)

content = re.sub(
    r'\.cert-card\{.*?\}',
    '.cert-card{padding:24px;background:var(--surface);border:1px solid var(--border-dim);border-radius:18px;transition:box-shadow .3s, transform .3s; box-shadow: 0 4px 6px rgba(0,0,0,0.02);}',
    content
)
content = re.sub(
    r'\.cert-card:hover\{.*?\}',
    '.cert-card:hover{box-shadow: 0 10px 20px rgba(0,0,0,0.05); transform: translateY(-2px);}',
    content
)

# Skills Pills
content = re.sub(
    r'\.skill-pill\{.*?\}',
    '.skill-pill{padding:8px 16px;background:var(--surface2);border-radius:20px;font-size:.9rem;font-weight:400;color:var(--cream);transition:background .3s, transform .2s;}',
    content
)
content = re.sub(
    r'\.skill-pill:hover\{.*?\}',
    '.skill-pill:hover{background:var(--border-dim);}',
    content
)

# Adjust Contact Section
content = re.sub(
    r'\.contact-heading\{.*?\}',
    '.contact-heading{font-size:clamp(2.5rem,5vw,5rem);font-weight:700;letter-spacing:-.03em;color:var(--cream);line-height:1.1;margin-bottom:24px;}',
    content
)
content = re.sub(
    r'\.contact-bg\{.*?\}',
    '.contact-bg{display:none;}',
    content
)

# Clean up 'em' and 'span' styles that were gold italic
content = re.sub(r'em\{color:var\(--gold\);font-style:italic;\}', 'em{color:var(--gold);font-style:normal;}', content)
content = re.sub(r'\.hero-name span\{color:var\(--gold\);font-style:italic;\}', '.hero-name span{color:var(--gold);}', content)


with open('index.html', 'w') as f:
    f.write(content)
