// frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, Grid, Paper, Typography, Box, Divider, 
    List, ListItem, ListItemText 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API from '../api'; 

import ProductList from '../components/ProductList'; 

// Importa ícones para os Cards
import InventoryIcon from '@mui/icons-material/Inventory'; 
import CategoryIcon from '@mui/icons-material/Category'; 
import GroupIcon from '@mui/icons-material/Group'; 
import PaidIcon from '@mui/icons-material/Paid'; 
import DescriptionIcon from '@mui/icons-material/Description'; 

function DashboardPage({ loggedUser }) {
    const navigate = useNavigate();
    const [sectors, setSectors] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);

    // Busca dados de setores ativos da API
    const fetchSectors = useCallback(async () => {
        try {
            const res = await API.get('/sectors');
            setSectors(res.data);
        } catch (error) {
            console.error('Erro ao buscar setores:', error);
        }
    }, []);

    // Busca a lista de usuários da API
    const fetchUsers = useCallback(async () => {
        try {
            const res = await API.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    }, []);

    // Busca a lista de produtos da API
    const fetchProducts = useCallback(async () => {
        try {
            const res = await API.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        }
    }, []);

    // Extrai a role do usuário logado
    const userRole = loggedUser?.role ? loggedUser.role.toUpperCase() : '';

    // Carrega dados iniciais baseados na role
    useEffect(() => {
        // ✅ CORREÇÃO: Chamando fetchSectors() para todos para que o ProductList possa exibir o nome do setor
        fetchSectors();

        if (userRole === 'ADMIN') {
            fetchUsers();
            fetchProducts();
        } else if (userRole === 'VENDEDOR' || userRole === 'USER') {
            fetchProducts();
        }
    }, [userRole, fetchSectors, fetchUsers, fetchProducts]);

    // Calcula e formata o valor total dos produtos em estoque (BRL)
    const calculateStockValue = () => {
        const totalValue = products.reduce((acc, product) => {
            const price = parseFloat(product.price || 0);
            const quantity = parseInt(product.quantity || 0, 10);
            return acc + (price * quantity);
        }, 0);

        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(totalValue);
    };

    const totalStockValueFormatted = calculateStockValue();


    // Define os cards de métricas no topo
    const baseCards = [
        { 
            label: 'Total de Produtos', 
            count: products.length, 
            path: '/products', 
            icon: InventoryIcon, 
            color: '#4caf50', 
            iconBg: '#e8f5e9' 
        },
        // Cards de Setores e Usuários (apenas para ADMIN)
        ...(userRole === 'ADMIN' ? [
            { 
                label: 'Total de Setores', 
                count: sectors.length, 
                path: '/sectors', 
                icon: CategoryIcon, 
                color: '#8e24aa', 
                iconBg: '#f3e5f5' 
            },
            { 
                label: 'Total de Usuários', 
                count: users.length, 
                path: '/users', 
                icon: GroupIcon, 
                color: '#ff9800', 
                iconBg: '#fff3e0' 
            },
        ] : []),

        {
            label: 'Valor em Estoque', 
            count: totalStockValueFormatted, 
            path: '/products', 
            isCurrency: true, 
            icon: PaidIcon, 
            color: '#00bcd4', 
            iconBg: '#e0f7fa' 
        },
    ];

    // Componente para renderizar um card de métrica individual
    const MetricCard = ({ card }) => {
        const renderCount = () => {
            const fontSize = card.isCurrency ? '1.5rem' : '1.5rem';
            
            return (
                <Typography 
                    variant="h3" 
                    fontWeight="bold" 
                    sx={{ fontSize: fontSize, mt: 1.5, color: '#212121' }} 
                >
                    {card.count}
                </Typography>
            );
        };
        
        const hoverShadow = `0 5px 15px ${card.color}40`;

        return (
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative', 
                    overflow: 'hidden', 
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: hoverShadow,
                        border: '1px solid transparent',
                    },
                }}
            >
                {/* Conteúdo do Card */}
                <Box textAlign="left" sx={{ zIndex: 2 }}> 
                    <Typography variant="body2" color="textSecondary" fontWeight="medium">
                        {card.label}
                    </Typography>
                    {renderCount()}
                </Box>
                
                {/* Ícone posicionado no canto superior direito */}
                <Box sx={{
                    width: 80, height: 80, 
                    borderRadius: '50%', 
                    backgroundColor: card.iconBg,
                    position: 'absolute', 
                    top: -15,  
                    right: -15, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    zIndex: 1, 
                    
                    '&::before': { content: '""', position: 'absolute', width: '120%', height: '120%', 
                        borderRadius: '50%', opacity: 0.5, backgroundColor: card.iconBg, zIndex: 0,
                    }
                }}>
                    <card.icon sx={{ fontSize: 30, color: card.color, zIndex: 2 }} />
                </Box>
            </Paper>
        );
    };

    // Componente para exibir um item de setor na lista
    const SectorListItem = ({ sector }) => (
        <ListItem sx={{ px: 0 }}>
            <DescriptionIcon sx={{ color: '#bdbdbd', mr: 2, fontSize: 20 }} />
            <ListItemText
                primary={<Typography variant="body1" fontWeight="medium">{sector.name}</Typography>}
            />
        </ListItem>
    );

    // Filtra os 4 produtos mais recentes
    const latestProducts = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    // Filtra os 5 setores mais recentes/ativos
    const activeSectors = sectors.slice(0, 5);


    // Lógica para visibilidade do painel de Setores (Oculto para VENDEDOR)
    const showSectorsPanel = userRole !== 'VENDEDOR';
    const productGridSize = showSectorsPanel ? 7 : 12; 
    
    // Lógica: Saudação personalizada
    const firstName = loggedUser?.name ? loggedUser.name.split(' ')[0] : 'Usuário(a)';
    const greetingText = `Olá, ${firstName}!`;


    return (
        <Container maxWidth="xl" sx={{ pt: 3 }}>
            
            {/* Bloco de Cabeçalho do Dashboard (Separado em Título e Saudação) */}
            <Box mb={2}>
                <Typography variant="h4" fontWeight="900" sx={{ color: '#212121' }}>
                    Dashboard
                </Typography>
                {/* Subtítulo da Saudação, mais suave e amigável */}
                <Typography variant="h6" color="textSecondary" fontWeight="regular" sx={{ mt: 0.5 }}>
                    {greetingText} — Veja suas métricas e atividades recentes.
                </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* PRIMEIRA LINHA: CARDS DE MÉTRICAS */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {baseCards.map((card) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={card.label}>
                        <MetricCard card={card} />
                    </Grid>
                ))}
            </Grid>

            {/* SEGUNDA LINHA: PRODUTOS RECENTES E SETORES ATIVOS */}
            <Grid container spacing={3}>

                {/* Painel de Produtos Recentes */}
                <Grid item xs={12} md={productGridSize}>
                    <Typography variant="h5" fontWeight="medium" gutterBottom>
                        Produtos Recentes
                    </Typography>
                    
                    <ProductList
                        products={latestProducts}
                        sectors={sectors} // Agora a lista 'sectors' não estará vazia
                        
                        // Oculta campos de busca e filtro por setores
                        showControls={false} 
                        
                        // Oculta os botões de ação (Edição/Exclusão)
                        hideActions={true} 
                        
                        height={410} 
                    />

                </Grid>

                {/* Painel de Setores Ativos (Oculto para VENDEDOR) */}
                {showSectorsPanel && (
                    <Grid item xs={12} md={5}>
                        <Typography variant="h5" fontWeight="medium" gutterBottom>
                            Setores Ativos
                        </Typography>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid #f0f0f0', borderRadius: 2 }}>
                            <List disablePadding>
                                {activeSectors.map((sector, index) => (
                                    <Box key={sector.id || index}>
                                        <SectorListItem sector={sector} />
                                        {index < activeSectors.length - 1 && <Divider component="li" />}
                                    </Box>
                                ))}
                            </List>
                            {activeSectors.length === 0 && (
                                <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                                    Nenhum setor ativo encontrado.
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}

export default DashboardPage;