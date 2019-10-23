/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const { ObjectID } = require('mongodb');
const model = require('../models/products');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

module.exports = {
  getProducts: (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    model.products().countDocuments((err, count) => {
      const numberPages = Math.ceil(count / limit);
      const skip = (numberPages === 0) ? 1 : (numberPages - 1) * limit;

      model.products().find().skip(skip).limit(limit)
        .toArray((error, product) => {
          if (!error) {
            const firstPage = `</products?limit=${limit}&page=${1}>; rel="first"`;
            const prevPage = `</products?limit=${limit}&page=${page - 1}>; rel="prev"`;
            const nextPage = `</products?limit=${limit}&page=${page + 1}>; rel="next"`;
            const lastPage = `</products?limit=${limit}&page=${numberPages}>; rel="last"`;

            res.setHeader('link', `${firstPage}, ${prevPage}, ${nextPage}, ${lastPage}`);
            res.send(product);
          }
        });
    });

    // skip = (numero de paginas - 1)*limit;
    // count / limit = paginas
    // link => url query con prev, next
    // res.headers()
  },
  createProducts: (req, res, next) => {
    const {
      name, price, image, type,
    } = req.body;

    if (!name || !price) {
      return next(400);
    }

    const product = {
      name,
      price,
      image,
      type,
      dateEntry: new Date(),
    };
    model.products().insertOne(product, (error, result) => {
      console.log(result.ops);
      if (!error) {
        res.send({
          _id: result.ops[0]._id,
          name: result.ops[0].name,
          price: result.ops[0].price,
          image: result.ops[0].image,
          type: result.ops[0].type,
          dateEntry: result.ops[0].dateEntry,
        });
      }
    });
  },
  getProductsById: (req, res, next) => {
    const hex = /[0-9A-Fa-f]{6}/g;
    const reqParam = req.params.productId;
    const query = (hex.test(reqParam)) ? { _id: new ObjectID(reqParam) } : { _id: reqParam };
    model.products().findOne(query).then((product) => {
      if (!product) {
        next(404);
      } else {
        return res.send({
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          type: product.type,
          dateEntry: product.dateEntry,
        });
      }
    });
  },
  /* putProductById: (req, res, next) => {
    const hex = /[0-9A-Fa-f]{6}/g;
    const reqParam = req.params.productId;
    const query = (hex.test(reqParam)) ? { _id: new ObjectID(reqParam) } : { _id: reqParam };

    const {
      name, price, imagen, type,
    } = req.body;

    // Verifico que el usuario sea el mismo que quiere cambiar o sea admin

    model.products().findOne(query).then((product) => {
      if (!product) {
        next(404);
      } else {
        model.products().findAndModify({ _id: user._id }, [], {
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
  }, */
  /* deleteUserById: (req, res, next) => {
    const reqParam = req.params.uid;
    const query = getUserOrId(reqParam);

    if (!isAdmin(req) && !(isAuthenticated(req).id === reqParam
      || isAuthenticated(req).email === reqParam)) {
      next(403);
    } else {
      model.products().findOne(query).then((user) => {
        if (!user) {
          next(404);
        } else {
          model.products().deleteOne({ _id: user._id }, (err, obj) => {
            if (err) {
              console.log('error', err);
            } else {
              res.send(user);
            }
          });
        }
      });
    }
  }, */
};
