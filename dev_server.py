import http.server
import os

PORT = 8000

class GitHubPagesHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Prevent caching in dev mode so changes are immediately visible
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def translate_path(self, path):
        # Base translation
        filepath = super().translate_path(path)
        
        # If the requested path is not found directly, try appending .html
        if not os.path.exists(filepath):
            if os.path.exists(filepath + '.html'):
                return filepath + '.html'
        
        return filepath

if __name__ == '__main__':
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    with http.server.ThreadingHTTPServer(("", PORT), GitHubPagesHandler) as httpd:
        print(f"Serving multithreaded at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
