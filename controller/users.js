/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');
const model = require('../models/user');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

module.exports = {
  getUsers: (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;


    model.users().countDocuments((err, count) => {
      const numberPages = Math.ceil(count / limit);
      const skip = (numberPages - 1) * limit;

      model.users().find().skip(skip).limit(limit)
        .toArray((error, users) => {
          if (error) {
            next(404);
            throw error;
          } else {
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
    model.users().findOne({ email }).then((doc) => {
      if (doc) {
        next(403);
      }
      model.users().insertOne(user);
      return res.status(200).send({ success: true });
    });
  },
  getUsersById: (req, res, next) => {
    const reqParam = req.params.uid;
    let query;
    if (reqParam.indexOf('@') === -1) {
      query = { _id: new ObjectID(reqParam) };
    } else {
      query = { email: reqParam };
    }

    if (!isAdmin(req) && !(isAuthenticated(req).id === reqParam
      || isAuthenticated(req).email === reqParam)) {
      next(403);
    } else {
      model.users().findOne(query).then((user) => {
        if (!user) {
          next(404);
        }

        return res.status(200).send({
          _id: user.id,
          email: user.email,
          roles: user.roles,

        });
      });
    }
  },
  putUserById: (req, res, next) => {
    // usuario actual a cambiar
    const reqParam = req.params.uid;
    console.log('reqparam uid', reqParam);
    // datos a cambiar
    const { email, password, roles } = req.body;
    console.log(email, password, roles);
    let query;
    // busco por id
    if (reqParam.indexOf('@') === -1) {
      query = { _id: new ObjectID(reqParam) };
      // busco por email
    } else {
      query = { email: reqParam };
    }
    // Verifico que el usuario sea el mismo que quiere cambiar o sea admin
    if (!isAdmin(req) && !(isAuthenticated(req).id === reqParam
      || isAuthenticated(req).email === reqParam)) {
      next(403);
    } else {
      model.users().findOne(query).then((user) => {
        if (!user) {
          next(404);
        } else {
          const newUser = {
            _id: user.id,
            email: email || user.email,
            password: bcrypt.hashSync(password, 10) || user.password,
            roles: user.roles,
          };
          model.users().updateOne(query, { $set: newUser }, (err, result) => {
            if (err) {
              console.log('No se cambiaron los datos');
            } else {
              console.log('datos cambiados', result);
            }
          });
        }
      });
    }
  },
  deleteUserById: (req, res, next) => {
    const reqParam = req.params.uid;
    let query;
    if (reqParam.indexOf('@') === -1) {
      query = { _id: new ObjectID(reqParam) };
    } else {
      query = { email: reqParam };
    }

    if (!isAdmin(req) && !(isAuthenticated(req).id === reqParam
      || isAuthenticated(req).email === reqParam)) {
      next(403);
    } else {
      model.users().findOne(query).then((user) => {
        if (!user) {
          next(404);
        }
        model.users().deleteOne(query, (err, obj) => {
          console.log('Eliminado', obj);
        });
        // debemos retornar user :()
      });
    }
  },
};
