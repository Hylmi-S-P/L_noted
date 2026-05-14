const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname);
const PORT = process.env.PORT || 5173;

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  // Map root to the UI reference folder index if available
  if (urlPath === '/' || urlPath === '/index.html') {
    const index = path.join(ROOT, 'refrence ui_ux', 'dashboard_l_note', 'code.html');
    return sendFile(res, index, 'text/html; charset=utf-8');
  }

  // Serve files under the refrence ui_ux directory
  const candidate = path.join(ROOT, urlPath.replace(/^\//, ''));
  if (candidate.startsWith(path.join(ROOT, 'refrence ui_ux')) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    const ext = path.extname(candidate).toLowerCase();
    const mime = {
      '.html': 'text/html; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.css': 'text/css',
      '.js': 'application/javascript'
    }[ext] || 'application/octet-stream';
    return sendFile(res, candidate, mime);
  }

  // Fallback: serve README files for workspace overview
  const readme = path.join(ROOT, 'lnote-frontend', 'README.md');
  if (fs.existsSync(readme)) return sendFile(res, readme, 'text/markdown; charset=utf-8');

  res.writeHead(404);
  res.end('Not found');
}).listen(PORT, () => {
  console.log(`Production server running on http://localhost:${PORT}`);
});
