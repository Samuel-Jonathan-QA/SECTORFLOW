import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, Grid, Paper, Typography, Box, Divider, 
    List, ListItem, ListItemText 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API from '../api'; 

// Importa ícones para os Cards e Listas
import InventoryIcon from '@mui/icons-material/Inventory'; 
import CategoryIcon from '@mui/icons-material/Category'; 
import GroupIcon from '@mui/icons-material/Group'; 
import PaidIcon from '@mui/icons-material/Paid'; 
import DescriptionIcon from '@mui/icons-material/Description'; 
import LocalOfferIcon from '@mui/icons-material/LocalOffer'; 


function DashboardPage({ loggedUser }) {
    const navigate = useNavigate();
    const [sectors, setSectors] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);

    // Busca os dados de setores ativos.
    const fetchSectors = useCallback(async () => {
        try {
            const res = await API.get('/sectors');
            setSectors(res.data);
        } catch (error) {
            console.error('Erro ao buscar setores:', error);
        }
    }, []);

    // Busca a lista de usuários.
    const fetchUsers = useCallback(async () => {
        try {
            const res = await API.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    }, []);

    // Busca a lista de produtos.
    const fetchProducts = useCallback(async () => {
        try {
            const res = await API.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        }
    }, []);

    // Extrai a role do usuário logado.
    const userRole = loggedUser?.role ? loggedUser.role.toUpperCase() : '';

    // Carrega dados iniciais baseados na role: ADMIN carrega tudo, outros carregam produtos.
    useEffect(() => {
        if (userRole === 'ADMIN') {
            fetchSectors();
            fetchUsers();
            fetchProducts();
        } else if (userRole === 'VENDEDOR' || userRole === 'USER') {
            fetchProducts();
        }
    }, [userRole, fetchSectors, fetchUsers, fetchProducts]);

    // Calcula e formata o valor total de todos os produtos em estoque (BRL).
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


    // Define os cards de métricas no topo. Setores e Usuários ocultos para não-ADMINs.
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

    // Componente para renderizar um card de métrica individual.
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


    // Componente para exibir um item de produto na lista.
    const ProductListItem = ({ product }) => (
        <ListItem sx={{ px: 0 }}>
            <LocalOfferIcon sx={{ color: '#bdbdbd', mr: 2, fontSize: 20 }} />
            <ListItemText
                primary={<Typography variant="body1" fontWeight="medium">{product.name}</Typography>}
                secondary={
                    <Typography variant="body2" color="textSecondary"> 
                        {'Setor: '+ product.Sector?.name || 'Sem setor'}
                    </Typography>
                }
            />
            <Box textAlign="right">
                <Typography variant="body1" fontWeight="bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price || 0)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    {product.quantity || 0} un.
                </Typography>
            </Box>
        </ListItem>
    );

    // Componente para exibir um item de setor na lista.
    const SectorListItem = ({ sector }) => (
        <ListItem sx={{ px: 0 }}>
            <DescriptionIcon sx={{ color: '#bdbdbd', mr: 2, fontSize: 20 }} />
            <ListItemText
                primary={<Typography variant="body1" fontWeight="medium">{sector.name}</Typography>}
            />
        </ListItem>
    );

    // Filtra os 5 produtos mais recentes e os 5 setores mais recentes.
    const latestProducts = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    const activeSectors = sectors.slice(0, 5);


    // Lógica para visibilidade do painel de Setores (Oculto para VENDEDOR).
    const showSectorsPanel = userRole !== 'VENDEDOR';
    const productGridSize = showSectorsPanel ? 7 : 12; 


    return (
        <>
            {/* Bloco de Cabeçalho do Dashboard */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" fontWeight="900" sx={{ color: '#212121' }}>
                    Dashboard
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
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #f0f0f0', borderRadius: 2 }}>
                        <List disablePadding>
                            {latestProducts.map((product, index) => (
                                <Box key={product.id || index}>
                                    <ProductListItem product={product} />
                                    {index < latestProducts.length - 1 && <Divider component="li" />}
                                </Box>
                            ))}
                        </List>
                        {latestProducts.length === 0 && (
                            <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                                Nenhum produto encontrado.
                            </Typography>
                        )}
                    </Paper>
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
        </>
    );
}

export default DashboardPage;