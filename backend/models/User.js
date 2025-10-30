// backend/models/User.js (COMPLETO E CORRIGIDO)

const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// 🚨 REMOVA A IMPORTAÇÃO DE SECTOR DAQUI 🚨
// const Sector = require('./Sector'); // <-- REMOVA ESTA LINHA

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        // Adicionamos aqui para garantir que a senha não saia em chamadas padrão
        // mas ainda possa ser buscada pelo AuthController
        get() {
            return this.getDataValue('password');
        }
    },
    role: {
        type: DataTypes.ENUM('ADMIN', 'VENDEDOR', 'USER'),
        defaultValue: 'USER',
        allowNull: false
    },
}, {
    // Hooks para hashing (garante que a senha é hashada antes de salvar)
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    },

    // Define que, por padrão, a senha não é retornada
    defaultScope: {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
    },
    // Permite que o AuthController use o escopo 'withPassword'
    scopes: {
        withPassword: {
            attributes: { include: ['password'] }
        }
    }
});

// 🚨 FALHA 2 CORRIGIDA: EXPORTAÇÃO 🚨
module.exports = User;