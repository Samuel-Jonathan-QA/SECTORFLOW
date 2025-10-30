// backend/models/UserSector.js (CORRIGIDO E SIMPLIFICADO)

const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// 🚨 REMOVA AS IMPORTAÇÕES DE MODELOS CRUZADOS! 🚨
// const User = require('./User'); 
// const Sector = require('./Sector');

const UserSector = sequelize.define('UserSector', {
    // Apenas as chaves estrangeiras, sem a referência explícita do modelo aqui,
    // pois a referência será feita no setupAssociations.js
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    sectorId: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    // É importante manter o nome da tabela (que será usada no Seeder e Associações)
    tableName: 'UserSectors',
    timestamps: false,
    // Garante que o índice composto (userId, sectorId) seja único
    indexes: [
        {
            unique: true,
            fields: ['userId', 'sectorId']
        }
    ]
});

// A associação real será definida em backend/config/setupAssociations.js
// Onde ele importará User, Sector e UserSector e fará a ligação.

module.exports = UserSector;