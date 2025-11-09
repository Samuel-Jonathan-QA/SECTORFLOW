// frontend/src/pages/ProdutosPage.jsx (Padronizado com Modal de Edição)

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent, Box } from '@mui/material'; 
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import API from '../api';
import { toast } from 'react-toastify';

// Recebe as props userRole e userSectorIds
function ProdutosPage({ userRole, userSectorIds }) {
    const [products, setProducts] = useState([]);
    const [allSectors, setAllSectors] = useState([]);
    
    // Estados para a Modal de Edição
    const [openModal, setOpenModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); 
    
    // Lógica de permissão (robusta)
    const userRoleUpperCase = userRole ? userRole.toUpperCase() : '';
    const canManageProducts = userRoleUpperCase === 'ADMIN' || userRoleUpperCase === 'VENDEDOR';
    const isSeller = userRoleUpperCase === 'VENDEDOR';
    
    // Define a lista de setores que o usuário PODE usar no formulário
    const allowedSectors = isSeller
        ? allSectors.filter(sector => userSectorIds && userSectorIds.includes(sector.id))
        : allSectors; // ADMIN vê todos

    // Refatora a busca de produtos para usar useCallback
    const fetchProducts = useCallback(async () => {
        // Se não for VENDEDOR ou ADMIN, não faz a chamada
        if (!canManageProducts) {
            setProducts([]);
            return;
        }

        try {
            // Esta chamada API já retorna os produtos FILTRADOS pelo Backend!
            const res = await API.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            toast.error('Não foi possível carregar a lista de produtos.');
        }
    }, [canManageProducts]);

    // Refatora a busca de setores para usar useCallback
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

    // Lógica da Modal
    const handleEditClick = (product) => {
        setEditingProduct(product);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingProduct(null);
        fetchProducts(); // Recarrega a lista após fechar (criação ou edição)
    };

    // Lógica de Deleção
    const handleDeleteProduct = async (id) => {
        try {
            await API.delete(`/products/${id}`);
            fetchProducts();
            toast.success('Produto deletado com sucesso!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao deletar produto. Permissão insuficiente.');
        }
    };

    // ----------------------------------------------------
    // 🚨 RENDERIZAÇÃO CONDICIONAL DA TELA (Acesso Negado) 🚨
    // ----------------------------------------------------
    if (!canManageProducts) {
        return (
            <Container maxWidth="md" style={{ marginTop: '50px', textAlign: 'center' }}>
                <Typography variant="h4" color="error" gutterBottom>
                    Acesso Negado
                </Typography>
                <Typography variant="h6">
                    Você não tem permissão para gerenciar produtos.
                </Typography>
            </Container>
        );
    }

    // Se for ADMIN ou VENDEDOR, renderiza a tela de Gerenciamento completa
    return (
        <Container maxWidth="lg" style={{ marginTop: '30px' }}>
            <Typography variant="h4" gutterBottom>
                Gerenciamento de Produtos
            </Typography>

            <Grid container spacing={3}>
                {/* COLUNA ESQUERDA: Criação de Novo Produto */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Criar Novo Produto
                    </Typography>
                    <ProductForm 
                        sectors={allowedSectors} // Lista filtrada/completa
                        onFinish={handleCloseModal}
                        // Não passamos currentProduct, então este ProductForm é para CRIAÇÃO
                    />
                </Grid>

                {/* COLUNA DIREITA: Lista de Produtos */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Lista de Produtos
                    </Typography>
                    <ProductList 
                        products={products} 
                        onDelete={handleDeleteProduct}
                        onEdit={handleEditClick} // Passa o clique para abrir a modal de edição
                        userRole={userRole}
                        userSectorIds={userSectorIds}
                    />
                </Grid>
            </Grid>

            {/* MODAL DE EDIÇÃO */}
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
    );
}

export default ProdutosPage;