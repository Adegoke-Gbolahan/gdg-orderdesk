const { createApp } = require('../src/app');

// Seeded workshop accounts (see db/01-schema.sql).
const USERS = {
  ada: { id: 7, email: 'ada@orderdesk.test', password: 'ada-password' },
  admin: { id: 1, email: 'admin@orderdesk.test', password: 'admin-password' },
};

async function startApp() {
  const server = await new Promise((resolve) => {
    const s = createApp().listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  };
}

function postJson(url, body, headers = {}) {
  return fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

async function login(baseUrl, user) {
  const res = await postJson(`${baseUrl}/api/login`, { email: user.email, password: user.password });
  if (res.status !== 200) throw new Error(`login failed for ${user.email}: ${res.status}`);
  return (await res.json()).token;
}

module.exports = { USERS, startApp, postJson, login };
