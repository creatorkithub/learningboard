// blog.js - Handles loading the manifest and rendering posts

let allPosts = [];
let currentPage = 1;
const postsPerPage = 10;

async function loadBlogCatalog() {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    try {
        const response = await fetch('/blog/data/posts.json');
        if (!response.ok) throw new Error('Failed to load posts manifest');
        const posts = await response.json();

        // Sort by date descending
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        allPosts = posts;

        renderBlogPage(currentPage);

    } catch (err) {
        console.error(err);
        grid.innerHTML = '<div class="loading-spinner">Failed to load posts. Please try again later.</div>';
    }
}

function renderBlogPage(page) {
    const grid = document.getElementById('blog-grid');
    grid.innerHTML = ''; // clear grid

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = allPosts.slice(startIndex, endIndex);

    postsToShow.forEach(post => {
        const dateObj = new Date(post.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const card = document.createElement('a');
        card.href = `/blog/${post.id}`;
        card.className = 'blog-card';

        card.innerHTML = `
            <div class="blog-card-date">${formattedDate}</div>
            <h2 class="blog-card-title">${post.title}</h2>
            <p class="blog-card-excerpt">${post.excerpt}</p>
        `;
        grid.appendChild(card);
    });

    renderPaginationControls();
}

function renderPaginationControls() {
    const container = document.getElementById('pagination-controls');
    if (!container) return;

    const totalPages = Math.ceil(allPosts.length / postsPerPage);
    container.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderBlogPage(currentPage);
            window.scrollTo({ top: document.querySelector('.blog-header').offsetTop, behavior: 'smooth' });
        }
    };

    const info = document.createElement('span');
    info.className = 'pagination-info';
    info.textContent = `Page ${currentPage} of ${totalPages}`;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderBlogPage(currentPage);
            window.scrollTo({ top: document.querySelector('.blog-header').offsetTop, behavior: 'smooth' });
        }
    };

    container.appendChild(prevBtn);
    container.appendChild(info);
    container.appendChild(nextBtn);
}

async function loadBlogPost() {
    const article = document.getElementById('post-content');
    const headerTitle = document.getElementById('post-header-title');
    const headerMeta = document.getElementById('post-header-meta');
    if (!article) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        article.innerHTML = '<p>Post not found.</p>';
        return;
    }

    try {
        // Fetch manifest to get metadata
        const manifestRes = await fetch('/blog/data/posts.json');
        let postMeta = null;
        if (manifestRes.ok) {
            const posts = await manifestRes.json();
            postMeta = posts.find(p => p.id === postId);
        }

        // Fetch markdown content
        const mdRes = await fetch(`/blog/posts/${postId}.md`);
        if (!mdRes.ok) throw new Error('Post content not found');

        let mdText = await mdRes.text();

        // Remove the # Title from markdown if it exists to avoid duplication 
        // since we inject it manually into the header based on manifest context or parse it.
        // Actually, if we just render it, it's fine. We can just use the markdown title.
        const parsedHTML = marked.parse(mdText);
        article.innerHTML = parsedHTML;

        // Optionally set document title
        if (postMeta) {
            document.title = `${postMeta.title} | LearningBoard Blog`;
            // Remove the first H1 from article if we want clean layout, but since we didn't inject a title above, let's keep it in the article.
            // Wait, standard blog layout looks better if H1 is centered and styled nicely.

            // Let's modify the document title based on the first h1
            const h1 = article.querySelector('h1');
            if (h1) {
                document.title = h1.textContent + " | LearningBoard Blog";
                // Optionally extract it to put it into the special post-header div
                h1.style.display = 'none';

                headerTitle.textContent = h1.textContent;
            } else if (postMeta) {
                headerTitle.textContent = postMeta.title;
            }

            if (postMeta) {
                const dateObj = new Date(postMeta.date);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                headerMeta.innerHTML = `<span class="date">${formattedDate}</span> <span>By ${postMeta.author}</span>`;
            }
        }

    } catch (err) {
        console.error(err);
        article.innerHTML = '<div class="loading-spinner">Could not load the requested post.</div>';
    }
}

// Simple router
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('blog-grid')) {
        loadBlogCatalog();
    }
    if (document.getElementById('post-content')) {
        loadBlogPost();
    }
});

// Reactions logic
document.addEventListener('DOMContentLoaded', () => {
    const reactionBtns = document.querySelectorAll('.reaction-btn');
    if (reactionBtns.length > 0) {
        // Use pathname as a simple unique post identifier
        const postId = window.location.pathname.split('/').pop().replace('.html', '');

        reactionBtns.forEach(btn => {
            const reactionType = btn.getAttribute('data-reaction');
            const countSpan = btn.querySelector('.reaction-count');

            // Mock counts: deterministic random based on id length and reaction type
            let count = ((postId.length * 7 + reactionType.length * 3) % 40) + 5;

            const storageKey = `reacted_${postId}_${reactionType}`;
            if (localStorage.getItem(storageKey)) {
                btn.classList.add('reacted');
                count += 1; // User reaction is inherently +1 to the public count
            }

            countSpan.textContent = count;

            btn.addEventListener('click', () => {
                let currentCount = parseInt(countSpan.textContent);
                if (btn.classList.contains('reacted')) {
                    btn.classList.remove('reacted');
                    localStorage.removeItem(storageKey);
                    countSpan.textContent = currentCount - 1;
                } else {
                    btn.classList.add('reacted');
                    localStorage.setItem(storageKey, 'true');
                    countSpan.textContent = currentCount + 1;
                }
            });
        });
    }
});
