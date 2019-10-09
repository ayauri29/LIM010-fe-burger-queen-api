/* eslint-disable no-console */
const jwt = require('jsonwebtoken');

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
    if (err) {
      return next(403);
    }
    console.log(decodedToken);
    next();
    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
  });
};


module.exports.isAuthenticated = (req) => {
  // TODO: decidir por la informacion del request si la usuaria esta autenticada
  console.log(req.body);
  return false;
};


module.exports.isAdmin = (req) => {
  // TODO: decidir por la informacion del request si la usuaria es admin
  console.log(req.body);
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
