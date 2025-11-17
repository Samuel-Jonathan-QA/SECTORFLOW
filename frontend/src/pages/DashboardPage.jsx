import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, Grid, Paper, Typography, Box, Divider, 
    List, ListItem, ListItemText 
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import API from '../api'; 

import ProductList from '../components/ProductList'; 

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

    const fetchSectors = useCallback(async () => {
        try {
            const res = await API.get('/sectors');
            setSectors(res.data);
        } catch (error) {
            console.error('Erro ao buscar setores:', error);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await API.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await API.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        }
    }, []);

    const userRole = loggedUser?.role ? loggedUser.role.toUpperCase() : '';

    useEffect(() => {
        fetchSectors();

        if (userRole === 'ADMIN') {
            fetchUsers();
            fetchProducts();
        } else if (userRole === 'VENDEDOR' || userRole === 'USER') {
            fetchProducts();
        }
    }, [userRole, fetchSectors, fetchUsers, fetchProducts]);

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


    const baseCards = [
        { 
            label: 'Total de Produtos', 
            count: products.length, 
            path: '/products', 
            icon: InventoryIcon, 
            color: '#4caf50', 
            iconBg: '#e8f5e9' 
        },
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
                <Box textAlign="left" sx={{ zIndex: 2 }}> 
                    <Typography variant="body2" color="textSecondary" fontWeight="medium">
                        {card.label}
                    </Typography>
                    {renderCount()}
                </Box>
                
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

    const SectorListItem = ({ sector }) => (
        <ListItem sx={{ px: 0 }}>
            <DescriptionIcon sx={{ color: '#bdbdbd', mr: 2, fontSize: 20 }} />
            <ListItemText
                primary={<Typography variant="body1" fontWeight="medium">{sector.name}</Typography>}
            />
        </ListItem>
    );

    const latestProducts = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    const activeSectors = sectors.slice(0, 5);


    const showSectorsPanel = userRole !== 'VENDEDOR';
    const productGridSize = showSectorsPanel ? 7 : 12; 
    

    return (
        <Container maxWidth="xl" sx={{ pt: 3 }}>

            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {baseCards.map((card) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={card.label}>
                        <MetricCard card={card} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>

                <Grid item xs={12} md={productGridSize}>
                    <Typography variant="h5" fontWeight="medium" gutterBottom>
                        Produtos Recentes
                    </Typography>
                    
                    <ProductList
                        products={latestProducts}
                        sectors={sectors} 
                        
                        showControls={false} 
                        
                        hideActions={true} 
                        
                        height={410} 
                    />

                </Grid>

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