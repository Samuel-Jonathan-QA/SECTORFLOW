// backend/models/User.js (CORREÇÃO DE ATRIBUTO)

const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const Sector = require('./Sector'); // Importa o modelo Sector

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // ... (campos de dados)

    role: {
        type: DataTypes.ENUM('ADMIN', 'VENDEDOR', 'USER'),
        defaultValue: 'USER',
        allowNull: false
    },
}, {
    // 🚨 CORREÇÃO CRÍTICA PARA INCLUIR SENHA SEMPRE 🚨
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    },
    scopes: {
        withPassword: {
            // Este escopo pode ser usado para retornar a senha em chamadas específicas se precisar,
            // mas o defaultScope já deve resolver
        }
    }
});
// ...