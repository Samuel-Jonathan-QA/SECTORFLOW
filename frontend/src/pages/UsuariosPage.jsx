// frontend/src/pages/UsuariosPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent, Button, Box, Paper, Divider } from '@mui/material';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import API from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function UsuariosPage({ userRole }) {
    const [users, setUsers] = useState([]);
    const [sectors, setSectors] = useState([]);

    const [openModal, setOpenModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const navigate = useNavigate();

    const canManageUsers = userRole && userRole.toUpperCase() === 'ADMIN';

    const fetchUsers = useCallback(async () => {
        if (!canManageUsers) {
            setUsers([]); 
            return;
        }

        try {
            const res = await API.get('/users');
            setUsers(res.data);
        } catch (error) {
            toast.error('Não foi possível carregar a lista de usuários.');
        }
    }, [canManageUsers]); 

    const fetchAllSectors = useCallback(async () => {
        try {
            const res = await API.get('/sectors');
            setSectors(res.data);
        } catch (error) {
            toast.error('Não foi possível carregar a lista de setores.');
        }
    }, []);

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
        fetchUsers(); 
    };

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
        <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', width: '100%' }}>
            <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#212121' }}>
                        Gerenciamento de Usuários
                    </Typography>
                   
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom fontWeight="medium">
                            Criar Novo Usuário
                        </Typography>
                        <UserForm
                            sectors={sectors}
                            onFinish={handleCloseModal}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom fontWeight="medium">
                            Lista de Usuários
                        </Typography>
                        <UserList
                            users={users}
                            onDelete={handleDeleteUser}
                            onEdit={handleEditClick}
                        />
                       
                    </Grid>
                </Grid>

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
        </Box>
    );
}

export default UsuariosPage;