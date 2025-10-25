import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function DashboardCards({ loggedUser }) {
  const navigate = useNavigate();

  const [sectors, setSectors] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [secRes, userRes, prodRes] = await Promise.all([
        API.get('/sectors'),
        API.get('/users'),
        API.get('/products'),
      ]);
      setSectors(secRes.data);
      setUsers(userRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const cards = [
    { label: 'Setores', count: sectors.length, path: '/sectors' },
    { label: 'Usuários', count: users.length, path: '/users' },
    { label: 'Produtos', count: products.length, path: '/products' },
  ];

  return (
    <Box sx={{ padding: 4 }}>
      {/* Boas-vindas */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Olá, {loggedUser?.name || 'Usuário'}!
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="textSecondary">
        Bem-vindo ao painel de controle. Aqui você acompanha rapidamente os principais indicadores.
      </Typography>

      {/* Cards */}
      <Grid container spacing={4} sx={{ marginTop: 2 }}>
        {cards.map((card) => (
          <Grid item xs={12} sm={4} key={card.label}>
            <Paper
              elevation={3}
              sx={{
                padding: 4,
                textAlign: 'center',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: '#fff',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 6px 15px rgba(15, 118, 187, 0.31)',
                },
              }}
              onClick={() => navigate(card.path)}
            >
              <Typography
                variant="h6"
                gutterBottom
                fontWeight="medium"
                color="textPrimary"
              >
                {card.label}
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color="textPrimary"
              >
                {card.count}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default DashboardCards;
