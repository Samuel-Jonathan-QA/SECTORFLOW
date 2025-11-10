// frontend/src/components/SectorForm.js (Refatorado para CRUD: Criação e Edição)

import React, { useState, useEffect } from 'react';
import { TextField, Button, Paper } from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify'; // Importa o toast

// 🚨 NOVO: Recebe currentSector para Edição e onFinish 🚨
function SectorForm({ onFinish, currentSector }) {
    const [name, setName] = useState('');
    
    // ----------------------------------------------------
    // 1. EFEITO para preencher os dados de EDIÇÃO
    // ----------------------------------------------------
    useEffect(() => {
        if (currentSector) {
            setName(currentSector.name); 
        } else {
            // Limpa o estado no modo Criação
            setName('');
        }
    }, [currentSector]); 

    // ----------------------------------------------------
    // 2. FUNÇÃO de SUBMISSÃO (POST ou PUT)
    // ----------------------------------------------------
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
                // Requisição PUT para Edição
                await API.put(`/sectors/${currentSector.id}`, dataToSend);
                toast.success('Setor atualizado com sucesso!');
            } else {
                // Requisição POST para Criação
                await API.post('/sectors', dataToSend);
                toast.success('Setor criado com sucesso!');
            }

            // Chama onFinish (que recarrega a lista e/ou fecha a modal)
            onFinish(); 
            
            // Limpa o nome apenas se for Criação (na Edição a modal será fechada)
            if (!isEditing) {
                setName('');
            }
            
        } catch (error) {
            const defaultMessage = isEditing ? 'Erro ao atualizar setor.' : 'Erro ao criar setor.';
            const errorMessage = error.response?.data?.error || defaultMessage;
            toast.error(errorMessage);
        }
    };

    // ----------------------------------------------------
    // 3. RENDERIZAÇÃO
    // ----------------------------------------------------
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