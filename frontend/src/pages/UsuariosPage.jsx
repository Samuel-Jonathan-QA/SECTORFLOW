// frontend/src/pages/UsuariosPage.jsx (VERSÃO FINAL COM RESTRIÇÃO DE TELA)

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent, Box } from '@mui/material'; 
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import API from '../api';
import { toast } from 'react-toastify';

// 🚨 NOVO: O componente agora deve receber a role 🚨
function UsuariosPage({ userRole }) { 
    const [users, setUsers] = useState([]);
    const [sectors, setSectors] = useState([]);
    
    // Estados para a Modal de Edição
    const [openModal, setOpenModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null); 

    // 🚨 1. LÓGICA CRÍTICA DE PERMISSÃO 🚨
    const canManageUsers = userRole === 'ADMIN';

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
            console.error('Erro ao buscar usuários:', error);
            toast.error('Não foi possível carregar a lista de usuários. Permissão negada.'); 
        }
    }, [canManageUsers]); // Depende de canManageUsers

    const fetchSectors = useCallback(async () => {
        try {
            // A busca de setores é feita para popular o formulário, mas é a rota /sectors
            // (que corrigimos para exigir autenticação, mas não restrição de role no GET)
            const res = await API.get('/sectors'); 
            setSectors(res.data);
        } catch (error) {
            console.error('Erro ao buscar setores:', error);
            // Isso pode ocorrer se o token expirar, por exemplo
            toast.error('Não foi possível carregar a lista de setores para formulário.');
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        // A busca de setores deve ocorrer sempre que a página carregar
        fetchSectors(); 
    }, [fetchUsers, fetchSectors]);

    // Lógica da Modal
    const handleEditClick = (user) => {
        setEditingUser(user);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingUser(null);
        fetchUsers(); // Recarrega a lista após fechar (seja por criação ou edição)
    };
    
    // Lógica de Deleção
    const handleDeleteUser = async (id) => {
        try {
            await API.delete(`/users/${id}`);
            fetchUsers();
            toast.success('Usuário deletado com sucesso!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao deletar usuário. Permissão insuficiente.');
        }
    };
    
    // ----------------------------------------------------
    // 🚨 2. RENDERIZAÇÃO CONDICIONAL DA TELA 🚨
    // ----------------------------------------------------
    if (!canManageUsers) {
        return (
            <Container maxWidth="md" style={{ marginTop: '50px', textAlign: 'center' }}>
                <Typography variant="h4" color="error" gutterBottom>
                    Acesso Negado
                </Typography>
                <Typography variant="h6">
                    Você não tem permissão de administrador para gerenciar usuários.
                </Typography>
            </Container>
        );
    }
    
    // Se for ADMIN, renderiza a tela de Gerenciamento completa
    return (
        <Container maxWidth="lg" style={{ marginTop: '30px' }}>
            <Typography variant="h4" gutterBottom>
                Gerenciamento de Usuários
            </Typography>

            <Grid container spacing={3}>
                {/* COLUNA ESQUERDA: Criação de Novo Usuário (APENAS ADMIN) */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Criar Novo Usuário
                    </Typography>
                    <UserForm 
                        sectors={sectors} 
                        onFinish={fetchUsers}
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