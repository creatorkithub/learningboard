import os

def replace_emdash(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.html', '.md', '.json', '.txt')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    if '—' in content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(content.replace('—', '-'))
                except Exception as e:
                    print(f"Error on {path}: {e}")

replace_emdash('.')
