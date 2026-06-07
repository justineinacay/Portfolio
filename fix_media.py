with open('index.html', 'r') as f:
    content = f.read()

# Make sure hero padding in mobile media query matches our new style but with smaller padding
import re
content = re.sub(r'#hero\{padding:0 24px 60px;\}', '#hero{padding:100px 24px 60px;}', content)

with open('index.html', 'w') as f:
    f.write(content)
