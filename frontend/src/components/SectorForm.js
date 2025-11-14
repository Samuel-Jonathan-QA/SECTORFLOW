// frontend/src/components/SectorForm.js

import React, { useState, useEffect } from 'react';
import { TextField, Button, Paper } from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify'; 

function SectorForm({ onFinish, currentSector }) {
    const [name, setName] = useState('');
    
    useEffect(() => {
        if (currentSector) {
            setName(currentSector.name); 
        } else {
            setName('');
        }
    }, [currentSector]); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isEditing = !!currentSector;
        const dataToSend = { name };

        if (!name) {
            toast.error('O nome do setor é obrigatório.');
            return;
        }

        try {
            if (isEditing) {
                await API.put(`/sectors/${currentSector.id}`, dataToSend);
                toast.success('Setor atualizado com sucesso!');
            } else {
                await API.post('/sectors', dataToSend);
                toast.success('Setor criado com sucesso!');
            }

            onFinish(); 
            
            if (!isEditing) {
                setName('');
            }
            
        } catch (error) {
            const defaultMessage = isEditing ? 'Erro ao atualizar setor.' : 'Erro ao criar setor.';
            const errorMessage = error.response?.data?.error || defaultMessage;
            toast.error(errorMessage);
        }
    };

    const submitButtonText = currentSector ? 'Atualizar Setor' : 'Adicionar Setor';

    return (
        <Paper elevation={3} style={{ padding: '10px' }} data-testid="sector-form">
            <form onSubmit={handleSubmit}>
                <TextField 
                    label="Nome do Setor" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    fullWidth 
                    margin="normal" 
                />
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                    {submitButtonText}
                </Button>
            </form>
        </Paper>
    );
}

export default SectorForm;