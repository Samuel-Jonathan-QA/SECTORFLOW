// backend/app.js 
const express = require('express');
const cors = require('cors');
const sectorRoutes = require('./routes/sectors');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');

require('./models/User'); 
require('./models/Sector'); 
require('./models/Product'); 

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes); 
app.use('/api/sectors', sectorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

module.exports = app;