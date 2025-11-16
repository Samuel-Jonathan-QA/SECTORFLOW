import React from 'react';
import {
    Box, List, ListItem, ListItemText, ListItemIcon, Typography,
    Button, CssBaseline, Container, Divider, Avatar 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../api'; 

import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory'; 
import CategoryIcon from '@mui/icons-material/Category'; 
import GroupIcon from '@mui/icons-material/Group'; 
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SectorFlowLogo from '../assets/logo1.png'; 

const drawerWidth = 200;
const BACKEND_URL = 'http://localhost:3001'; 

const Sidebar = ({ userRole, loggedUser, handleLogout, navigate }) => {
    
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon, roles: ['ADMIN', 'VENDEDOR', 'USER'] },
        { name: 'Produtos', path: '/products', icon: InventoryIcon, roles: ['ADMIN', 'VENDEDOR', 'USER'] },
        ...(userRole === 'ADMIN' ? [
            { name: 'Setores', path: '/sectors', icon: CategoryIcon, roles: ['ADMIN'] },
            { name: 'Usuários', path: '/users', icon: GroupIcon, roles: ['ADMIN'] },
        ] : []),
    ];

    const sidebarBg = '#ffffff'; 
    const textColor = '#424242'; 
    const primaryColor = '#187bbd'; 
    const hoverBg = '#e3f2fd'; 
    const activeBg = primaryColor + '20';
    const activeIconColor = primaryColor;
    const iconColor = primaryColor;

    return (
        <Box
            component="nav"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                position: 'fixed',
                height: '100%',
                bgcolor: sidebarBg, 
                color: textColor, 
                boxShadow: '4px 0 10px rgba(0, 0, 0, 0.05)', 
                zIndex: 1200,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #e0e0e0', 
            }}
        >
            <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
                <img src={SectorFlowLogo} alt="SectorFlow Logo" style={{ height: '100px' }} />
                <Typography variant="h6" fontWeight="bold" sx={{ color: primaryColor }}> 
                    SectorFlow
                </Typography>
                <Typography variant="caption" color={textColor}>
                    Gestão Setorizada
                </Typography>
            </Box>

            <List sx={{ flexGrow: 1, p: 1 }}>
                {navItems.map((item) => {
                    
                    const isActive = currentPath === item.path;

                    return (
                        <ListItem
                            button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: 1.5,
                                bgcolor: isActive ? activeBg : 'transparent',
                                '&:hover': { 
                                    bgcolor: isActive ? activeBg : hoverBg,
                                }, 
                                mb: 0.5
                            }}
                        >
                            <ListItemIcon>
                                <item.icon sx={{ color: isActive ? activeIconColor : iconColor }} /> 
                            </ListItemIcon>
                            <ListItemText 
                                primary={
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: isActive ? primaryColor : textColor,
                                            fontWeight: isActive ? 'bold' : 'normal'
                                        }}
                                    >
                                        {item.name}
                                    </Typography>
                                } 
                            />
                        </ListItem>
                    );
                })}
            </List>

            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="body2" fontWeight="bold" noWrap sx={{ color: textColor }}>
                    {loggedUser?.name || 'Usuário'}
                </Typography>
                <Typography variant="caption" color="textSecondary" gutterBottom> 
                    {userRole === 'ADMIN' ? 'Administrador' : (userRole || 'Função não definida')}
                </Typography>
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                        mt: 1,
                        bgcolor: primaryColor, 
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                            bgcolor: '#1565c0', 
                        },
                    }}
                >
                    Sair
                </Button>
            </Box>
        </Box>
    );
};

const UserHeader = ({ loggedUser }) => {
    const profileSrc = loggedUser?.profilePicture 
        ? `${BACKEND_URL}${loggedUser.profilePicture}` 
        : undefined;
    
    const firstName = loggedUser?.name ? loggedUser.name.split(' ')[0] : 'Usuário';

    return (
        <Box 
            sx={{
                position: 'absolute', 
                top: 15,
                right: 30,
                zIndex: 1000, 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer', 
                p: 1,
                borderRadius: 999,
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
            }}
        >
            <Avatar 
                src={profileSrc} 
                sx={{ width: 40, height: 40, bgcolor: '#bdbdbd', fontSize: 18 }}
            >
                {!loggedUser?.profilePicture && loggedUser?.name ? loggedUser.name[0].toUpperCase() : <AccountCircleIcon />}
            </Avatar>
        </Box>
    );
};


function Layout({ loggedUser, setLoggedUser, children }) {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        setLoggedUser(null);
        navigate('/');
    };

    const userRole = loggedUser?.role ? loggedUser.role.toUpperCase() : '';

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}> 
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
                    width: `calc(100% - ${drawerWidth}px)`,
                    position: 'relative', 
                    pt: 8, 
                }}
            >
                <UserHeader loggedUser={loggedUser} />

                <Container maxWidth="xl" sx={{ pt: 0, pb: 4 }}>
                    {children}
                </Container>
            </Box>
        </Box>
    );
}

export default Layout;