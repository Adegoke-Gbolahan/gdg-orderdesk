const { createApp } = require('./app');
const config = require('./config');

createApp().listen(config.port, () => {
  console.log(`OrderDesk listening on :${config.port}`);
});
