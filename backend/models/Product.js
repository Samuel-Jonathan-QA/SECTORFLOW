// backend/models/Product.js (AJUSTADO E CORRIGIDO)

const { DataTypes } = require('sequelize');
// 🚨 CORREÇÃO: Desestrutura a instância 'sequelize' 🚨
const { sequelize } = require('../config/database'); 
const Sector = require('./Sector'); // Importa o Sector

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
    // 🚨 AJUSTE 1: Usar DECIMAL para precisão monetária
    price: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false 
    },
    sectorId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        // 🚨 AJUSTE 2: Definir explicitamente as referências para clareza
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

// Associação: Um Produto pertence a um Setor
Product.belongsTo(Sector, { 
    foreignKey: 'sectorId',
    as: 'Sector' // Alias para facilitar os 'includes'
});

// 🚨 AJUSTE 3: Asssociação reversa 🚨
Sector.hasMany(Product, { 
    foreignKey: 'sectorId', 
    as: 'Products' // Alias para consistência
});

module.exports = Product;