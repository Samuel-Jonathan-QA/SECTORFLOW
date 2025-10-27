// frontend\src\components\UserForm.js (REFATORADO)

import React, { useState, useEffect } from 'react'; // 🚨 Importar useEffect 🚨
import { TextField, Button, MenuItem, Paper } from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify';

// 🚨 Recebe currentUser e onFinish (antes era onAdd) 🚨
function UserForm({ sectors, currentUser, onFinish }) { 
    // ----------------------------------------------------
    // 1. ESTADOS
    // ----------------------------------------------------
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [sectorId, setSectorId] = useState('');

    // ----------------------------------------------------
    // 2. EFEITO para preencher os dados de EDIÇÃO
    // ----------------------------------------------------
    useEffect(() => {
        // Se houver um usuário sendo editado, preenche os campos
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
            // NÃO preenchemos a senha por segurança!
            setPassword(''); 
            // O Sequelize retorna Sector?.id, o setorId pode estar diretamente no objeto
            setSectorId(currentUser.sectorId || ''); 
        } else {
            // Caso contrário (modo Criação), garante que os campos estão limpos
            setName('');
            setEmail('');
            setPassword('');
            setSectorId('');
        }
    }, [currentUser]); // Executa sempre que currentUser mudar (abrir/fechar modal)


    // ----------------------------------------------------
    // 3. FUNÇÃO de SUBMISSÃO (POST ou PUT)
    // ----------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Determina se estamos em modo EDIÇÃO
        const isEditing = !!currentUser;
        
        // Prepara os dados: inclui a senha APENAS se for Criação OU se a senha for preenchida na Edição
        const dataToSend = { name, email, sectorId };
        
        // Na criação, a senha é OBRIGATÓRIA. Na edição, ela é opcional (só se quiser mudar).
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
                // Rota PUT para EDIÇÃO
                await API.put(`/users/${currentUser.id}`, dataToSend);
                toast.success('Usuário atualizado com sucesso!');
            } else {
                // Rota POST para CRIAÇÃO
                await API.post('/users', dataToSend);
                toast.success('Usuário criado com sucesso!');
            }

            // A função onFinish será handleCloseModal ou fetchUsers, dependendo de onde for chamado.
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
    const passwordRequired = !currentUser; // Senha obrigatória apenas na Criação

    return (
        <Paper data-testid="user-form">
            <form onSubmit={handleSubmit}>
                <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required fullWidth margin="normal" />
                <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth margin="normal" />
                
                {/* O campo de senha só é obrigatório na criação. Na edição, é opcional. */}
                <TextField 
                    label={currentUser ? "Nova Senha (Opcional)" : "Senha"} 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    // Se estiver criando, é obrigatório; se estiver editando, não.
                    required={passwordRequired} 
                    fullWidth 
                    margin="normal" 
                />
                
                <TextField select label="Setor" value={sectorId} onChange={(e) => setSectorId(e.target.value)} required fullWidth margin="normal">
                    {sectors.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </TextField>
                
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                    {submitButtonText}
                </Button>
            </form>
        </Paper>
    );
}

export default UserForm;