// Each mission is proven by a failing-then-passing test, not by eye.
// Run: npm run test:missions
const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const db = require('../src/db');
const { USERS, startApp, postJson, login } = require('./helpers');

const read = (file) => {
  const full = path.join(__dirname, '..', file);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
};

after(() => db.close());

describe('Mission 01 · fix authorization', () => {
  let api;
  before(async () => (api = await startApp()));
  after(() => api.close());

  test("user 7 cannot read user 3's order 1043", async () => {
    const token = await login(api.url, USERS.ada);
    const res = await fetch(`${api.url}/api/orders/1043`, { headers: { authorization: `Bearer ${token}` } });
    assert.equal(res.status, 403);
  });
});

describe('Mission 02 · remove secrets', () => {
  test('no database password in the Dockerfile, compose file or config', () => {
    for (const file of ['Dockerfile', 'docker-compose.yml', 'src/config.js']) {
      assert.doesNotMatch(read(file), /admin123/, `${file} still contains the database password`);
    }
    assert.doesNotMatch(read('Dockerfile'), /^ENV\s+\S*(PASSWORD|SECRET)/im, 'secrets are baked into the image');
  });

  test('the JWT secret comes from the environment', () => {
    assert.doesNotMatch(read('src/config.js'), /jwtSecret:\s*['"`]/, 'jwtSecret is hardcoded');
  });

  test('the image build ignores .env and .git', () => {
    const ignore = read('.dockerignore');
    assert.match(ignore, /^\.env/m);
    assert.match(ignore, /^\.git/m);
  });
});

describe('Mission 03 · stop injection', () => {
  let api;
  before(async () => (api = await startApp()));
  after(() => api.close());

  test("admin'-- does not log you in", async () => {
    const res = await postJson(`${api.url}/api/login`, { email: "admin@orderdesk.test'--", password: 'anything' });
    assert.ok([400, 401].includes(res.status), `expected 400 or 401, got ${res.status}`);
  });

  test('a quote in the search box is just text', async () => {
    const res = await fetch(`${api.url}/api/search?q=${encodeURIComponent("'")}`);
    assert.equal(res.status, 200);
  });

  test('errors do not leak stack traces', async () => {
    const res = await fetch(`${api.url}/api/orders/not-a-number`, {
      headers: { authorization: `Bearer ${await login(api.url, USERS.ada)}` },
    });
    assert.doesNotMatch(await res.text(), /at .*\.js:\d+/);
  });
});

describe('Mission 04 · add rate limits', () => {
  let api;
  before(async () => (api = await startApp()));
  after(() => api.close());

  test('the sixth login attempt in a minute gets a 429', async () => {
    const statuses = [];
    for (let i = 0; i < 6; i++) {
      const res = await postJson(`${api.url}/api/login`, { email: USERS.ada.email, password: 'wrong-password' });
      statuses.push(res.status);
    }
    assert.deepEqual(statuses.slice(0, 5), [401, 401, 401, 401, 401]);
    assert.equal(statuses[5], 429);
  });
});

describe('Mission 05 · survive a kill', () => {
  let api;
  before(async () => (api = await startApp()));
  after(() => api.close());

  test('a readiness check exists', async () => {
    const res = await fetch(`${api.url}/health/ready`);
    assert.equal(res.status, 200);
  });

  test('the readiness check touches the database', () => {
    assert.match(read('src/app.js'), /\/health\/ready[\s\S]{0,300}SELECT 1/);
  });

  test('the server shuts down cleanly on SIGTERM', () => {
    assert.match(read('src/server.js'), /SIGTERM/);
  });

  test('compose restarts the API and health-checks it', () => {
    const compose = read('docker-compose.yml');
    assert.match(compose, /restart:\s*(unless-stopped|always|on-failure)/);
    assert.match(compose, /healthcheck:/);
  });
});

describe('Mission 06 · wire the pipeline', () => {
  const ci = read('.github/workflows/ci.yml');

  for (const [check, pattern] of [
    ['unit tests', /npm test/],
    ['SAST (Semgrep)', /semgrep/i],
    ['dependency audit', /npm audit/],
    ['image scan (Trivy)', /trivy/i],
  ]) {
    test(`the pipeline runs ${check}`, () => assert.match(ci, pattern));
  }
});
