// frontend/src/pages/SetoresPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent, Box, Button, Paper, Divider } from '@mui/material';
import SectorForm from '../components/SectorForm';
import SectorList from '../components/SectorList';
import API from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function SetoresPage({ userRole }) {
    const [sectors, setSectors] = useState([]);

    const [openModal, setOpenModal] = useState(false);
    const [editingSector, setEditingSector] = useState(null);

    const navigate = useNavigate();

    const canManageSectors = userRole && userRole.toUpperCase() === 'ADMIN';

    const fetchSectors = useCallback(async () => {
        if (!canManageSectors) {
            setSectors([]); 
            return;
        }

        try {
            const res = await API.get('/sectors');
            setSectors(res.data);
        } catch (error) {
            console.error('Erro ao buscar setores:', error);
            toast.error('Não foi possível carregar a lista de setores. Permissão negada.');
        }
    }, [canManageSectors]); 


    useEffect(() => {
        fetchSectors();
    }, [canManageSectors]);


    const handleEditClick = (sector) => {
        setEditingSector(sector);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingSector(null);
        fetchSectors(); 
    };

    const handleDeleteSector = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar este setor?')) return;
        try {
            await API.delete(`/sectors/${id}`);
            fetchSectors();
            toast.success('Setor deletado com sucesso!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao deletar setor. Permissão insuficiente.');
        }
    };

    if (!canManageSectors) {
        return (
            <Container maxWidth="md" style={{ marginTop: '50px', textAlign: 'center' }}>
                <Typography variant="h4" color="error" gutterBottom>
                    Acesso Negado
                </Typography>
                <Typography variant="h6">
                    Você não tem permissão de administrador para gerenciar setores.
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/dashboard')}>
                    Voltar para o Dashboard
                </Button>
            </Container>
        );
    }

    return (
            <Container maxWidth="xl" sx={{ pt: 4, pb: 4 }}>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom fontWeight="medium">
                            Criar Novo Setor
                        </Typography>
                        <SectorForm
                            onFinish={handleCloseModal}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom fontWeight="medium">
                            Lista de Setores
                        </Typography>
                        <SectorList
                            sectors={sectors}
                            onDelete={handleDeleteSector}
                            onEdit={handleEditClick} 
                            userRole={userRole}
                        />
                        
                    </Grid>
                </Grid>

                <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                    <DialogTitle>
                        {editingSector ? 'Editar Setor' : 'Criar Setor'}
                    </DialogTitle>
                    <DialogContent>
                        <SectorForm
                            currentSector={editingSector}
                            onFinish={handleCloseModal}
                        />
                    </DialogContent>
                </Dialog>
            </Container>
    );
}

export default SetoresPage;