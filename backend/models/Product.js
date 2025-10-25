const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sector = require('./Sector');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  sectorId: { type: DataTypes.INTEGER, allowNull: false },
});

Product.belongsTo(Sector, { foreignKey: 'sectorId' });

module.exports = Product;