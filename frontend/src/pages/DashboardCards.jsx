import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function DashboardCards({ loggedUser }) {
    const navigate = useNavigate();

    // 🚨 1. EXTRAIR A ROLE DO USUÁRIO LOGADO 🚨
    const userRole = loggedUser?.user?.role;
    // Opcional: extrair sectorIds se o dashboard for mostrar dados filtrados
    // const userSectorIds = loggedUser?.user?.sectorIds || [];

    const [sectors, setSectors] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchData();
    }, [userRole]); // 🚨 Dependência adicionada para refetch se o usuário mudar a role (opcional)

    const fetchData = async () => {
        // Define quais endpoints buscar. Se não for ADMIN, não precisa buscar users/sectors.
        const endpoints = [];

        // 🚨 2. LÓGICA CONDICIONAL DE FETCH 🚨
        if (userRole === 'ADMIN') {
            endpoints.push(API.get('/sectors'));
            endpoints.push(API.get('/users'));
            // Assumindo que a rota de products lida com o filtro para o VENDEDOR
            endpoints.push(API.get('/products')); 
        } else if (userRole === 'VENDEDOR' || userRole === 'USER') {
            // Se for Vendedor, ele SÓ precisa buscar produtos (a contagem de users/sectors será 0)
            endpoints.push(API.get('/products'));
        }

        try {
            if (endpoints.length > 0) {
                const results = await Promise.all(endpoints);
                
                // Mapeia os resultados para os estados com base no que foi buscado
                if (userRole === 'ADMIN') {
                    setSectors(results[0].data);
                    setUsers(results[1].data);
                    setProducts(results[2].data);
                } else if (userRole === 'VENDEDOR' || userRole === 'USER') {
                    // Se só buscou produtos
                    setProducts(results[0].data);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };

    // 🚨 3. LÓGICA CONDICIONAL DOS CARDS 🚨
    const baseCards = [
        // Card de Setores e Usuários SÓ para ADMIN
        ...(userRole === 'ADMIN' ? [
            { label: 'Setores', count: sectors.length, path: '/sectors' },
            { label: 'Usuários', count: users.length, path: '/users' },
        ] : []),
        
        // Card de Produtos (visível para todos)
        { label: 'Produtos', count: products.length, path: '/products' },
    ];

    return (
        <Box sx={{ padding: 4 }}>
            {/* Boas-vindas */}
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Olá, {loggedUser?.user?.name || 'Usuário'}!
            </Typography>
            <Typography variant="subtitle1" gutterBottom color="textSecondary">
                Bem-vindo ao painel de controle. Aqui você acompanha rapidamente os principais indicadores.
            </Typography>

            {/* Cards */}
            <Grid container spacing={4} sx={{ marginTop: 2 }}>
                {/* Itera sobre a lista de cards JÁ FILTRADA */}
                {baseCards.map((card) => ( 
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