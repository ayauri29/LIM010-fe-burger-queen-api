const main = require('../index');

module.exports.users = () => main.getDatabase().collection('users');
