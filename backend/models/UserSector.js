// backend/models/UserSector.js (NOVO ARQUIVO)

const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const User = require('./User');
const Sector = require('./Sector');

const UserSector = sequelize.define('UserSector', {
    // ID é automático, mas definimos os IDs das chaves estrangeiras
    userId: {
        type: DataTypes.INTEGER,
        references: { model: User, key: 'id' },
        primaryKey: true // Define a combinação de chaves como primária
    },
    sectorId: {
        type: DataTypes.INTEGER,
        references: { model: Sector, key: 'id' },
        primaryKey: true // Define a combinação de chaves como primária
    }
}, {
    tableName: 'UserSectors',
    // Não crie timestamps nesta tabela para simplicidade, se não forem necessários
    timestamps: false
});

module.exports = UserSector;