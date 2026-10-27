module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: 'orderdesk-jwt-secret',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.DB_PASSWORD || 'admin123',
    database: 'orderdesk',
  },
};
