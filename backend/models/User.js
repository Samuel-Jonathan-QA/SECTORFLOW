// backend/models/User.js

const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const Sector = require('./Sector'); // Importa o modelo Sector para a associação

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  sectorId: {
    type: DataTypes.INTEGER, references: { model: Sector, key: 'id', },
    allowNull: false
  }
});

// Hook para criptografar a senha antes de salvar
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// NOVO: Adiciona o método para comparar senhas
User.prototype.validPassword = function (password) {
    // Compara a senha digitada com o hash (this.password) do usuário no banco
    return bcrypt.compareSync(password, this.password);
};

// Associação: Um Setor tem muitos Usuários
Sector.hasMany(User, { foreignKey: 'sectorId' }); // ADICIONADO: foreignKey
User.belongsTo(Sector, { foreignKey: 'sectorId' }); // ADICIONADO: foreignKey

module.exports = User;