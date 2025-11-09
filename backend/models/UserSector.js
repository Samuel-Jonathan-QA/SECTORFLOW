'use strict';

// 🚨 CORREÇÃO: Desestrutura a instância 'sequelize' do objeto exportado 🚨
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const UserSector = sequelize.define('UserSector', {
    // Apenas as chaves estrangeiras
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    sectorId: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    tableName: 'UserSectors',
    // 🚨 CORREÇÃO: Ativamos as colunas createdAt e updatedAt 🚨
    timestamps: true, 

    // Garante que o índice composto (userId, sectorId) seja único
    indexes: [
        {
            unique: true,
            fields: ['userId', 'sectorId']
        }
    ]
});

module.exports = UserSector;