with open('index.html', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if '--gold:' in line:
        line = line.replace('--gold:', '--accent:')
        line = line.replace('--gold-dim:', '--accent-dim:')
        line = line.replace('--gold-light:', '--accent-light:')
    new_lines.append(line)

with open('index.html', 'w') as f:
    f.writelines(new_lines)
