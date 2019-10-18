/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');
const model = require('../models/user');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

module.exports = {
  getUsers: (req, res, next) => {
    console.log('page', req.query.page);
    console.log('limit', req.query.limit);
    const limit = parseInt(req.query.limit, 10);
    const page = parseInt(req.query.page, 10);


    model.users().countDocuments((err, count) => {
      console.log('Cantidad de documentos', count);
      const numberPages = Math.ceil(count / limit);
      const skip = (numberPages - 1) * limit;

      const firstPage = `</users?limit=${limit}&page=${1}>; rel="first"`;
      const prevPage = `</users?limit=${limit}&page=${page - 1}>; rel="prev"`;
      const nextPage = `</users?limit=${limit}&page=${page + 1}>; rel="next"`;
      const lastPage = `</users?limit=${limit}&page=${numberPages}>; rel="last"`;

      res.setHeader('link', `${firstPage}, ${prevPage}, ${nextPage}, ${lastPage}`);
      model.users().find().skip(skip).limit(limit)
        .toArray((error, users) => {
          console.log(users);
          if (error) {
            next(404);
            throw error;
          } else {
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
      if (!doc) {
        model.users().insertOne(user);
        res.send({ sucess: true });
      } else {
        next(403);
      }
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

    if (!isAdmin(req) && !(isAuthenticated(req).id === reqParam || isAuthenticated(req).email === reqParam)) {
      next(403);
    } else {
      model.users().findOne(query).then((user) => {
        if (!user) {
          next(404);
        } else {
          return res.status(200).send({
            _id: user.id,
            email: user.email,
            roles: user.roles,
          });
        }
      });
    }
  },
  putUserById: (req, res, next) => {
    // console.log('Put', req.body);
  },
  deleteUserById: (req, res, next) => {

  },
};
