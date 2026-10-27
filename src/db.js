const { Client } = require('pg');
const config = require('./config');

// Open a fresh connection for every query, then close it.
async function query(text, params) {
  const client = new Client(config.db);
  await client.connect();
  try {
    return await client.query(text, params);
  } finally {
    await client.end();
  }
}

async function close() {}

module.exports = { query, close };
