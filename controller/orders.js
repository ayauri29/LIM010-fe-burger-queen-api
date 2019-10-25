const { ObjectID } = require('mongodb');
const model = require('../models/orders');
const pModel = require('../models/products');

module.exports = {
  createOrder: (req, res, next) => {
    const { userId, client, products } = req.body;
    if (!userId || !products) {
      next(400);
    } else {
      products.forEach(elem => {
        pModel.products().findOne({ _id: new ObjectID(elem.productId) })
          .then((product) => {
            const order = {
              userId,
              client,
              // products: [{ product: { productId: product._id, name: product.name, price: product.price }, qty: elem.qty }],
              products: [{ product: { productId: product._id, name: product.name, price: product.price }, qty: elem.qty }],
              status: 'pending',
              dateEntry: new Date(),
              dateProcessed: ''
            };
            model.orders().insertOne(order, (err, result) => {
              if (!err) {
                console.log('result', result.ops);
                res.send(result.ops[0]);
              }
            });

          })
      });
    }
  },
  getOrders: (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    model.orders().countDocuments((err, count) => {
      const numberPages = Math.ceil(count / limit);
      const skip = (numberPages === 0) ? 1 : (numberPages - 1) * limit;

      model.orders().find().skip(skip).limit(limit)
        .toArray((error, orders) => {
          if (!error) {
            const firstPage = `</products?limit=${limit}&page=${1}>; rel="first"`;
            const prevPage = `</products?limit=${limit}&page=${page - 1}>; rel="prev"`;
            const nextPage = `</products?limit=${limit}&page=${page + 1}>; rel="next"`;
            const lastPage = `</products?limit=${limit}&page=${numberPages}>; rel="last"`;

            res.setHeader('link', `${firstPage}, ${prevPage}, ${nextPage}, ${lastPage}`);
            res.send(orders);
          }
        });
    });
  },
  getOrderById: (req, res, next) => {
    const hex = /[0-9A-Fa-f]{6}/g;
    const reqParam = req.params.orderid;
    console.log('req', req.params);
    const query = (hex.test(reqParam)) ? { _id: new ObjectID(reqParam) } : { _id: reqParam };
    model.orders().findOne(query).then((order) => {
      if (!order) {
        next(404);
      } else {
        console.log('order', order);
        return res.send(order);
      }
    });
  },
/*   deleteOrderById: (req, res,next) => {

  }, */
};
