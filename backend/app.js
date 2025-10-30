// backend/app.js (VERSÃO FINAL LIMPA E SEGURA - SEM DESTRUIÇÃO DE DADOS)
const express = require('express');
const cors = require('cors');
const sequelize = require('./backend/config/database');
const sectorRoutes = require('./routes/sectors');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');


// Carrega os modelos para que o sync funcione (MANTIDO)
require('./models/User'); 
require('./models/Sector'); 
require('./models/Product'); 

const app = express();
app.use(cors());
app.use(express.json());

// Rotas de Autenticação e CRUD (MANTIDO)
app.use('/api', authRoutes); 
app.use('/api/sectors', sectorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Sincronizar o banco de dados (VERSÃO MAIS SEGURA: APENAS sequelize.sync())
sequelize.sync().then(async () => { 
    console.log('Database synced. Server is ready.');
    // TUDO O QUE ERA DE SEEDING FOI REMOVIDO PERMANENTEMENTE.
    
}).catch(err => {
    console.error('Falha ao sincronizar o banco de dados:', err);
});

module.exports = app;