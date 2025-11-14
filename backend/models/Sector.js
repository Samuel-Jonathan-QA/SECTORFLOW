// backend/models/Sector.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); 

const Sector = sequelize.define('Sector', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
});

module.exports = Sector;