// backend/config/database.js

const { Sequelize } = require('sequelize');
const config = require('./config.json'); 
const bcrypt = require('bcryptjs'); 

// --- 1. CONFIGURAÇÃO DO SEQUELIZE ---
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Cria a instância do Sequelize.
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    dialect: dbConfig.dialect,
    storage: dbConfig.storage, 
    logging: false, 
});

// --- 2. FUNÇÃO DE SEEDING ---
const runInitialSeed = async () => {
    // Importa os modelos aqui dentro, após 'sequelize' estar definida.
    const User = require('../models/User'); 
    const Sector = require('../models/Sector');

    // VERIFICA SE O ADMIN JÁ EXISTE ANTES DE INSERIR
    const adminExists = await User.findOne({ where: { email: 'admin@sectorflow.com' } });

    if (adminExists) {
        console.log('Dados iniciais já existem. Seeding ignorado.');
        return; 
    }

    // 1. CRIE SENHAS
    const adminPassword = await bcrypt.hash('123', 10); 

    // 2. INSERIR USUÁRIOS
    await User.bulkCreate([
        { name: 'Administrador Principal', email: 'admin@sectorflow.com', password: adminPassword, role: 'ADMIN' }
    ]);

    // 3. INSERIR SETORES
    await Sector.bulkCreate([
        { name: 'Desenvolvimento' },
        { name: 'Suporte' },
        { name: 'Vendas' }
    ]);
    
    console.log('Dados iniciais (Admin, Setores) inseridos com sucesso.');
};

// --- 3. FUNÇÃO DE INICIALIZAÇÃO ---
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        
        // 🚨 CORREÇÃO: TROCADO 'force: true' por 'alter: true' 🚨
        // 'alter: true' atualiza o esquema sem deletar os dados.
        await sequelize.sync({ alter: true }); 
        console.log('Banco de dados sincronizado (esquema atualizado, dados mantidos).');

        // O Seeding agora tem uma verificação para rodar apenas na primeira vez
        await runInitialSeed();

    } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
    }
};

// --- 4. EXPORTAÇÃO ---
module.exports = {
    sequelize,
    initializeDatabase
};