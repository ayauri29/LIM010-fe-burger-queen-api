const main = require('../connection/dataBase');

module.exports.orders = () => main.getDatabase().collection('orders');