const main = require('../connection/dataBase');

module.exports.products = () => main.getDatabase().collection('products');
