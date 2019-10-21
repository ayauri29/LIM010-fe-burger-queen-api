/* eslint-disable no-console */
const express = require('express');
const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');


const { port, dbUrl, secret } = config;
const app = express();

let database;

/* mongoClient.connect(dbUrl, { useNewUrlParser: true }, (error, db) => {
  if (error) { console.log('Error while connecting to database: ', error); } else { console.log('Connection established successfully'); }
  database = db.db(); */

// connect db

// perform operations here
app.set('config', config);
app.set('pkg', pkg);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(authMiddleware(secret));

// Registrar rutas
routes(app, (err) => {
  if (err) {
    throw err;
  }

  app.use(errorHandler);

  app.listen(port, () => {
    console.info(`App listening on port ${port}`);
  });
});
// });
