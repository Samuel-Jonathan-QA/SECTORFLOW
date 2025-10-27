import { useState, useEffect } from 'react';
import { Container, Typography, Grid } from '@mui/material'; 
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import API from '../api';
import { toast } from 'react-toastify';

// 🚨 NOVO: Recebe as props userRole e userSectorIds 🚨
function ProdutosPage({ loggedUser, userRole, userSectorIds }) {
    const [products, setProducts] = useState([]);
    const [allSectors, setAllSectors] = useState([]); // Renomeado para clareza
    const [userProducts, setUserProducts] = useState([]);
    
    // 🚨 1. Lógica de permissão de visualização 🚨
    const canManageProducts = userRole === 'ADMIN' || userRole === 'VENDEDOR';
    const isSeller = userRole === 'VENDEDOR';
    
    // 🚨 2. Define a lista de setores que o usuário PODE ver/usar 🚨
    const allowedSectors = isSeller
        ? allSectors.filter(sector => userSectorIds.includes(sector.id))
        : allSectors; // ADMIN vê todos

    const fetchProducts = async () => {
        // Esta chamada API já retorna os produtos FILTRADOS pelo Backend!
        const res = await API.get('/products');
        setProducts(res.data);
    };

    const fetchAllSectors = async () => {
        // Busca todos os setores, a filtragem visual é feita abaixo
        const res = await API.get('/sectors');
        setAllSectors(res.data);
    };

    // A função fetchUserProducts não é mais estritamente necessária, pois fetchProducts
    // já retorna a lista filtrada se o usuário for VENDEDOR.
    // Podemos simplificar e usar apenas a lista `products`.

    useEffect(() => {
        fetchProducts(); // Busca lista filtrada do Backend
        fetchAllSectors(); // Busca todos os setores
    }, [loggedUser]); // Roda sempre que o usuário logado mudar

    const handleDeleteProduct = async (id) => {
        try {
            await API.delete(`/products/${id}`);
            // Filtra a lista principal após deletar
            setProducts(products.filter(p => p.id !== id));
            toast.success('Produto deletado com sucesso!');
        } catch(error) {
            // O Backend deve retornar 403 se o Vendedor tentar deletar um produto de outro setor
            const errorMessage = error.response?.data?.error || 'Erro ao deletar produto.';
            toast.error(errorMessage);
        }
    };
    
    // Função unificada para refetch após adicionar/editar
    const handleProductAction = () => {
        fetchProducts();
    };

    return (
        <Container maxWidth="lg" style={{ marginTop: '30px' }}>
            <Typography variant="h4" gutterBottom>
                Gerenciamento de Produtos
            </Typography>

            <Grid container spacing={3}>
                {/* 🚨 3. EXIBIÇÃO CONDICIONAL DO FORMULÁRIO 🚨 */}
                {canManageProducts && (
                    <Grid item xs={12}>
                        <ProductForm 
                            // Passa apenas os setores permitidos para o Dropdown
                            sectors={allowedSectors} 
                            onAdd={handleProductAction} 
                            // Adicionar prop para lidar com edição, se houver
                        />
                    </Grid>
                )}

                {/* Lista de Produtos (já filtrada pelo Backend) */}
                <Grid item xs={12}>
                    <ProductList 
                        products={products} // Usa a lista filtrada do Backend
                        onDelete={handleDeleteProduct}
                        // 🚨 4. Passa a permissão para a lista esconder botões de DELETE/EDIT 🚨
                        userRole={userRole}
                        userSectorIds={userSectorIds}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}

export default ProdutosPage;