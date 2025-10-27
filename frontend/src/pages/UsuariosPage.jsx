import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent } from '@mui/material'; 
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import API from '../api';
import { toast } from 'react-toastify';

function UsuariosPage() {
    const [users, setUsers] = useState([]);
    const [sectors, setSectors] = useState([]);
    
    // 🚨 NOVOS ESTADOS PARA A MODAL DE EDIÇÃO 🚨
    const [openModal, setOpenModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // Armazena o usuário selecionado para edição

    // Refatora a busca para incluir tratamento de erro e usar useCallback
    const fetchUsers = useCallback(async () => {
        try {
            const res = await API.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            // Melhor feedback ao usuário
            toast.error('Não foi possível carregar a lista de usuários.'); 
        }
    }, []); // Dependências vazias, só é criada uma vez

    const fetchSectors = useCallback(async () => {
        try {
            const res = await API.get('/sectors');
            setSectors(res.data);
        } catch (error) {
            console.error('Erro ao buscar setores:', error);
            toast.error('Não foi possível carregar a lista de setores.');
        }
    }, []); // Dependências vazias

    // Executa as buscas ao montar o componente
    useEffect(() => {
        fetchUsers();
        fetchSectors();
    }, [fetchUsers, fetchSectors]); // Dependências de useCallback

    // 🚨 LÓGICA DE EDIÇÃO 🚨
    const handleEditClick = (user) => {
        setEditingUser(user); // Define o usuário para preencher o formulário
        setOpenModal(true);   // Abre a modal
    };
    
    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingUser(null);
        fetchUsers(); // Recarrega a lista após fechar (seja após edição ou cancelamento)
    };

    const handleDeleteUser = async (id) => {
        try {
            await API.delete(`/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            toast.success('Usuário deletado com sucesso!');
        } catch (error) { // Adiciona tratamento de erro detalhado
            console.error('Erro ao deletar usuário:', error);
            toast.error('Erro ao deletar usuário.');
        }
    };

   return (
        <Container maxWidth="lg" style={{ marginTop: '30px' }}> {/* 🚨 MAX-WIDTH AUMENTADA PARA CABER AS COLUNAS 🚨 */}
            <Typography variant="h4" gutterBottom>
                Gerenciamento de Usuários
            </Typography>

            <Grid container spacing={2}> {/* Aumentei o espaçamento para 4 */}
                
                {/* 🚨 COLUNA ESQUERDA: Formulário de Criação 🚨 */}
                <Grid item xs={12} md={6}> 
                    <Typography variant="h5" gutterBottom>
                        Novo Usuário
                    </Typography>
                    <UserForm 
                        sectors={sectors} 
                        onFinish={fetchUsers}
                        // Não passamos currentUser, então este UserForm é para CRIAÇÃO
                    />
                </Grid>

                {/* 🚨 COLUNA DIREITA: Lista de Usuários 🚨 */}
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

            {/* 🚨 MODAL DE EDIÇÃO 🚨 */}
            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>{editingUser ? 'Editar Usuário' : 'Criar Usuário'}</DialogTitle>
                <DialogContent>
                    <UserForm 
                        sectors={sectors} 
                        // Passa o usuário para edição (será null para criação)
                        currentUser={editingUser} 
                        onFinish={handleCloseModal} // Fecha e recarrega após edição
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
}

export default UsuariosPage;