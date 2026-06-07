with open('index.html', 'r') as f:
    content = f.read()

# Fix hero name span color issue. We only want the inner-most span to be blue.
# Original html: <h1 class="hero-name"><span class="hero-name-inner">Justine <span>Inacay</span></span></h1>
content = content.replace('.hero-name span{color:var(--gold);}', '.hero-name > span > span {color:var(--gold);}')

with open('index.html', 'w') as f:
    f.write(content)
