// backend/models/Sector.js (CORRIGIDO E SIMPLIFICADO)

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sector = sequelize.define('Sector', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
});

// AQUI DEVE FICAR VAZIO. A função 'associate' será chamada de fora.
Sector.associate = (models) => {
    // Esta função será chamada pelo index.js para configurar a associação
};

module.exports = Sector;