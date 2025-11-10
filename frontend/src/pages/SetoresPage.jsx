// frontend/src/pages/SetoresPage.jsx (Padronizado com o NOVO LAYOUT)

import React, { useState, useEffect, useCallback } from 'react';
// ✅ IMPORTANDO PAPER E DIVIDER
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent, Box, Button, Paper, Divider } from '@mui/material';
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
        if (!window.confirm('Tem certeza que deseja deletar este setor?')) return;
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
        // Mantido o estilo simples, porém centralizado
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

    // Se for ADMIN, renderiza a tela de Gerenciamento completa
    return (
        // ✅ 1. APLICANDO O FUNDO CINZA CLARO NA RAIZ
        <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', width: '100%' }}>
            {/* ✅ 2. AJUSTANDO PADDING DO CONTAINER */}
            <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>

                {/* ✅ 3. CABEÇALHO UNIFICADO (Título h3 forte + Botão Voltar) */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#212121' }}>
                        Gerenciamento de Setores
                    </Typography>
                   
                </Box>

                {/* ✅ 3. SEPARADOR */}
                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    {/* COLUNA ESQUERDA: Criação de Novo Setor */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom fontWeight="medium">
                            Criar Novo Setor
                        </Typography>
                        {/* ✅ 4. APLICANDO O PAPER (BRANCO, SEM ELEVATION, COM BORDA SUTIL) */}
                        <SectorForm
                            onFinish={handleCloseModal}
                        // Não passamos currentSector, então este SectorForm é para CRIAÇÃO
                        />
                    </Grid>

                    {/* COLUNA DIREITA: Lista de Setores */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom fontWeight="medium">
                            Lista de Setores
                        </Typography>
                        <SectorList
                            sectors={sectors}
                            onDelete={handleDeleteSector}
                            onEdit={handleEditClick} // Passa o clique para abrir a modal de edição
                            userRole={userRole}
                        />
                        
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
        </Box>
    );
}

export default SetoresPage;