with open('index.html', 'r') as f:
    content = f.read()

# Make sure hero-sub is correctly structured for the new css flex-direction column.
content = content.replace('<p class="hero-tagline">', '<p class="hero-tagline">') # this is fine.

# The ticker wrap in html has a weird closing tag matching issue sometimes. Let's make sure it's gone.
import re
content = re.sub(r'<div class="ticker-wrap">.*?</div>\n</div>', '', content, flags=re.DOTALL)
content = re.sub(r'<div class="ticker-wrap">[\s\S]*?</div>\s*</div>', '', content)

with open('index.html', 'w') as f:
    f.write(content)
