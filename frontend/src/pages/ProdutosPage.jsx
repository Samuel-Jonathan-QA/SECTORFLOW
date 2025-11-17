// frontend/src/pages/ProdutosPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent, Box, Button, Paper, Divider } from '@mui/material';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import API from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function ProdutosPage({ userRole, userSectorIds }) {
    const [products, setProducts] = useState([]);
    const [allSectors, setAllSectors] = useState([]);

    const [openModal, setOpenModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const navigate = useNavigate();

    const userRoleUpperCase = userRole ? userRole.toUpperCase() : '';
    const canManageProducts = userRoleUpperCase === 'ADMIN' || userRoleUpperCase === 'VENDEDOR';
    const isSeller = userRoleUpperCase === 'VENDEDOR';

    const allowedSectors = isSeller
        ? allSectors.filter(sector => userSectorIds && userSectorIds.includes(sector.id))
        : allSectors; 

    const fetchProducts = useCallback(async () => {
        if (!canManageProducts) {
            setProducts([]);
            return;
        }

        try {
            const res = await API.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            toast.error('Não foi possível carregar a lista de produtos.');
        }
    }, [canManageProducts]);

    const fetchAllSectors = useCallback(async () => {
        try {
            const res = await API.get('/sectors');
            setAllSectors(res.data);
        } catch (error) {
            console.error('Erro ao buscar setores:', error);
            toast.error('Não foi possível carregar a lista de setores para formulário.');
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchAllSectors();
    }, [fetchProducts, fetchAllSectors]);

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingProduct(null);
        fetchProducts(); 
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;
        try {
            await API.delete(`/products/${id}`);
            fetchProducts();
            toast.success('Produto deletado com sucesso!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao deletar produto. Permissão insuficiente.');
        }
    };

    if (!canManageProducts) {
        return (
            <Container maxWidth="md" style={{ marginTop: '50px', textAlign: 'center' }}>
                <Typography variant="h4" color="error" gutterBottom>
                    Acesso Negado
                </Typography>
                <Typography variant="h6">
                    Você não tem permissão para gerenciar produtos.
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

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom fontWeight="medium">
                            Criar Novo Produto
                        </Typography>
                        <ProductForm
                            sectors={allowedSectors} 
                            onFinish={handleCloseModal}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom fontWeight="medium">
                            Lista de Produtos
                        </Typography>
                        <ProductList
                            products={products}
                            sectors={allSectors} 
                            onDelete={handleDeleteProduct}
                            onEdit={handleEditClick} 
                            userRole={userRole}
                            userSectorIds={userSectorIds}
                        />
                        
                    </Grid>
                </Grid>

                <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                    <DialogTitle>
                        {editingProduct ? 'Editar Produto' : 'Criar Produto'}
                    </DialogTitle>
                    <DialogContent>
                        <ProductForm
                            sectors={allowedSectors}
                            currentProduct={editingProduct} 
                            onFinish={handleCloseModal}
                        />
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
}

export default ProdutosPage;