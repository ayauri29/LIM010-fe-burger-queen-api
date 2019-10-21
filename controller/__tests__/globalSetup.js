const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');

module.exports = () => new Promise((resolve, reject) => {
  if (process.env.REMOTE_URL) {
    console.info(`Running tests on remote server ${process.env.REMOTE_URL}`);
    return resolve();
  }
  const mongod = new MongoMemoryServer();
  // TODO: Configurar DB de tests

  mongod.getConnectionString().then((url) => {
    console.info('\nMongo server ', url);
    process.env.DB_URL = url;
    console.info('Staring local server...');
  });
});
