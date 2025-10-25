// backend/server.js (VERSÃO DE VOLTA AO ORIGINAL, SEM DOTENV)
const app = require('./app');
const PORT = 3001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));