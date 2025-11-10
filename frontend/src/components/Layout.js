// frontend/src/components/Layout.js (O Hub Central com Menu Lateral Fixo - Cores Ajustadas)

import React from 'react';
import {
    Box, List, ListItem, ListItemText, ListItemIcon, Typography,
    Button, CssBaseline, Container, Divider // Adicionei Divider aqui para a separação
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api'; 

// Ícones
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory'; // Produtos
import CategoryIcon from '@mui/icons-material/Category'; // Setores
import GroupIcon from '@mui/icons-material/Group'; // Usuários
import SectorFlowLogo from '../assets/logo1.png'; 

// Largura fixa para o menu lateral
const drawerWidth = 200;

// ----------------------------------------------------
// SUBCOMPONENTE: Menu Lateral (Sidebar)
// ----------------------------------------------------
const Sidebar = ({ userRole, loggedUser, handleLogout, navigate }) => {

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon, roles: ['ADMIN', 'VENDEDOR', 'USER'] },
        { name: 'Produtos', path: '/products', icon: InventoryIcon, roles: ['ADMIN', 'VENDEDOR', 'USER'] },
        ...(userRole === 'ADMIN' ? [
            { name: 'Setores', path: '/sectors', icon: CategoryIcon, roles: ['ADMIN'] },
            { name: 'Usuários', path: '/users', icon: GroupIcon, roles: ['ADMIN'] },
        ] : []),
    ];

    // Definindo cores para o menu lateral e seus elementos
    const sidebarBg = '#ffffff'; // Fundo branco, combinando com o fundo do conteúdo
    const textColor = '#424242'; // Cinza escuro para o texto normal
    const primaryColor = '#187bbd'; // Azul primário do seu tema
    const hoverBg = '#e3f2fd'; // Um azul bem claro para o hover (ou '#f5f5f5' para cinza claro)
    const iconColor = primaryColor; // Ícones na cor primária

    return (
        <Box
            component="nav"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                position: 'fixed',
                height: '100%',
                bgcolor: sidebarBg, // Fundo branco
                color: textColor, // Cor do texto principal
                boxShadow: '4px 0 10px rgba(0, 0, 0, 0.05)', // Sombra mais sutil
                zIndex: 1200,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #e0e0e0', // Borda sutil à direita
            }}
        >
            {/* 1. Logo/Título da Plataforma */}
            <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
                <img src={SectorFlowLogo} alt="SectorFlow Logo" style={{ height: '100px' }} />
                <Typography variant="h6" fontWeight="bold" sx={{ color: primaryColor }}> {/* Título com a cor primária */}
                     SectorFlow
                </Typography>
                <Typography variant="caption" color={textColor}>
                    Gestão Completa
                </Typography>
            </Box>

            {/* 2. Lista de Navegação */}
            <List sx={{ flexGrow: 1, p: 1 }}>
                {navItems.map((item) => (
                    <ListItem
                        button
                        key={item.name}
                        onClick={() => navigate(item.path)}
                        sx={{
                            borderRadius: 1.5,
                            '&:hover': { bgcolor: hoverBg }, // Cor de hover mais suave
                            mb: 0.5
                        }}
                    >
                        <ListItemIcon>
                            <item.icon sx={{ color: iconColor }} /> {/* Ícones na cor primária */}
                        </ListItemIcon>
                        <ListItemText primary={<Typography variant="body2" sx={{ color: textColor }}>{item.name}</Typography>} />
                    </ListItem>
                ))}
            </List>

            {/* 3. Usuário e Logout */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="body2" fontWeight="bold" noWrap sx={{ color: textColor }}>
                    {loggedUser?.name || 'Usuário'}
                </Typography>
                <Typography variant="caption" color="textSecondary" gutterBottom> {/* Usando textSecondary padrão do tema */}
                    {userRole === 'ADMIN' ? 'Administrador' : (userRole || 'Função não definida')}
                </Typography>
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                        mt: 1,
                        bgcolor: primaryColor, // Botão Sair com a cor primária
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                            bgcolor: '#1565c0', // Um tom mais escuro da cor primária no hover
                        },
                    }}
                >
                    Sair
                </Button>
            </Box>
        </Box>
    );
};

// ----------------------------------------------------
// COMPONENTE PRINCIPAL: Layout (O Hub)
// ----------------------------------------------------
function Layout({ loggedUser, setLoggedUser, children }) {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        setLoggedUser(null);
        navigate('/');
    };

    const userRole = loggedUser?.role ? loggedUser.role.toUpperCase() : '';

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}> {/* Mantido o #fafafa */}
            <CssBaseline />
            
            <Sidebar
                userRole={userRole}
                loggedUser={loggedUser}
                handleLogout={handleLogout}
                navigate={navigate}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: `${drawerWidth}px`,
                    width: `calc(100% - ${drawerWidth}px)`
                }}
            >
                <Container maxWidth="xl" sx={{ pt: 3, pb: 4 }}>
                    {children}
                </Container>
            </Box>
        </Box>
    );
}

export default Layout;