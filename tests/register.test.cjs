const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const ts = require('typescript');

// Run the real handler against the real migrations without a production service.
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(outputText, filename);
};
const { handleRegister } = require('../src/routes/register.ts');

function setup(t) {
  const db = new DatabaseSync(':memory:');
  const directory = path.join(__dirname, '../migrations');
  for (const file of fs.readdirSync(directory).filter(f => f.endsWith('.sql')).sort()) {
    db.exec(fs.readFileSync(path.join(directory, file), 'utf8'));
  }
  t.after(() => db.close());
  const env = {
    DB: { prepare(sql) { return { bind(...values) { return { async run() {
      const result = db.prepare(sql).run(...values);
      return { meta: { last_row_id: Number(result.lastInsertRowid) } };
    } }; } }; } },
    SITE_URL: 'http://localhost', ADMIN_EMAIL: 'qa@example.test',
  };
  const context = { waitUntil(promise) { promise.catch(() => {}); } };
  return { db, async submit(body, method = 'POST') {
    return handleRegister(new Request('http://localhost/api/register', {
      method, headers: { 'Content-Type': 'application/json' },
      ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
    }), env, context);
  } };
}
function application(overrides = {}) {
  return { nombre: 'Persona de prueba', email: 'qa@example.test', whatsapp: '+52 999 123 4567',
    linkedin: 'https://linkedin.com/in/prueba', motivacion: 'Aprender y compartir con la comunidad.',
    contrato: true, ...overrides };
}

test('saves a pending application and keeps public directory consent optional', async t => {
  const { db, submit } = setup(t);
  const response = await submit(application({ nombre: '  Persona de prueba  ', email: ' QA@EXAMPLE.TEST ' }));
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.ok, true);
  const row = db.prepare('SELECT * FROM member_applications WHERE id = ?').get(result.id);
  assert.equal(row.nombre, 'Persona de prueba');
  assert.equal(row.email, 'qa@example.test');
  assert.equal(row.status, 'pending');
  assert.equal(row.acepta_contrato, 1);
  assert.equal(row.directorio_publico, 0);
});

test('stores explicit directory consent and referral', async t => {
  const { db, submit } = setup(t);
  assert.equal((await submit(application({ directorio: true, referred_by: 'Comunidad' }))).status, 201);
  const row = db.prepare('SELECT directorio_publico, referred_by FROM member_applications').get();
  assert.equal(row.directorio_publico, 1);
  assert.equal(row.referred_by, 'Comunidad');
});

test('duplicate emails return 409 without creating a second application', async t => {
  const { db, submit } = setup(t);
  assert.equal((await submit(application())).status, 201);
  const response = await submit(application({ email: 'QA@EXAMPLE.TEST' }));
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /Ya existe/);
  assert.equal(db.prepare('SELECT count(*) AS count FROM member_applications').get().count, 1);
});

test('rejects malformed and invalid submissions before writing to the database', async t => {
  const cases = [null, [], 'invalid', application({ nombre: '   ' }), application({ nombre: 42 }),
    application({ email: 'invalid' }), application({ whatsapp: '123' }),
    application({ whatsapp: '-------' }), application({ linkedin: 'javascript:alert(1)' }),
    application({ github: 'not-a-url' }), application({ motivacion: 'x'.repeat(3001) }),
    application({ contrato: false }), application({ contrato: 'true' }),
    application({ directorio: 'false' }), application({ origen: 'invalid' })];
  const { db, submit } = setup(t);
  for (const body of cases) {
    const response = await submit(body);
    assert.equal(response.status, 400, JSON.stringify(body));
    assert.equal(typeof (await response.json()).error, 'string');
  }
  assert.equal(db.prepare('SELECT count(*) AS count FROM member_applications').get().count, 0);
});

test('rejects invalid JSON and unsupported methods', async t => {
  const { submit } = setup(t);
  assert.equal((await submit(null, 'GET')).status, 405);
  const response = await handleRegister(new Request('http://localhost/api/register', {
    method: 'POST', body: '{broken',
  }), {}, {});
  assert.equal(response.status, 400);
});

test('reports storage errors without falsely confirming receipt', async t => {
  const { submit, db } = setup(t);
  db.exec('DROP TABLE member_applications');
  const response = await submit(application());
  assert.equal(response.status, 500);
  assert.equal((await response.json()).ok, undefined);
});
