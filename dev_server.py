import http.server
import socketserver
import os

PORT = 8000

class GitHubPagesHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Base translation
        filepath = super().translate_path(path)
        
        # If the requested path is not found directly, try appending .html
        if not os.path.exists(filepath):
            if os.path.exists(filepath + '.html'):
                return filepath + '.html'
        
        return filepath

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), GitHubPagesHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
