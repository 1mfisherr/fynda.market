// Serves design/ read-only on localhost:4400, so a mockup opens in the preview pane (launch.json "design").
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([\\/])+/, '');
  if (path.startsWith('..')) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(join(root, path || 'index.html'));
    res.writeHead(200, { 'content-type': path.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end('not found'); }
}).listen(4400, '127.0.0.1');
