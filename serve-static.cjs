const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  let url = req.url;
  
  // Redirect root to pages/index.html
  if (url === '/' || url === '') {
    res.writeHead(302, { 'Location': '/pages/index.html' });
    res.end();
    return;
  }
  
  // Default to index.html for other root paths
  if (url === '/index.html' && !url.startsWith('/pages/')) {
    res.writeHead(302, { 'Location': '/pages/index.html' });
    res.end();
    return;
  }
  
  // Add .html extension if no extension
  if (!path.extname(url) && !url.includes('.')) {
    url = url + '.html';
  }
  
  let filePath;
  
  // Check if it's a pages request
  if (url.startsWith('/pages/')) {
    filePath = path.join(__dirname, url.substring(1)); // Remove leading /
  }
  // Check if it's a static page request
  else if (url.endsWith('.html')) {
    filePath = path.join(__dirname, 'static', url);
  }
  // CSS files from pages
  else if (url.startsWith('/pages/css/')) {
    filePath = path.join(__dirname, url.substring(1));
  }
  // CSS files from static
  else if (url.startsWith('/css/')) {
    filePath = path.join(__dirname, 'static', url);
  }
  // JS files from pages
  else if (url.startsWith('/pages/js/')) {
    filePath = path.join(__dirname, url.substring(1));
  }
  // JS files from static
  else if (url.startsWith('/js/')) {
    filePath = path.join(__dirname, 'static', url);
  }
  // Images
  else if (url.startsWith('/images/')) {
    filePath = path.join(__dirname, 'public', url);
  }
  // Documents
  else if (url.startsWith('/documents/')) {
    filePath = path.join(__dirname, 'public', url);
  }
  // Default fallback
  else {
    filePath = path.join(__dirname, 'static', url);
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found - try to serve index.html for SPA-like behavior
        fs.readFile(path.join(__dirname, 'static', 'index.html'), (err2, indexContent) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Pagina niet gevonden</h1>');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🏫 VBS Sint-Maarten Website Server                         ║
║                                                              ║
║   Server draait op: http://localhost:${PORT}                   ║
║                                                              ║
║   Beschikbare pagina's:                                      ║
║   • Home:          http://localhost:${PORT}/                   ║
║   • Onze School:   http://localhost:${PORT}/about.html         ║
║   • Inschrijven:   http://localhost:${PORT}/enroll.html        ║
║   • Team:          http://localhost:${PORT}/team.html          ║
║   • Nieuws:        http://localhost:${PORT}/news.html          ║
║   • Agenda:        http://localhost:${PORT}/calendar.html      ║
║   • Info:          http://localhost:${PORT}/info.html          ║
║   • Ouderwerkgroep: http://localhost:${PORT}/ouderwerkgroep.html║
║   • Foto's:        http://localhost:${PORT}/gallery.html       ║
║   • Contact:       http://localhost:${PORT}/contact.html       ║
║   • Belevingsbox:  http://localhost:${PORT}/box.html           ║
║                                                              ║
║   Druk Ctrl+C om te stoppen                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

