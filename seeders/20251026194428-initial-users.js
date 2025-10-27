'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 🚨 MUDANÇA CRÍTICA: Definindo a senha de teste simples '123' 🚨
    const newPassword = '123';

    // Criptografando a senha simples para o Admin e o Vendedor
    const adminPassword = await bcrypt.hash(newPassword, 10);
    const vendorPassword = await bcrypt.hash(newPassword, 10);

    // 1. INSERIR USUÁRIOS
    await queryInterface.bulkInsert('Users', [
      {
        id: 1,
        name: 'Administrador Principal',
        email: 'admin@sectorflow.com',
        password: adminPassword,
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Vendedor João',
        email: 'joao.vendas@sectorflow.com',
        password: vendorPassword,
        role: 'VENDEDOR',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // 2. INSERIR SETORES
    await queryInterface.bulkInsert('Sectors', [
      { id: 1, name: 'Desenvolvimento', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Suporte', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Vendas', createdAt: new Date(), updatedAt: new Date() },
    ], {});


    // 3. VINCULAR SETORES AO VENDEDOR (ID 2)
    await queryInterface.bulkInsert('UserSectors', [
      { userId: 2, sectorId: 1, createdAt: new Date(), updatedAt: new Date() },
      { userId: 2, sectorId: 3, createdAt: new Date(), updatedAt: new Date() },
    ], {});

  },

  down: async (queryInterface, Sequelize) => {
    // Ordem inversa para remoção
    await queryInterface.bulkDelete('UserSectors', null, {});
    await queryInterface.bulkDelete('Sectors', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};