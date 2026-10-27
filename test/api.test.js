const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/db');
const { USERS, startApp, postJson, login } = require('./helpers');

let api;
let token;

before(async () => {
  api = await startApp();
  token = await login(api.url, USERS.ada);
});

after(async () => {
  await api.close();
  await db.close();
});

test('login returns a token', () => {
  assert.equal(typeof token, 'string');
  assert.ok(token.length > 20);
});

test('fetch order by id', async () => {
  const res = await fetch(`${api.url}/api/orders/1041`, { headers: { authorization: `Bearer ${token}` } });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).id, 1041);
});

test('create order', async () => {
  const res = await postJson(
    `${api.url}/api/orders`,
    { productId: 1, quantity: 2, deliveryAddress: '4 Bodija Market Street, Ibadan' },
    { authorization: `Bearer ${token}` },
  );
  assert.equal(res.status, 201);
  assert.equal((await res.json()).user_id, USERS.ada.id);
});

test('search products', async () => {
  const res = await fetch(`${api.url}/api/search?q=Jollof`);
  assert.equal(res.status, 200);
  assert.ok((await res.json()).results.length > 0);
});
