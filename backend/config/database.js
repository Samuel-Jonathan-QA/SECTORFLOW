// backend/config/database.js (CÓDIGO QUE ESTAVA FALTANDO)

const { Sequelize } = require('sequelize');
const config = require('./config.json'); // Carrega as configurações do JSON

// Define qual ambiente usar (desenvolvimento por padrão)
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Cria a instância do Sequelize
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  dialect: dbConfig.dialect,
  storage: dbConfig.storage, // Necessário para SQLite
  logging: false, // Opcional: desliga logs SQL no console
});

module.exports = sequelize;