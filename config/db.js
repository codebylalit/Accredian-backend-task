const { Sequelize } = require('sequelize');

const db = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'root',
  password: 'lalitsql',
  database: 'my_login_app',
});

module.exports = db;
