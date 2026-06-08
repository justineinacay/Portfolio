import re
with open('index.html', 'r') as f:
    content = f.read()

content = content.replace('var(--gold)', 'var(--accent)')
content = content.replace('var(--gold-dim)', 'var(--accent-dim)')
content = content.replace('var(--gold-light)', 'var(--accent-light)')

with open('index.html', 'w') as f:
    f.write(content)
