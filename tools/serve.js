/* Serve site/ for local development. No build step, no dependencies.

   Usage: node tools/serve.js [port]      (default 4173)
*/
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'site');
const port = Number(process.argv[2]) || 4173;
const types = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml',
  '.png':'image/png', '.jpg':'image/jpeg', '.ico':'image/x-icon', '.json':'application/json'
};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  let file = path.join(root, url);
  if(!path.extname(file)) file = path.join(file, 'index.html');

  /* never serve outside site/ */
  if(!file.startsWith(root)){ res.writeHead(403).end('forbidden'); return; }

  fs.readFile(file, (err, body) => {
    if(err){ res.writeHead(404, {'content-type':'text/html'}).end('<h1>404</h1><p><a href="/">Runtime City</a></p>'); return; }
    res.writeHead(200, {
      'content-type': types[path.extname(file)] || 'application/octet-stream',
      'cache-control': 'no-store'          // always see the edit you just made
    }).end(body);
  });
}).listen(port, () => console.log(`Runtime City → http://localhost:${port}`));
