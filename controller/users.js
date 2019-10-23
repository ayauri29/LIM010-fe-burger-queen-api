/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');
const model = require('../models/user');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

const getUserOrId = (reqParam) => {
  let query;
  if (reqParam.indexOf('@') === -1) {
    query = { _id: new ObjectID(reqParam) };
  } else {
    query = { email: reqParam };
  }
  return query;
};

module.exports = {
  getUsers: (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    model.users().countDocuments((err, count) => {
      const numberPages = Math.ceil(count / limit);
      const skip = (numberPages === 0) ? 1 : (numberPages - 1) * limit;

      model.users().find().skip(skip).limit(limit)
        .toArray((error, users) => {
          if (!error) {
            const firstPage = `</users?limit=${limit}&page=${1}>; rel="first"`;
            const prevPage = `</users?limit=${limit}&page=${page - 1}>; rel="prev"`;
            const nextPage = `</users?limit=${limit}&page=${page + 1}>; rel="next"`;
            const lastPage = `</users?limit=${limit}&page=${numberPages}>; rel="last"`;

            res.setHeader('link', `${firstPage}, ${prevPage}, ${nextPage}, ${lastPage}`);
            res.send(users);
          }
        });
    });

    // skip = (numero de paginas - 1)*limit;
    // count / limit = paginas
    // link => url query con prev, next
    // res.headers()
  },
  createUsers: (req, res, next) => {
    const { email, password, roles } = req.body;

    if (!email || !password) {
      return next(400);
    } if (email.indexOf('@') === -1) {
      return next(400);
    } if (password.length <= 3) {
      return next(400);
    }
    let newRol;
    if (!roles) {
      newRol = false;
    } else {
      newRol = roles.admin;
    }
    const user = {
      email,
      password: bcrypt.hashSync(password, 10),
      roles: { admin: newRol },
    };
    model.users().findOne({ email }).then((doc) => {
      if (doc) {
        next(403);
      }
      model.users().insertOne(user, (error, result) => {
        if (!error) {
          res.send({
            _id: result.ops[0]._id,
            email: result.ops[0].email,
            roles: result.ops[0].roles,
          });
        }
      });
    });
  },
  getUsersById: (req, res, next) => {
    const reqParam = req.params.uid;
    const query = getUserOrId(reqParam);

    if (!isAdmin(req) && !(isAuthenticated(req).id === reqParam
      || isAuthenticated(req).email === reqParam)) {
      next(403);
    } else {
      model.users().findOne(query).then((user) => {
        if (!user) {
          next(404);
        } else {
          return res.send({
            email: user.email,
            roles: user.roles,
            _id: user._id,
          });
        }
      });
    }
  },
  putUserById: (req, res, next) => {
    // usuario actual a cambiar
    const reqParam = req.params.uid;
    // datos a cambiar
    const { email, password, roles } = req.body;
    const query = getUserOrId(reqParam);

    // Verifico que el usuario sea el mismo que quiere cambiar o sea admin
    if (!isAdmin(req) && !(isAuthenticated(req).id === reqParam
      || isAuthenticated(req).email === reqParam)) {
      next(403);
    } else {
      model.users().findOne(query).then((user) => {
        if (!user) {
          next(404);
        } else if (!isAdmin(req) && roles) {
          next(403);
        } else if (!email && !password) {
          next(400);
        } else {
          model.users().findAndModify({ _id: user._id }, [], {
            $set: {
              email: email || user.email,
              password: (!password) ? user.password : bcrypt.hashSync(password, 10),
              roles: roles || user.roles,
            },
          }, { new: true }, (err, result) => {
            if (err) {
              console.log('no se modifico');
            }
            return res.send({
              _id: result.value._id,
              email: result.value.email,
              roles: result.value.roles,
            });
          });
        }
      });
    }
  },
  deleteUserById: (req, res, next) => {
    const reqParam = req.params.uid;
    const query = getUserOrId(reqParam);

    if (!isAdmin(req) && !(isAuthenticated(req).id === reqParam
      || isAuthenticated(req).email === reqParam)) {
      next(403);
    } else {
      model.users().findOne(query).then((user) => {
        if (!user) {
          next(404);
        } else {
          model.users().deleteOne({ _id: user._id }, (err, obj) => {
            if (err) {
              console.log('error', err);
            } else {
              res.send(user);
            }
          });
        }
      });
    }
  },
};
