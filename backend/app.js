const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const sectorRoutes = require('./routes/sectors');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');

require('./models/User'); 
require('./models/Sector'); 
require('./models/Product'); 

const app = express();
app.use(cors());

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

app.use(express.json());

app.use('/api', authRoutes); 
app.use('/api/sectors', sectorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

module.exports = app;