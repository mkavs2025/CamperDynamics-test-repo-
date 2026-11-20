import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5500;
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const STUDIO_DIR = path.resolve(__dirname, 'studio');
const CATALOG_PATH = path.resolve(STUDIO_DIR, 'catalog.json');
const INTERIOR_PATH = path.resolve(STUDIO_DIR, 'interior-options.json');
const DATA_DIR = path.resolve(__dirname, 'data');
const BUILDS_FILE = path.resolve(DATA_DIR, 'builds.json');

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
const interiorOptions = JSON.parse(fs.readFileSync(INTERIOR_PATH, 'utf-8'));

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BUILDS_FILE)) fs.writeFileSync(BUILDS_FILE, JSON.stringify({ builds: [], enquiries: [] }, null, 2));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};

// Live reload SSE clients
const clients = new Set();
const triggerReload = (filename) => {
  if (filename) {
    for (const res of clients) {
      res.write(`data: reload\n\n`);
    }
  }
};
fs.watch(STUDIO_DIR, { recursive: true }, (event, filename) => triggerReload(filename));
if (fs.existsSync(PUBLIC_DIR)) {
  fs.watch(PUBLIC_DIR, { recursive: true }, (event, filename) => triggerReload(filename));
}

const LIVE_RELOAD_SNIPPET = `
<script>
(() => {
  const evtSource = new EventSource('/__livereload');
  evtSource.onmessage = (e) => {
    if (e.data === 'reload') {
      console.log('[LiveServer] Reloading page...');
      location.reload();
    }
  };
})();
</script>
`;

function estimatePrice(raw) {
  const modelId = raw?.model || 'basecamp';
  const model = catalog.models.find(m => m.id === modelId) || catalog.models[0];
  const items = [{ id: model.id, name: `${model.name} conversion`, price: model.price }];

  for (const [key, group] of [['color', 'colors'], ['wood', 'woods'], ['fabric', 'fabrics']]) {
    const val = raw?.[key];
    const option = catalog[group]?.find(x => x.id === val);
    if (option && option.price) {
      items.push({ id: key, name: option.name, price: option.price });
    }
  }

  const addons = Array.isArray(raw?.addons) ? raw.addons : [];
  for (const addonId of addons) {
    const option = catalog.addons?.find(x => x.id === addonId);
    if (option) {
      items.push({ id: option.id, name: option.name, price: option.price });
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const tax = Math.round(subtotal * (catalog.taxRate || 0.18));
  return {
    state: raw,
    items,
    subtotal,
    tax,
    total: subtotal + tax,
    currency: 'INR',
    priceStatus: catalog.priceStatus
  };
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // SSE Live Reload endpoint
  if (pathname === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write('\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  // API Health
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, storage: 'json', priceVersion: catalog.version }));
    return;
  }

  // API Catalog
  if (pathname === '/api/catalog') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(catalog));
    return;
  }

  // API Estimate & Builds
  if (req.method === 'POST' && pathname === '/api/estimate') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const est = estimatePrice(data.config || {});
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(est));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/builds') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const est = estimatePrice(data.config || {});
        const id = 'BUILD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        const db = JSON.parse(fs.readFileSync(BUILDS_FILE, 'utf-8'));
        db.builds.push({ id, estimate: est, createdAt: new Date().toISOString() });
        fs.writeFileSync(BUILDS_FILE, JSON.stringify(db, null, 2));
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id, estimate: est }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/quotes') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const est = estimatePrice(data.config || {});
        const id = 'QUOTE-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        const db = JSON.parse(fs.readFileSync(BUILDS_FILE, 'utf-8'));
        db.enquiries.push({ id, contact: data.contact, estimate: est, createdAt: new Date().toISOString() });
        fs.writeFileSync(BUILDS_FILE, JSON.stringify(db, null, 2));
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id, estimate: est, status: 'saved_not_sent' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Determine which file to serve
  let decodedPath = decodeURIComponent(pathname);
  let filePath = '';

  if (decodedPath === '/' || decodedPath === '/index.html') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  } else if (decodedPath === '/favicon.svg') {
    filePath = path.join(PUBLIC_DIR, 'favicon.svg');
  } else if (decodedPath.startsWith('/portal/')) {
    filePath = path.join(PUBLIC_DIR, decodedPath);
  } else if (decodedPath.startsWith('/studio/')) {
    filePath = path.join(STUDIO_DIR, decodedPath.replace(/^\/studio\//, ''));
  } else {
    // Check in studio directory first, then public directory
    const studioCandidate = path.join(STUDIO_DIR, decodedPath);
    const publicCandidate = path.join(PUBLIC_DIR, decodedPath);
    if (fs.existsSync(studioCandidate) && fs.statSync(studioCandidate).isFile()) {
      filePath = studioCandidate;
    } else if (fs.existsSync(publicCandidate) && fs.statSync(publicCandidate).isFile()) {
      filePath = publicCandidate;
    } else {
      filePath = studioCandidate; // Will trigger 404
    }
  }

  // Security check: ensure path is within workspace
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + pathname);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    if (ext === '.html') {
      fs.readFile(filePath, 'utf-8', (readErr, content) => {
        if (readErr) {
          res.writeHead(500);
          res.end('Server Error');
          return;
        }
        const injected = content.includes('</body>')
          ? content.replace('</body>', `${LIVE_RELOAD_SNIPPET}</body>`)
          : content + LIVE_RELOAD_SNIPPET;
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff'
        });
        res.end(injected);
      });
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n==================================================`);
  console.log(`🚀 Camper Dynamics Live Server running at: ${url}`);
  console.log(`🏠 Home / Landing Page: ${url}/`);
  console.log(`🛠️ 3D Studio Configurator: ${url}/studio/index.html`);
  console.log(`🔄 Live Reload: Active for /studio and /public`);
  console.log(`==================================================\n`);

  // Open default browser on Windows
  exec(`start ${url}`);
});
