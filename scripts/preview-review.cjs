// Local preview of the exact static build and API entry point used by Vercel.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(outputText, filename);
};
const api = require('../api/review.ts').default;
const root = path.resolve(__dirname, '../dist/review');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8' };

async function respond(req) {
  const url = new URL(req.url, 'http://127.0.0.1:8788');
  if (url.pathname.startsWith('/api/')) {
    const chunks = [];
    let length = 0;
    for await (const chunk of req) {
      length += chunk.length;
      if (length > 65536) return new Response('Request too large', { status: 413 });
      chunks.push(chunk);
    }
    // Exercise the same query parameter mapping as vercel.json.
    if (url.pathname !== '/api/review') {
      url.searchParams.set('reviewPath', url.pathname.slice('/api/'.length));
      url.pathname = '/api/review';
    }
    return api.fetch(new Request(url, {
      method: req.method, headers: req.headers,
      ...(!['GET', 'HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}),
    }));
  }
  const pathname = decodeURIComponent(url.pathname);
  let file = path.resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) return new Response('Forbidden', { status: 403 });
  if (pathname.endsWith('/')) file = path.join(file, 'index.html');
  else if (!path.extname(file)) file += '.html';
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return new Response('Not found', { status: 404 });
  return new Response(fs.readFileSync(file), {
    headers: { 'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
  });
}

http.createServer(async (req, res) => {
  try {
    const response = await respond(req);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500);
    res.end('Local review error');
  }
}).listen(8788, '127.0.0.1', () => console.log('Review: http://127.0.0.1:8788 (no production services)'));
