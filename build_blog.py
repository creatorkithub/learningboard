import json
import os
import markdown

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_DIR = os.path.join(BASE_DIR, 'blog')
DATA_FILE = os.path.join(BLOG_DIR, 'data', 'posts.json')
TEMPLATE_FILE = os.path.join(BLOG_DIR, 'template.html')
SITEMAP_FILE = os.path.join(BASE_DIR, 'sitemap.xml')

def format_date(date_str):
    from datetime import datetime
    d = datetime.strptime(date_str, '%Y-%m-%d')
    # Windows doesn't support %-d for stripping zero, so we use string manipulation
    return d.strftime('%B %d, %Y').replace(' 0', ' ')

def main():
    print("Loading posts manifest...")
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            posts = json.load(f)
    except FileNotFoundError:
        print("Error: posts.json not found!")
        return

    print("Loading html template...")
    with open(TEMPLATE_FILE, 'r', encoding='utf-8') as f:
        template = f.read()

    print("Loading sitemap.xml...")
    with open(SITEMAP_FILE, 'r', encoding='utf-8') as f:
        sitemap = f.read()

    new_urls = []
    feed_items = []
    llms_full_content = ["# LearningBoard - Full LLM Index\n\nThis file contains the complete textual content of LearningBoard's primary pages and blog posts.\n\n"]

    for post in posts:
        post_id = post['id']
        md_file = os.path.join(BLOG_DIR, 'posts', f'{post_id}.md')
        out_file = os.path.join(BLOG_DIR, f'{post_id}.html')
        
        print(f"Building {post_id}.html...")
        
        with open(md_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Strip the first H1 tag (# Title) from the markdown if it exists
        # since template.html already injects the JSON Title into an SEO-optimized H1
        if lines and lines[0].startswith('# '):
            lines = lines[1:]
            
        md_content = "".join(lines)
        
        # Convert markdown to html using Python Markdown
        html_content = markdown.markdown(md_content, extensions=['fenced_code', 'tables'])
        
        # We need to map placeholders strictly.
        page = template
        page = page.replace('{{TITLE}}', post['title'])
        page = page.replace('{{META_DESCRIPTION}}', post.get('excerpt', '').replace('"', '&quot;'))
        page = page.replace('{{SLUG}}', post_id)
        page = page.replace('{{AUTHOR}}', post.get('author', 'LearningBoard Team'))
        page = page.replace('{{DATE}}', format_date(post['date']))
        
        tags = post.get('tags', [])
        tags_html = "".join([f'<span class="tag">#{tag}</span>' for tag in tags])
        page = page.replace('{{TAGS_HTML}}', tags_html)
        
        page = page.replace('{{CONTENT}}', html_content)
        
        with open(out_file, 'w', encoding='utf-8') as f:
            f.write(page)
            
        # Update Sitemap if not present
        url_loc = f"<loc>https://learningboard.online/blog/{post_id}</loc>"
        if url_loc not in sitemap:
            new_urls.append(f"""  <url>
    <loc>https://learningboard.online/blog/{post_id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>""")

        # Add to feed items
        feed_items.append(f"""    <item>
      <title>{post['title']}</title>
      <link>https://learningboard.online/blog/{post_id}</link>
      <description>{post.get('excerpt', '')}</description>
      <pubDate>{post['date']}</pubDate>
      <guid>https://learningboard.online/blog/{post_id}</guid>
    </item>""")

        # Add to llms-full
        llms_full_content.append(f"## {post['title']}\n\n{md_content}\n\n---\n\n")

    if new_urls:
        print(f"Adding {len(new_urls)} new URLs to sitemap.xml...")
        sitemap = sitemap.replace('</urlset>', '\n'.join(new_urls) + '\n</urlset>')
        with open(SITEMAP_FILE, 'w', encoding='utf-8') as f:
            f.write(sitemap)

    # Generate feed.xml
    print("Generating feed.xml...")
    rss_feed = f'''<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>LearningBoard Blog</title>
    <link>https://learningboard.online/blog/</link>
    <description>Articles and tutorials for digital teaching and whiteboarding.</description>
{chr(10).join(feed_items)}
  </channel>
</rss>'''
    with open(os.path.join(BASE_DIR, 'feed.xml'), 'w', encoding='utf-8') as f:
        f.write(rss_feed)
        
    # Generate llms-full.txt
    print("Generating llms-full.txt...")
    with open(os.path.join(BASE_DIR, 'llms-full.txt'), 'w', encoding='utf-8') as f:
        f.write("".join(llms_full_content))
            
    print("Static build complete!")

if __name__ == '__main__':
    main()
