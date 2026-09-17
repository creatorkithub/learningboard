import os
import re

dir = r'c:\Users\Lenovo\.gemini\antigravity\scratch\learningboard.online'

print("Fixing index.html files in subdirectories...")
for sub in ['whiteboard', 'blackboard']:
    path = os.path.join(dir, sub, 'index.html')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = re.sub(r'href="/(privacy|terms|contact)"', r'href="/\1/"', content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed footer links in {sub}")

print("Fixing blog markdown files...")
posts_dir = os.path.join(dir, 'blog', 'posts')
if os.path.exists(posts_dir):
    for f_name in os.listdir(posts_dir):
        if f_name.endswith('.md'):
            path = os.path.join(posts_dir, f_name)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            # Replace /blog/something.html with /blog/something
            content = re.sub(r'(/blog/[\w-]+)\.html', r'\1', content)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {f_name}")
