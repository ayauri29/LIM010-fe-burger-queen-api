/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const model = require('../models/user');

module.exports = {
  getUsers: (req, res, next) => {
    next();
    // console.log(req, res, next);
  },
  createUsers: (req, res, next) => {
    const { email, password } = req.body;

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
        console.log('fiiiiiiiiggggggn');
      } else {
        next(403);
      }
    });
  },
};
