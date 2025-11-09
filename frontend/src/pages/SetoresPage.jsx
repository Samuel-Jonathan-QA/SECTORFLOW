// frontend/src/pages/SetoresPage.jsx (Padronizado com Modal de Edição e Botão Voltar)

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent, Box, Button } from '@mui/material';
import SectorForm from '../components/SectorForm';
import SectorList from '../components/SectorList';
import API from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// O componente deve receber a role
function SetoresPage({ userRole }) {
    const [sectors, setSectors] = useState([]);

    // Estados para a Modal de Edição
    const [openModal, setOpenModal] = useState(false);
    const [editingSector, setEditingSector] = useState(null);

    // HOOK DE NAVEGAÇÃO
    const navigate = useNavigate();

    // Lógica CRÍTICA de permissão (ADMIN) - ROBUSTO
    const canManageSectors = userRole && userRole.toUpperCase() === 'ADMIN';

    // Refatora a busca para incluir tratamento de erro e usar useCallback
    const fetchSectors = useCallback(async () => {
        // Se não for ADMIN, não faz a chamada (o backend bloquearia)
        if (!canManageSectors) {
            setSectors([]); // Garante que a lista está vazia
            return;
        }

        try {
            const res = await API.get('/sectors');
            setSectors(res.data);
        } catch (error) {
            console.error('Erro ao buscar setores:', error);
            toast.error('Não foi possível carregar a lista de setores. Permissão negada.');
        }
    }, [canManageSectors]); // Depende de canManageSectors

    
    useEffect(() => {
        fetchSectors();
    }, [canManageSectors]);


    // Lógica da Modal
    const handleEditClick = (sector) => {
        setEditingSector(sector);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingSector(null);
        fetchSectors(); // Recarrega a lista após fechar (criação ou edição)
    };

    // Lógica de Deleção
    const handleDeleteSector = async (id) => {
        try {
            await API.delete(`/sectors/${id}`);
            fetchSectors();
            toast.success('Setor deletado com sucesso!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao deletar setor. Permissão insuficiente.');
        }
    };

    // ----------------------------------------------------
    // RENDERIZAÇÃO CONDICIONAL DA TELA (Acesso Negado)
    // ----------------------------------------------------
    if (!canManageSectors) {
        return (
            <Container maxWidth="md" style={{ marginTop: '50px', textAlign: 'center' }}>
                <Typography variant="h4" color="error" gutterBottom>
                    Acesso Negado
                </Typography>
                <Typography variant="h6">
                    Você não tem permissão de administrador para gerenciar setores.
                </Typography>
            </Container>
        );
    }

    // Se for ADMIN, renderiza a tela de Gerenciamento completa
    return (
        <Container maxWidth="lg" style={{ marginTop: '30px' }}>
            
            {/* 🚨 CORREÇÃO: TÍTULO SEM O BOTÃO VOLTAR AO LADO 🚨 */}
            <Typography variant="h4" gutterBottom>
                Gerenciamento de Setores
            </Typography>
            {/* FIM DA CORREÇÃO */}

            <Grid container spacing={3}>
                {/* COLUNA ESQUERDA: Criação de Novo Setor */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Criar Novo Setor
                    </Typography>
                    <SectorForm
                        onFinish={handleCloseModal}
                    // Não passamos currentSector, então este SectorForm é para CRIAÇÃO
                    />
                </Grid>

                {/* COLUNA DIREITA: Lista de Setores */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Lista de Setores
                    </Typography>
                    <SectorList
                        sectors={sectors}
                        onDelete={handleDeleteSector}
                        onEdit={handleEditClick} // Passa o clique para abrir a modal de edição
                        userRole={userRole}
                    />
                    
                    {/* 🚨 NOVO: Alinhamento do botão 'Voltar' ABAIXO da lista 🚨 */}
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

            {/* MODAL DE EDIÇÃO */}
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