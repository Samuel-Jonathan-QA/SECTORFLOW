import React, { useState } from 'react';
import { TextField, Button, MenuItem, Paper } from '@mui/material';
import API from '../api';

function UserForm({ sectors, onAdd }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sectorId, setSectorId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post('/users', { name, email, sectorId });
    setName(''); setEmail(''); setSectorId('');
    onAdd();
  };

  return (
    <Paper elevation={3} style={{ padding: '20px' }} data-testid="user-form">
      <form onSubmit={handleSubmit}>
        <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required fullWidth margin="normal" />
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth margin="normal" />
        <TextField select label="Setor" value={sectorId} onChange={(e) => setSectorId(e.target.value)} required fullWidth margin="normal">
          {sectors.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </TextField>
        <Button type="submit" variant="contained" color="primary">Adicionar Usuário</Button>
      </form>
    </Paper>
  );
}

export default UserForm;