// backend/server.js (CÓDIGO COMPLETO E CORRIGIDO PARA INICIALIZAÇÃO)

const app = require('./app');
const setupAssociations = require('./config/setupAssociations'); // Importa a função
const sequelize = require('./config/database'); // Importa a instância do Sequelize
// Se você usa dotenv fora do npm start, reative-o:
// require('dotenv').config(); 

const PORT = process.env.PORT || 3001;

// 🚨 1. CHAMA AS ASSOCIAÇÕES 🚨
// Isto deve ser executado ANTES de qualquer Controller tentar usar as associações.
setupAssociations(); 

// 🚨 2. SINCRONIZA O DB E INICIA O SERVIDOR 🚨
sequelize.sync({ alter: true }) // use { alter: true } para não perder dados
  .then(() => {
    console.log('Database synced. Server is ready.');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(error => {
    console.error('Error syncing database:', error);
  });