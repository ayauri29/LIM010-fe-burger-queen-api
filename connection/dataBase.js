const { MongoClient } = require('mongodb');

let database;
module.exports = (dbUrl) => {
  const mongoClient = new MongoClient(dbUrl, { useNewUrlParser: true });
  return mongoClient.connect().then((conn) => {
    database = conn.db();
  });
};

module.exports.getDatabase = () => database;
