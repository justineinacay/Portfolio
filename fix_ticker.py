import re
with open('index.html', 'r') as f:
    content = f.read()

# Remove ticker CSS properly
content = re.sub(r'  \.ticker-wrap\{.*?\n  \.ticker-track\{.*?\n  \.ticker-item\{.*?\n  \.ticker-dot\{.*?\n  @keyframes ticker\{.*?\}\n', '', content)

# Remove ticker HTML properly
content = re.sub(r'<div class="ticker-wrap">.*?</div>\n</div>', '', content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(content)
