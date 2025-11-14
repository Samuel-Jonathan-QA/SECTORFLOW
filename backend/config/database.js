// backend/config/database.js

const { Sequelize } = require('sequelize');
const config = require('./config.json'); 
const bcrypt = require('bcryptjs'); 

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    dialect: dbConfig.dialect,
    storage: dbConfig.storage, 
    logging: false, 
});

const runInitialSeed = async () => {
    const User = require('../models/User'); 
    const Sector = require('../models/Sector');

    const adminExists = await User.findOne({ where: { email: 'admin@sectorflow.com' } });

    if (adminExists) {
        console.log('Dados iniciais já existem. Seeding ignorado.');
        return; 
    }

    const adminPassword = await bcrypt.hash('123', 10); 

    await User.bulkCreate([
        { name: 'Administrador Principal', email: 'admin@sectorflow.com', password: adminPassword, role: 'ADMIN' }
    ]);

    await Sector.bulkCreate([
        { name: 'Desenvolvimento' },
        { name: 'Suporte' },
        { name: 'Vendas' }
    ]);
    
    console.log('Dados iniciais (Admin, Setores) inseridos com sucesso.');
};

const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        
        await sequelize.sync({ alter: true }); 
        console.log('Banco de dados sincronizado (esquema atualizado, dados mantidos).');

        await runInitialSeed();

    } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
    }
};

module.exports = {
    sequelize,
    initializeDatabase
};