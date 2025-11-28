// frontend/src/pages/SetoresPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent, Box, Button, Divider, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; 
import SectorForm from '../components/SectorForm'; 
import SectorEditForm from '../components/SectorEditForm'; 
import SectorList from '../components/SectorList';
import API from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function SetoresPage({ userRole }) {
    const [sectors, setSectors] = useState([]);
    const [vendors, setVendors] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

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
            const res = await API.get('/sectors?include=vendors'); 
            setSectors(res.data);
        } catch (error) {
            console.error('Erro ao buscar setores:', error);
            toast.error('Não foi possível carregar a lista de setores.');
        }
    }, [canManageSectors]); 
    
    const fetchVendors = useCallback(async () => {
        if (!canManageSectors) {
            setVendors([]); 
            return;
        }
        try {
            const res = await API.get('/users?role=VENDEDOR'); 
            
            const onlyVendors = res.data.filter(user => 
                 user.role && user.role.toUpperCase() === 'VENDEDOR'
            );

            setVendors(onlyVendors);
            
        } catch (error) {
            console.error('Erro ao buscar vendedores:', error);
        }
    }, [canManageSectors]);


    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchSectors(), fetchVendors()]); 
            setIsLoading(false);
        };
        
        if (canManageSectors) {
             loadData();
        } else {
             setIsLoading(false);
        }
        
    }, [canManageSectors, fetchSectors, fetchVendors]);


    const handleCreateClick = () => {
        setEditingSector(null); 
        setOpenModal(true);
    };

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
        if (!window.confirm('Tem certeza que deseja deletar este setor? ATENÇÃO: Os produtos vinculados a este setor ficarão sem setor.')) return;
        try {
            await API.delete(`/sectors/${id}`);
            fetchSectors();
            toast.success('Setor deletado com sucesso!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao deletar setor. Verifique se há produtos ou usuários associados.');
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
    
    if (isLoading) {
          return (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                  <Typography variant="h6" sx={{ ml: 2 }}>Carregando dados...</Typography>
              </Box>
          );
    }

    return (
        <Container maxWidth="xl" sx={{ pt: 4, pb: 4 }}>

            <Divider sx={{ mb: 1 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="medium" component="span">
                    Lista de Setores
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClick}
                >
                    Criar Novo Setor
                </Button>
            </Box>

            <Grid item xs={12}>
                <SectorList
                    sectors={sectors}
                    onDelete={handleDeleteSector}
                    onEdit={handleEditClick} 
                    userRole={userRole}
                    key={sectors.length}
                />
            </Grid>

            <Dialog 
                open={openModal} 
                onClose={handleCloseModal} 
                fullWidth 
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingSector ? `Editar Setor: ${editingSector.name}` : 'Criar Novo Setor'}
                </DialogTitle>
                <DialogContent>
                    {editingSector ? (
                        <SectorEditForm
                            currentSector={editingSector}
                            onFinish={handleCloseModal}
                            existingSectors={sectors}
                            allVendors={vendors} 
                            key={`edit-${editingSector.id}`} 
                        />
                    ) : (
                        <SectorForm
                            onFinish={handleCloseModal}
                            existingSectors={sectors}
                            allVendors={vendors} 
                            key="create-sector"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
}

export default SetoresPage;