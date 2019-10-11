/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const jwt = require('jsonwebtoken');
const config = require('../config');
const model = require('../models/user');

const { secret, adminEmail, adminPassword } = config;

/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   * @path {POST} /auth
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @response {Object} resp
   * @response {String} resp.token Token a usar para los requests sucesivos
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @auth No requiere autenticación
   */
  app.post('/auth', (req, resp, next) => {
    console.log('pasa a auth', 'hace el post del usuario/login');
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(400);
      }

      model.users().findOne({ email }).then((doc) => {
        console.log('soy doc', doc);
        // checking to make sure the user entered the correct username/password combo
        if (email === adminEmail && password === adminPassword) {
        // if user log in success, generate a JWT token for the user with a secret key
          jwt.sign({ uid: doc._id }, secret, { expiresIn: '1h' }, (err, token) => {
            if (err) { console.log('ERROR!', err); }
            return resp.status(200).send({ token });
          });
        } else {
          console.log('ERROR: Could not log in');
        }
      });
    } catch (error) {
      console.log(error);
    }

    /*     model.users().findOne({ email }).then((doc) => {
        console.log('soy doc', doc);
        bcrypt.compare(password, doc.password).then((passwordIsTrue) => {
          // checking to make sure the user entered the correct username/password combo
          if (email === doc.email && passwordIsTrue) {
          // if user log in success, generate a JWT token for the user with a secret key
            jwt.sign({ uid: doc._id }, secret, { expiresIn: '1h' }, (err, token) => {
              if (err) { console.log('ERROR!', err); }
              return resp.status(200).send({ token });
            });
          } else {
            console.log('ERROR: Could not log in');
          }
        });
      }); */
  });

  return nextMain();
};
