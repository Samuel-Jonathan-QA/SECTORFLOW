// backend/models/Product.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); 
const Sector = require('./Sector');

const Product = sequelize.define('Product', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    price: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false 
    },
    quantity: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        defaultValue: 0 
    },
    sectorId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: Sector, 
            key: 'id'
        } 
    },
    description: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    }
});

Product.belongsTo(Sector, { 
    foreignKey: 'sectorId',
    as: 'Sector' 
});

Sector.hasMany(Product, { 
    foreignKey: 'sectorId', 
    as: 'Products'
});

module.exports = Product;