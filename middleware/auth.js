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
    model.users().findOne({ _id: new ObjectID(decodedToken.uid) }).then((user) => {
      if (user) {
        // enviar datos
        const userAuth = { isAuth: { id: decodedToken.uid, email: user.email, password: user.password, rol: user.role } };
        Object.assign(req.headers, userAuth);
        console.log(req.headers.isAuth);
        next();
      } else {
        // no existe el usuario
        next(404);
      }
    });
  });
};

module.exports.isAuthenticated = (req) => {
  // TODO: decidir por la informacion del request si la usuaria esta autenticada
  console.log('Soy req: ', req.headers.isAuth);
  
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
