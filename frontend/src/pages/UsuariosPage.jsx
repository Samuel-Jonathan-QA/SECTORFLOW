import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, Grid, Dialog, DialogTitle,
    DialogContent, Button, Box, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import API from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { setUserListUpdateCallback, updateLoggedUserGlobally } from '../App';

function UsuariosPage({ loggedUser, userRole }) {
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
            const res = await API.get('/users?include=sectors');
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
        fetchAllSectors();

        setUserListUpdateCallback(fetchUsers);

        return () => {
            setUserListUpdateCallback(null);
        };
    }, [fetchUsers, fetchAllSectors]);

    const handleDeleteUser = async (id) => {
        try {
            await API.delete(`/users/${id}`);
            setUsers(currentUsers => currentUsers.filter(user => user.id !== id));
            toast.success('Usuário deletado com sucesso!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao deletar usuário.');
        }
    };

    const handleCreateClick = () => {
        setEditingUser(null);
        setOpenModal(true);
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setOpenModal(true);
    };
    
    const handleUserUpdateInList = useCallback((updatedUser) => {
        setUsers(currentUsers => {
            const index = currentUsers.findIndex(user => user.id === updatedUser.id);
            if (index !== -1) {
                return currentUsers.map(user =>
                    user.id === updatedUser.id ? { ...user, ...updatedUser } : user
                );
            } else {
                return [updatedUser, ...currentUsers];
            }
        });

        if (loggedUser && updatedUser.id === loggedUser.id) {
            updateLoggedUserGlobally(updatedUser);
        }
        
        setOpenModal(false);
        setEditingUser(null);
        toast.success(editingUser ? 'Usuário editado com sucesso!' : 'Usuário criado com sucesso!');
    }, [editingUser, loggedUser]);


    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingUser(null);
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
        <Container maxWidth="xl">

            <Divider sx={{ mb: 1 }} />
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" gutterBottom fontWeight="medium" component="span">
                        Lista de Usuários
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleCreateClick}
                    >
                        Criar Novo Usuário
                    </Button>
                </Box>
                <UserList
                    users={users}
                    onDelete={handleDeleteUser}
                    onEdit={handleEditClick}
                    loggedInUser={loggedUser}
                />
            </Grid>

            <Dialog
                open={openModal}
                disableEscapeKeyDown={true}
                onClose={(event, reason) => {
                    if (reason === 'backdropClick') {
                        return; 
                    }

                    handleCloseModal();
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
                </DialogTitle>
                <DialogContent
                    sx={{ paddingBottom: '0px !important' }}
                >
                    <Box sx={{ pt: 1 }}>
                        <UserForm
                            key={editingUser ? editingUser.id : 'create-new'}
                            sectors={sectors}
                            currentUser={editingUser}
                            onFinish={handleCloseModal} 
                            onUserUpdate={handleUserUpdateInList}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </Container>
    );
}

export default UsuariosPage;