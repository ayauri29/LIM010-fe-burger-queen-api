/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const jwt = require('jsonwebtoken');
const { ObjectID } = require('mongodb');
const model = require('../models/user');

module.exports = (secret) => (req, resp, next) => {
  
  const { authorization } = req.headers;
  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }
  jwt.verify(token, secret, (err, decodedToken) => {
    console.log('soy decodedtoken', decodedToken);
    if (err) {
      return next(403);
    }

    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
    model.users().findOne({ _id: new ObjectID(decodedToken.uid) }).then((doc) => {
      console.log('verifico', doc);
      if (doc) {
        next();
        // enviar datos
      } else {
        // no existe el usuario
        next(404);
      }
    });
  });
};

module.exports.isAuthenticated = (req) => {
  // TODO: decidir por la informacion del request si la usuaria esta autenticada
  return false;
};


module.exports.isAdmin = (req) => {
  // TODO: decidir por la informacion del request si la usuaria es admin
  return false;
};


module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);


module.exports.requireAdmin = (req, resp, next) => {
  console.log(req.body);
  // eslint-disable-next-line no-nested-ternary
  return (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next();
};
