import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify'; 

// Componente para a CRIAÇÃO de um novo setor (sempre vazio)
function SectorForm({ onFinish, existingSectors = [] }) {
    const [name, setName] = useState('');
    const [error, setError] = useState(''); 
    
    // O currentSector é sempre nulo na criação, mas passamos currentSector={null} para a função
    const currentSector = null; 

    const validateInput = (inputName) => {
        const cleanName = inputName.trim();

        // 1. Regra de Tamanho (3 a 50 caracteres)
        if (cleanName.length < 3 || cleanName.length > 50) {
            return 'O nome deve ter entre 3 e 50 caracteres.';
        }
        
        // 2. Regra de Caracteres Válidos
        const validCharsRegex = /^[a-zA-Z0-9\u00C0-\u00FF\s\-'',]*$/; 
        if (!validCharsRegex.test(cleanName)) {
            return 'O nome contém caracteres inválidos. Use apenas letras, números, espaços, hífens (-) ou vírgulas (,).';
        }
        
        // Regra de Conteúdo Mínimo
        const hasLetters = /[a-zA-Z\u00C0-\u00FF]/.test(cleanName);
        if (!hasLetters) {
             return 'O nome deve conter letras descritivas.';
        }
        
        // 3. Regra de Duplicidade (Case Insensitive)
        const isDuplicate = existingSectors.some(sector => {
            return sector.name.trim().toLowerCase() === cleanName.toLowerCase();
        });

        if (isDuplicate) {
            return 'Já existe um setor com este nome.';
        }

        return null; // Sem erros
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
            
            // Limpa o formulário após o sucesso
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