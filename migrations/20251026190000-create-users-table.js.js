'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // CRIAÇÃO da tabela Users com a estrutura original
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // Este campo será removido na próxima migration
      sectorId: { 
        type: Sequelize.INTEGER,
        // É importante que a tabela 'Sectors' já exista ou seja criada antes
        references: {
          model: 'Sectors', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Supondo que você usava SET NULL ou CASCADE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove a tabela em caso de rollback
    await queryInterface.dropTable('Users');
  }
};