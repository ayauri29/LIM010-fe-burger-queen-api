/* eslint-disable no-console */
const jwt = require('jsonwebtoken');
const config = require('../config');

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
    console.log('algo ahí');

    try {
      const { email, password } = req.body;
      console.log('TCL:  email, password', email, password);

      if (!email || !password) {
        return next(400);
      }

      // checking to make sure the user entered the correct username/password combo
      if (email === adminEmail && password === adminPassword) {
        // if user log in success, generate a JWT token for the user with a secret key
        jwt.sign({ uid: email }, secret, { expiresIn: '1h' }, (err, token) => {
          if (err) { console.log('ERROR!', err); }
          return resp.status(200).send({ token });
        });
      }
      console.log('ERROR: Could not log in');
    } catch (error) {
      console.log(error);
    }
  });

  return nextMain();
};
