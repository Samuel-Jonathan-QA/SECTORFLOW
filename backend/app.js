// backend/app.js 
const express = require('express');
const cors = require('cors');
// O sequelize não é mais necessário aqui, pois a sincronização está em server.js
// const sequelize = require('./config/database'); 
const sectorRoutes = require('./routes/sectors');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');


// Carrega os modelos para que o setupAssociations e Controllers funcionem
require('./models/User'); 
require('./models/Sector'); 
require('./models/Product'); 

const app = express();
app.use(cors());
app.use(express.json());

// Rotas de Autenticação e CRUD
app.use('/api', authRoutes); 
app.use('/api/sectors', sectorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// 🚨 REMOVIDO: O bloco sequelize.sync() foi movido para server.js 🚨
/*
sequelize.sync().then(async () => { 
    console.log('Database synced. Server is ready.');
}).catch(err => {
    console.error('Falha ao sincronizar o banco de dados:', err);
});
*/

module.exports = app;