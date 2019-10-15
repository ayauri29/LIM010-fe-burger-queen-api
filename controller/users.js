/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const model = require('../models/user');

module.exports = {
  getUsers: (req, res, next) => {
    model.users().find().toArray((error, users) => {
      if (error) {
        next(404);
        throw error;
      } else {
        res.send(users);
      }
    });
  },
  createUsers: (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      next(400);
    } else if (email.indexOf('@') === -1) {
      next(400);
    } else if (password.length < 5) {
      next(400);
    }

    const user = {
      email,
      password: bcrypt.hashSync(password, 10),
      roles: { admin: false },
    };
    // falta verificar si ya existe el user
    model.users().findOne({ email }).then((doc) => {
      if (!doc) {
        model.users().insertOne(user);
        res.send({ sucess: true });
        console.log('Nuevo usuario insertado');
      } else {
        next(403);
      }
    });
  },
};
