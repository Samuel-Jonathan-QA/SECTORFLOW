// backend/config/database.js

const { Sequelize } = require('sequelize');
const config = require('./config.json'); 
const bcrypt = require('bcryptjs'); // Importação de bcrypt mantida no topo

// --- 1. CONFIGURAÇÃO DO SEQUELIZE ---
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Cria a instância do Sequelize. ESTA DEVE SER A PRIMEIRA COISA A SER EXECUTADA.
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

    // 1. CRIE SENHAS
    const adminPassword = await bcrypt.hash('123', 10); 

    // 2. INSERIR USUÁRIOS
    const [adminUser, vendorUser] = await User.bulkCreate([
        { name: 'Administrador Principal', email: 'admin@sectorflow.com', password: adminPassword, role: 'ADMIN' }
    ]);

    // 3. INSERIR SETORES
    const [dev, suporte, vendas] = await Sector.bulkCreate([
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
        
        // Cria todas as tabelas, deletando as anteriores (DEV)
        await sequelize.sync({ force: true }); 
        console.log('Banco de dados sincronizado (tabelas recriadas).');

        // CHAMA O SEEDING APÓS A SINCRONIZAÇÃO
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