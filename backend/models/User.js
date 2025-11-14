// backend/models/User.js 

const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return this.getDataValue('password');
        }
    },
    role: {
        type: DataTypes.ENUM('ADMIN', 'VENDEDOR'),
        defaultValue: 'VENDEDOR',
        allowNull: false
    },
}, {
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

    defaultScope: {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password'] }
        }
    }
});

User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = User;