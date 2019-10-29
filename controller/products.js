const { ObjectID } = require('mongodb');
const model = require('../models/products');

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
  putProductById: (req, res, next) => {
    const hex = /^[0-9a-fA-F]{24}$/;
    const reqParam = req.params.productId;
    const query = (hex.test(reqParam)) ? { _id: new ObjectID(reqParam) } : { _id: reqParam };

    const {
      name, price, image, type,
    } = req.body;

    try {
      model.products().findOne(query).then((product) => {
        if (!product) {
          next(404);
        } else if (typeof (name) !== 'string' && typeof (price) !== 'number' && typeof (image) !== 'string' && typeof (type) !== 'string') {
          next(400);
        } else {
          model.products().findAndModify({ _id: product._id }, [], {
            $set: {
              name: name || product.name,
              price: price || product.price,
              image: image || product.image,
              type: type || product.type,
            },
          }, { new: true }, (err, result) => {
            if (err) {
              console.error(err)
            }
            return res.send({
              _id: result.value._id,
              name: result.value.name,
              price: result.value.price,
              image: result.value.image,
              type: result.value.type,
            });
          });
        }
      });
    } catch (error) {
      next(404);
    }
  },
  deleteProductById: (req, res, next) => {
    const hex = /^[0-9a-fA-F]{24}$/;
    const reqParam = req.params.productId;
    const query = (hex.test(reqParam)) ? { _id: new ObjectID(reqParam) } : { _id: reqParam };

    try {
      model.products().findOne(query).then((product) => {
        if (!product) {
          next(404);
        } else {
          model.products().deleteOne({ _id: product._id }, (err) => {
            if (err) {
              console.error(err)
            }
            return res.send(product);
          });
        }
      });
    } catch (error) {
      next(404);
    }
  },
};
