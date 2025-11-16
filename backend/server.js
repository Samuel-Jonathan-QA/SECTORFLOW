// backend/server.js

require('dotenv').config();

const app = require('./app');
const setupAssociations = require('./config/setupAssociations');
const { initializeDatabase } = require('./config/database');

const PORT = process.env.PORT || 3001;

setupAssociations();

initializeDatabase()
    .then(() => {
        console.log('Database synced (tabelas recriadas). Server is ready.');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(error => {
        console.error('Error initializing database:', error);
    });