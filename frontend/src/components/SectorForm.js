import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify'; 

function SectorForm({ onFinish, existingSectors = [] }) {
    const [name, setName] = useState('');
    const [error, setError] = useState(''); 
    
    const currentSector = null; 

    const validateInput = (inputName) => {
        const cleanName = inputName.trim();

        if (cleanName.length < 3 || cleanName.length > 50) {
            return 'O nome deve ter entre 3 e 50 caracteres.';
        }
        
        const validCharsRegex = /^[a-zA-Z0-9\u00C0-\u00FF\s\-'',]*$/; 
        if (!validCharsRegex.test(cleanName)) {
            return 'O nome contém caracteres inválidos. Use apenas letras, números, espaços, hífens (-) ou vírgulas (,).';
        }
        
        const hasLetters = /[a-zA-Z\u00C0-\u00FF]/.test(cleanName);
        if (!hasLetters) {
             return 'O nome deve conter letras descritivas.';
        }
        
        const isDuplicate = existingSectors.some(sector => {
            return sector.name.trim().toLowerCase() === cleanName.toLowerCase();
        });

        if (isDuplicate) {
            return 'Já existe um setor com este nome.';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateInput(name);
        if (validationError) {
            setError(validationError);
            toast.warning(validationError); 
            return;
        }

        const dataToSend = { name: name.trim() };

        try {
            await API.post('/sectors', dataToSend);
            toast.success('Setor criado com sucesso!');

            onFinish(); 
            
            setName(''); 
            setError(''); 
            
        } catch (error) {
            const defaultMessage = 'Erro ao criar setor.';
            const errorMessage = error.response?.data?.error || defaultMessage;
            
            if (errorMessage.toLowerCase().includes('já existe')) {
                 setError('Este nome já está em uso (verificado no servidor).');
            }
            
            toast.error(errorMessage);
        }
    };

    const handleChange = (e) => {
        setName(e.target.value);
        if (error) setError('');
    };

    return (
        <Paper elevation={3} style={{ padding: '10px' }} data-testid="sector-form">
            
            <form onSubmit={handleSubmit}>
                <TextField 
                    label="Nome do Setor" 
                    value={name} 
                    onChange={handleChange} 
                    required 
                    fullWidth 
                    margin="normal" 
                    error={!!error} 
                    helperText={error} 
                    inputProps={{ maxLength: 50 }} 
                />
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        sx={{ mt: 2 }}
                    >
                        Adicionar Setor
                    </Button>
                </Box>
            </form>
        </Paper>
    );
}

export default SectorForm;