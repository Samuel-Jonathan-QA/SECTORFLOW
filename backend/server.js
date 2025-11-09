// backend/server.js

const app = require('./app');
const setupAssociations = require('./config/setupAssociations');
// 🚨 CORREÇÃO DE IMPORTAÇÃO: Importamos a função de inicialização 🚨
const { initializeDatabase } = require('./config/database'); 
// Se você usa dotenv fora do npm start, reative-o:
// require('dotenv').config(); 

const PORT = process.env.PORT || 3001;

// 🚨 1. CHAMA AS ASSOCIAÇÕES 🚨
// Isto deve ser executado ANTES que os modelos sejam sincronizados.
setupAssociations(); 

// 🚨 2. INICIALIZA O DB E INICIA O SERVIDOR 🚨
// A função initializeDatabase() já contém o sequelize.sync({ force: true })
initializeDatabase()
  .then(() => {
    console.log('Database synced (tabelas recriadas). Server is ready.');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(error => {
    console.error('Error initializing database:', error);
  });