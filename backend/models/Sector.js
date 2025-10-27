// backend/models/Sector.js (REFATORADO COM ASSOCIAÇÃO)

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // 🚨 Importa o User 🚨
const UserSector = require('./UserSector'); // 🚨 Importa o Model Intermediário 🚨

const Sector = sequelize.define('Sector', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
});

// 🚨 ASSOCIAÇÕES MUITOS-PARA-MUITOS (N:N) 🚨
// Define que Sector pode ter muitos Users (e vice-versa), através da tabela UserSector
Sector.belongsToMany(User, { 
    through: UserSector, 
    foreignKey: 'sectorId', 
    as: 'Users' 
});

// O User precisa ser configurado para o relacionamento N:N também, 
// o que faremos logo abaixo para garantir que ambos os Models se conheçam.

// Não se preocupe, essa definição aqui não substitui a que você tem no User.js.
// É apenas a convenção do Sequelize para que a associação funcione corretamente.
User.belongsToMany(Sector, { 
    through: UserSector, 
    foreignKey: 'userId', 
    as: 'Sectors' 
});


module.exports = Sector;