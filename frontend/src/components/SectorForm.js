import React, { useState } from 'react';
import { TextField, Button, Paper } from '@mui/material';
import API from '../api';

function SectorForm({ onAdd }) {
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await API.post('/sectors', { name });
        setName('');
        onAdd();
    };

    return (
        <Paper elevation={3} style={{ padding: '20px' }} data-testid="sector-form">
            <form onSubmit={handleSubmit}>
                <TextField label="Nome do Setor" value={name} onChange={(e) => setName(e.target.value)} required fullWidth margin="normal" />
                <Button type="submit" variant="contained" color="primary">Adicionar Setor</Button>
            </form>
        </Paper>
    );
}

export default SectorForm;