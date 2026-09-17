import json
import os
import subprocess

dir = r'c:\Users\Lenovo\.gemini\antigravity\scratch\learningboard.online'
posts_json = os.path.join(dir, 'blog', 'data', 'posts.json')
llms_txt = os.path.join(dir, 'llms.txt')

new_posts = [
    {
        'id': 'hardware-stylus-precision',
        'title': 'Beyond the Screen: How Hardware Styluses are Revolutionizing Precision in Digital Teaching',
        'date': '2026-09-17',
        'excerpt': 'Explore how tools like Apple Pencil and Wacom tablets bridge the physical-digital divide, drastically improving mathematical and scientific legibility on digital canvases.',
        'author': 'LearningBoard Team',
        'tags': ['hardware', 'digital-teaching', 'stylus', 'precision']
    },
    {
        'id': 'micro-lectures-digital-canvases',
        'title': 'The Rise of Micro-Lectures: Using Digital Canvases for Snackable Educational Content',
        'date': '2026-09-17',
        'excerpt': 'Discover the pedagogical shift toward shorter video explainers and how infinite digital whiteboards maintain crucial context that traditional slide decks destroy.',
        'author': 'LearningBoard Team',
        'tags': ['pedagogy', 'micro-lectures', 'edtech', 'digital-canvas']
    }
]

# Update posts.json
with open(posts_json, 'r', encoding='utf-8') as f:
    posts = json.load(f)

# check if we already added it to prevent duplicates if it actually worked partially
if not any(p['id'] == 'hardware-stylus-precision' for p in posts):
    posts = new_posts + posts
    with open(posts_json, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=4)
    print('Updated posts.json')

# Update llms.txt
with open(llms_txt, 'r', encoding='utf-8') as f:
    llms = f.read()

if 'hardware-stylus-precision' not in llms:
    insert_lines = [
        '- [Beyond the Screen: How Hardware Styluses are Revolutionizing Precision in Digital Teaching](https://learningboard.online/blog/hardware-stylus-precision)\n',
        '- [The Rise of Micro-Lectures: Using Digital Canvases for Snackable Educational Content](https://learningboard.online/blog/micro-lectures-digital-canvases)\n'
    ]
    new_llms = llms.replace('## Legal & Support', ''.join(insert_lines) + '\n## Legal & Support')
    with open(llms_txt, 'w', encoding='utf-8') as f:
        f.write(new_llms)
    print('Updated llms.txt')

print('Running replace_dash.py...')
subprocess.run(['python', 'replace_dash.py'], cwd=dir, check=True)

print('Running build_blog.py...')
subprocess.run(['python', 'build_blog.py'], cwd=dir, check=True)
print('Done!')
