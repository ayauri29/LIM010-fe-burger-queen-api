const main = require('../connection/dataBase');

module.exports.users = () => main.getDatabase().collection('users');
