/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const model = require('../models/user');

module.exports = {
  getUsers: (req, res, next) => {
    next();
    // console.log(req, res, next);
  },
  createUsers: (req, res) => {
    // falta verificar si ya existe el user
    // console.log('?Usuario creado?');
    // console.log(req.body);
    const { email, password } = req.body;
    // console.log(email, password);
    const user = {
      email,
      password: bcrypt.hashSync(password, 10),
      roles: { admin: false },
    };
    model.users().insert(user);
    res.send({ sucess: true });
  },
};
