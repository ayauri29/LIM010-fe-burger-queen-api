const main = require('../db-data/dataBase');

module.exports.users = () => main.getDatabase().collection('users');
