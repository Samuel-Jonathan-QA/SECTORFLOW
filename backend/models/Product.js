// backend/models/Product.js (AJUSTADO)

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
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
    // 🚨 AJUSTE 1: Usar DECIMAL para precisão monetária (opcional, mas recomendado) 🚨
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
    // Adicionei description para corresponder à Migration que sugeri
    description: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    }
});

// Associação: Um Produto pertence a um Setor
Product.belongsTo(Sector, { 
    foreignKey: 'sectorId',
    as: 'Sector' // Adicionando um alias para facilitar os 'includes'
});

// 🚨 AJUSTE 3: Asssociação reversa 🚨
Sector.hasMany(Product, { 
    foreignKey: 'sectorId', 
    as: 'Products' // Adicionando um alias para consistência
});

module.exports = Product;