//frontend\src\components\ProductForm.js
import React, { useState } from 'react';
import { TextField, Button, MenuItem, Paper } from '@mui/material';
import API from '../api';

function ProductForm({ sectors, onAdd }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sectorId, setSectorId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post('/products', { name, price: parseFloat(price), sectorId });
    setName(''); setPrice(''); setSectorId('');
    onAdd();
  };

  return (
    <Paper elevation={3} style={{ padding: '20px' }} data-testid="product-form">
      <form onSubmit={handleSubmit}>
        <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required fullWidth margin="normal" />
        <TextField label="Preço" value={price} onChange={(e) => setPrice(e.target.value)} required type="number" fullWidth margin="normal" />
        <TextField select label="Setor" value={sectorId} onChange={(e) => setSectorId(e.target.value)} required fullWidth margin="normal">
          {sectors.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </TextField>
        <Button type="submit" variant="contained" color="primary">Adicionar Produto</Button>
      </form>
    </Paper>
  );
}

export default ProductForm;