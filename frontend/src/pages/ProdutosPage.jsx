import { useState, useEffect } from 'react';
import { Container, Typography, Grid } from '@mui/material'; // Importado
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import API from '../api';
import { toast } from 'react-toastify';

function ProdutosPage({ loggedUser }) {
  const [products, setProducts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [userProducts, setUserProducts] = useState([]);

  const fetchProducts = async () => {
    const res = await API.get('/products');
    setProducts(res.data);
  };

  const fetchSectors = async () => {
    const res = await API.get('/sectors');
    setSectors(res.data);
  };

  const fetchUserProducts = async () => {
    if (loggedUser) {
      const res = await API.get(`/users/${loggedUser.id}/products`);
      setUserProducts(res.data);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSectors();
    fetchUserProducts();
  }, [loggedUser]);

  const handleDeleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      if (loggedUser) {
        setUserProducts(userProducts.filter(p => p.id !== id));
      } else {
        setProducts(products.filter(p => p.id !== id));
      }
      toast.success('Produto deletado com sucesso!');
    } catch {
      toast.error('Erro ao deletar produto.');
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '30px' }}>
      {/* TÍTULO ADICIONADO AQUI */}
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Produtos
      </Typography>

      <Grid container spacing={3}>
        {/* Formulário de Criação */}
        <Grid item xs={12}>
          <ProductForm sectors={sectors} onAdd={loggedUser ? fetchUserProducts : fetchProducts} />
        </Grid>

        {/* Lista de Produtos */}
        <Grid item xs={12}>
          <ProductList products={loggedUser ? userProducts : products} onDelete={handleDeleteProduct} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProdutosPage;