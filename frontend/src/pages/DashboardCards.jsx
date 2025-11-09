import React, { useState, useEffect } from 'react';
// 🚨 Importações do MUI: Adicionado 'Button' 🚨
import { Grid, Paper, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// 🚨 Importações de API: Adicionado 'logout' 🚨
import API, { logout } from '../api';

// O componente agora DEVE receber setLoggedUser do componente pai (App.js)
function DashboardCards({ loggedUser, setLoggedUser }) {
    const navigate = useNavigate();

    // 🚨 Função de Logout 🚨
    const handleLogout = () => {
        logout();             // Limpa o token e headers (do api.js)
        setLoggedUser(null);  // Limpa o estado global do usuário logado
        navigate('/');        // Redireciona para a página inicial (que deve mostrar o login)
    };

    // 🚨 1. EXTRAIR A ROLE DO USUÁRIO LOGADO - CORRIGIDO 🚨
    // A role está no nível principal do objeto loggedUser
    const userRole = loggedUser?.role; // <--- CORREÇÃO AQUI

    const [sectors, setSectors] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchData();
    }, [userRole]);

    const fetchData = async () => {
        const endpoints = [];

        // 🚨 2. LÓGICA CONDICIONAL DE FETCH 🚨
        if (userRole === 'ADMIN') {
            endpoints.push(API.get('/sectors'));
            endpoints.push(API.get('/users'));
            endpoints.push(API.get('/products'));
        } else if (userRole === 'VENDEDOR' || userRole === 'USER') {
            endpoints.push(API.get('/products'));
        }

        try {
            if (endpoints.length > 0) {
                const results = await Promise.all(endpoints);

                if (userRole === 'ADMIN') {
                    setSectors(results[0].data);
                    setUsers(results[1].data);
                    setProducts(results[2].data);
                } else if (userRole === 'VENDEDOR' || userRole === 'USER') {
                    setProducts(results[0].data);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };

    // 🚨 3. LÓGICA CONDICIONAL DOS CARDS 🚨
    const baseCards = [
        ...(userRole === 'ADMIN' ? [
            { label: 'Setores', count: sectors.length, path: '/sectors' },
            { label: 'Usuários', count: users.length, path: '/users' },
        ] : []),

        { label: 'Produtos', count: products.length, path: '/products' },
    ];

    return (
        <Box sx={{ padding: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                {/* Boas-vindas */}
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Olá, {loggedUser?.name || 'Usuário'}! {/* Também ajustei a extração do nome por segurança */}
                </Typography>

                {/* 🚨 BOTÃO DE LOGOUT 🚨 */}
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleLogout}
                    size="large"
                >
                    Sair
                </Button>
            </Box>

            <Typography variant="subtitle1" gutterBottom color="textSecondary">
                Bem-vindo ao painel de controle. Aqui você acompanha rapidamente os principais indicadores.
            </Typography>

            {/* Cards */}
            <Grid container spacing={4} sx={{ marginTop: 2 }}>
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