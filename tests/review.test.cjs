const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
};
const api = require('../api/review.ts').default;
const { reviewEvents } = require('../src/review/handler.ts');
const root = path.resolve(__dirname, '..');
function request(route, body, method = body === undefined ? 'GET' : 'POST') {
  return new Request('https://review.example.test' + route, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
const application = { nombre: 'Review Person', email: 'review@example.test',
  whatsapp: '+52 999 000 0000', linkedin: 'https://linkedin.com/in/review',
  motivacion: 'Testing this review form.', contrato: true };

test('review submissions validate without storage, outbound requests, or reflecting contact data', async t => {
  let outbound = 0;
  const originalFetch = global.fetch;
  global.fetch = async () => { outbound++; throw new Error('Outbound request forbidden'); };
  t.after(() => { global.fetch = originalFetch; });
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await api.fetch(request('/api/register', application));
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.review, true);
    assert.equal(body.stored, false);
    assert.equal(body.id, undefined);
    assert.match(body.message, /No se guardaron/);
    assert.ok(!JSON.stringify(body).includes(application.email));
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
  assert.equal(outbound, 0);
  assert.ok(!Object.keys(require.cache).some(file => /src[\\/]routes[\\/](register|admin)\.ts$/.test(file)));
});

test('invalid review registrations return errors rather than a simulated success', async () => {
  for (const body of [null, [], {}, { ...application, email: 'invalid' }, { ...application, contrato: false }]) {
    const response = await api.fetch(request('/api/register', body));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).ok, undefined);
  }
  const response = await api.fetch(new Request('https://review.example.test/api/register', { method: 'POST', body: '{bad' }));
  assert.equal(response.status, 400);
});

test('Vercel rewrite and direct paths produce the same review API responses', async () => {
  const direct = await api.fetch(request('/api/initiatives?track=Eventos'));
  const rewritten = await api.fetch(request('/api/review?reviewPath=initiatives&track=Eventos'));
  assert.deepEqual(await direct.json(), await rewritten.json());
  const form = await api.fetch(request('/api/review?reviewPath=register', application));
  assert.equal((await form.json()).ok, true);
  const scrape = await api.fetch(request('/api/review?reviewPath=events/scrape', { url: 'https://example.test' }));
  assert.equal(scrape.status, 422);
});

test('fixtures fill the review without representing live events or exposing contact details', async () => {
  const now = new Date('2040-01-01T12:00:00Z');
  const events = reviewEvents(now);
  assert.equal(events.length, 3);
  for (const event of events) {
    assert.ok(new Date(event.date) > now);
    assert.match(event.title, /Ejemplo/);
    assert.equal(event.source_url, '');
  }
  const members = (await (await api.fetch(request('/api/members'))).json()).members;
  assert.ok(members.length > 0);
  assert.ok(members.every(member => member.public_consent && !('email' in member)));
  const filtered = (await (await api.fetch(request('/api/initiatives?track=Eventos'))).json()).initiatives;
  assert.ok(filtered.length > 0);
  assert.ok(filtered.every(item => item.track === 'Eventos' && item.tagline && item.description));
  const metrics = await (await api.fetch(request('/api/metrics'))).json();
  assert.equal(metrics.totalMembers, members.length);
  assert.ok(metrics.membersByOrigin);
});

test('admin routes and unsupported operations cannot reach production', async () => {
  const admin = new Request('https://review.example.test/api/review?reviewPath=admin/applications', {
    headers: { 'Cf-Access-Authenticated-User-Email': 'forged@example.test' },
  });
  assert.equal((await api.fetch(admin)).status, 404);
  assert.equal((await api.fetch(request('/api/events', undefined, 'DELETE'))).status, 405);
  assert.equal((await api.fetch(request('/api/unknown'))).status, 404);
  assert.equal((await api.fetch(request('/api/events', { 'título': 'Evento de prueba', fecha: '2040-01-02T18:00' }))).status, 200);
});

test('review build labels every page, omits admin, and leaves Cloudflare sources unchanged', () => {
  const source = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
  const wrangler = fs.readFileSync(path.join(root, 'wrangler.toml'), 'utf8');
  execFileSync(process.execPath, [path.join(root, 'scripts/build-review.mjs')], { cwd: root });
  const out = path.join(root, 'dist/review');
  for (const file of fs.readdirSync(out).filter(name => name.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(out, file), 'utf8');
    assert.match(html, /Vista de revisión/);
    assert.match(html, /data-review="true"/);
    assert.match(html, /noindex/);
  }
  assert.equal(fs.existsSync(path.join(out, 'admin')), false);
  assert.equal(fs.existsSync(path.join(out, 'wrangler.toml')), false);
  assert.match(fs.readFileSync(path.join(out, 'robots.txt'), 'utf8'), /Disallow: \//);
  assert.equal(fs.readFileSync(path.join(root, 'public/index.html'), 'utf8'), source);
  assert.equal(fs.readFileSync(path.join(root, 'wrangler.toml'), 'utf8'), wrangler);
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.outputDirectory, 'dist/review');
  assert.ok(config.rewrites.every(rule => rule.destination.startsWith('/api/review')));
});
