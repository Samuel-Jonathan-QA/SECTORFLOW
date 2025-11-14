// backend/server.js

const app = require('./app');
const setupAssociations = require('./config/setupAssociations');
const { initializeDatabase } = require('./config/database'); 

const PORT = process.env.PORT || 3001;

setupAssociations(); 

//INICIALIZA O DB E INICIA O SERVIDOR 
initializeDatabase()
  .then(() => {
    console.log('Database synced (tabelas recriadas). Server is ready.');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(error => {
    console.error('Error initializing database:', error);
  });