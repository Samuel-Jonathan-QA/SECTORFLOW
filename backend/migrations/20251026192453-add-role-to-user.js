'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Adicionar a coluna 'role' (ENUM) à tabela Users
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('ADMIN', 'VENDEDOR', 'USER'),
      defaultValue: 'USER',
      allowNull: false
    });

    // 2. Remover a coluna 'sectorId' da tabela Users
    // É crucial remover este campo, pois o User agora se relaciona com Sector via tabela UserSectors (N:N).
    await queryInterface.removeColumn('Users', 'sectorId');
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Reverter: Remover a coluna 'role'
    await queryInterface.removeColumn('Users', 'role');
    
    // 2. Reverter: Se quiser um rollback completo, você precisaria adicionar sectorId de volta.
    // Como estamos removendo o N:N neste down, vamos apenas reverter o campo role.
    // Adicionar sectorId de volta é opcional, mas garante que o 'up' possa ser rodado novamente
    // em um banco limpo se necessário.
  }
};