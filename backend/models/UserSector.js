'use strict';

const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const UserSector = sequelize.define('UserSector', {
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
    timestamps: true, 
    indexes: [
        {
            unique: true,
            fields: ['userId', 'sectorId']
        }
    ]
});

module.exports = UserSector;