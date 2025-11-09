import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Paper } from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify';

function UserForm({ sectors, currentUser, onFinish }) { 
    // ----------------------------------------------------
    // 1. ESTADOS: Adicionado o estado 'role'
    // ----------------------------------------------------
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [sectorId, setSectorId] = useState('');
    const [role, setRole] = useState(''); // 🚨 NOVO ESTADO PARA A ROLE 🚨

    // Opções de Role (Função)
    const roleOptions = [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'VENDEDOR', label: 'Vendedor' },
        { value: 'USER', label: 'Usuário Padrão' },
    ];

    // ----------------------------------------------------
    // 2. EFEITO para preencher os dados de EDIÇÃO
    // ----------------------------------------------------
    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
            setPassword(''); 
            setSectorId(currentUser.sectorId || ''); 
            setRole(currentUser.role || ''); // 🚨 Carrega a ROLE do usuário em edição 🚨
        } else {
            // Caso contrário (modo Criação), garante que os campos estão limpos
            setName('');
            setEmail('');
            setPassword('');
            setSectorId('');
            setRole(''); // Limpa a role
        }
    }, [currentUser]); 

    // ----------------------------------------------------
    // 3. FUNÇÃO de SUBMISSÃO (POST ou PUT)
    // ----------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isEditing = !!currentUser;
        
        // Prepara os dados: inclui a role e o sectorId
        const dataToSend = { name, email, sectorId, role }; // 🚨 ROLE INCLUÍDA AQUI 🚨
        
        // Validação básica
        if (!name || !email || !role || !sectorId) {
            toast.error('Preencha todos os campos obrigatórios, incluindo Nome, Email, Setor e Role.');
            return;
        }

        // Senha é obrigatória na criação OU se preenchida na Edição
        if (password) {
            dataToSend.password = password;
        }

        // Validação adicional: Senha é obrigatória na criação
        if (!isEditing && !password) {
            toast.error('A senha é obrigatória para criar um novo usuário.');
            return;
        }

        try {
            if (isEditing) {
                await API.put(`/users/${currentUser.id}`, dataToSend);
                toast.success('Usuário atualizado com sucesso!');
            } else {
                await API.post('/users', dataToSend);
                toast.success('Usuário criado com sucesso!');
            }

            onFinish(); 
            
        } catch (error) {
            const defaultMessage = isEditing ? 'Erro ao atualizar usuário.' : 'Erro ao criar usuário.';
            const errorMessage = error.response?.data?.error || defaultMessage;
            toast.error(errorMessage);
        }
    };

    // ----------------------------------------------------
    // 4. RENDERIZAÇÃO
    // ----------------------------------------------------
    const submitButtonText = currentUser ? 'Atualizar Usuário' : 'Adicionar Usuário';
    const passwordRequired = !currentUser; 

    return (
        <Paper data-testid="user-form">
            <form onSubmit={handleSubmit}>
                <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required fullWidth margin="normal" />
                <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth margin="normal" />
                
                {/* Campo de Seleção de Role */}
                <TextField 
                    select 
                    label="Role (Função)" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    required 
                    fullWidth 
                    margin="normal"
                >
                    {roleOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Campo de Seleção de Setor */}
                <TextField select label="Setor" value={sectorId} onChange={(e) => setSectorId(e.target.value)} required fullWidth margin="normal">
                    {sectors.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </TextField>

                {/* Campo de Senha */}
                <TextField 
                    label={currentUser ? "Nova Senha (Opcional)" : "Senha"} 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required={passwordRequired} 
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

export default UserForm;