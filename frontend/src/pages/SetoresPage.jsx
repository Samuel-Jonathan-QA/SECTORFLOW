import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent, Box, Button, Paper, Divider, CircularProgress } from '@mui/material';
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

    // Função para buscar a lista de setores
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
    
    // ✅ CORRIGIDO: Função para buscar e FILTRAR explicitamente APENAS usuários VENDEDOR
    const fetchVendors = useCallback(async () => {
        if (!canManageSectors) {
            setVendors([]); 
            return;
        }
        try {
            // Mantém o parâmetro para otimizar a busca no backend, mas não confiamos nele
            const res = await API.get('/users?role=VENDEDOR'); 
            
            // **FILTRO DE SEGURANÇA**: Garante que apenas usuários com role 'VENDEDOR' (em maiúsculas) sejam usados
            const onlyVendors = res.data.filter(user => 
                 user.role && user.role.toUpperCase() === 'VENDEDOR'
            );

            setVendors(onlyVendors);
            
        } catch (error) {
            console.error('Erro ao buscar vendedores:', error);
            toast.error('Não foi possível carregar a lista de vendedores para edição.');
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

            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom fontWeight="medium">
                        Criar Setor
                    </Typography>
                    <SectorForm
                        onFinish={handleCloseModal}
                        existingSectors={sectors} 
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
                    {editingSector ? `Editar Setor: ${editingSector.name}` : 'Ação Inválida'}
                </DialogTitle>
                <DialogContent>
                    {editingSector ? (
                        <SectorEditForm
                            currentSector={editingSector}
                            onFinish={handleCloseModal}
                            existingSectors={sectors}
                            allVendors={vendors} 
                        />
                    ) : (
                         <Typography>Nenhum setor selecionado para edição.</Typography>
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
}

export default SetoresPage;