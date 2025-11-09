// frontend/src/pages/UsuariosPage.jsx (Com botão Voltar e correção de robustez)

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent, Button, Box } from '@mui/material'; 
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import API from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// O componente agora deve receber a role
function UsuariosPage({ userRole }) { 
    const [users, setUsers] = useState([]);
    const [sectors, setSectors] = useState([]);

    // Estados para a Modal de Edição
    const [openModal, setOpenModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null); 

    // HOOK DE NAVEGAÇÃO 
    const navigate = useNavigate();

    // CORREÇÃO DE ROBUSTEZ: Usa toUpperCase() 
    const canManageUsers = userRole && userRole.toUpperCase() === 'ADMIN';

    // Refatora a busca para incluir tratamento de erro e usar useCallback
    const fetchUsers = useCallback(async () => {
        // Se não for ADMIN, não faz a chamada (o backend bloquearia, mas evitamos o erro)
        if (!canManageUsers) {
            setUsers([]); // Garante que a lista está vazia
            return;
        }
        
        try {
            const res = await API.get('/users');
            setUsers(res.data);
        } catch (error) {
           toast.error('Não foi possível carregar a lista de usuários.');
        }
    }, [canManageUsers]); // Depende de canManageUsers

    const fetchAllSectors = useCallback(async () => {
        try {
            const res = await API.get('/sectors');
            setSectors(res.data);
        } catch (error) {
            toast.error('Não foi possível carregar a lista de setores.');
        }
    }, []);

    // Efeitos para carregar dados
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        fetchAllSectors();
    }, [fetchAllSectors]);

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return;
        try {
            await API.delete(`/users/${id}`); 
            fetchUsers();
            toast.success('Usuário deletado com sucesso!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao deletar usuário.');
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingUser(null);
        fetchUsers(); // Atualiza a lista após fechar a modal (criação ou edição)
    };

    // Se o usuário não puder gerenciar, mostramos uma mensagem simples
    if (!canManageUsers) {
        return (
            <Container maxWidth="md" style={{ marginTop: '30px' }}>
                <Typography variant="h6" color="error">
                    Você não tem permissão para acessar esta página.
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/dashboard')}>
                    Voltar para o Dashboard
                </Button>
            </Container>
        );
    }


    return (
        <Container maxWidth="lg" style={{ marginTop: '30px' }}>
            <Typography variant="h4" gutterBottom>
                Gerenciamento de Usuários
            </Typography>

            <Grid container spacing={3}>
                {/* COLUNA ESQUERDA: Formulário de Criação (APENAS ADMIN) */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Criar Novo Usuário
                    </Typography>
                    <UserForm 
                        sectors={sectors} 
                        onFinish={handleCloseModal}
                        // Não passamos currentUser, então este UserForm é para CRIAÇÃO
                    />
                </Grid>

                {/* COLUNA DIREITA: Lista de Usuários (APENAS ADMIN) */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Lista de Usuários
                    </Typography>
                    <UserList
                        users={users} 
                        onDelete={handleDeleteUser} 
                        onEdit={handleEditClick} 
                    />
                    
                    {/* 🚨 CORREÇÃO: Alinhamento do botão 'Voltar' 🚨 */}
                    <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/dashboard')} // Navega para o Dashboard
                        >
                            Voltar
                        </Button>
                    </Box>
                    {/* FIM DA CORREÇÃO */}
                </Grid>
            </Grid>
            
            {/* MODAL DE EDIÇÃO (APENAS ADMIN) */}
            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>
                    {editingUser ? 'Editar Usuário' : 'Criar Usuário'}
                </DialogTitle>
                <DialogContent>
                    <UserForm
                        sectors={sectors}
                        currentUser={editingUser}
                        onFinish={handleCloseModal}
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
}

export default UsuariosPage;