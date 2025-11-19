import React, { useState, useEffect } from 'react'; // ✅ Adicionado useEffect
import {
    Box, List, ListItem, ListItemText, ListItemIcon, Typography,
    Button, CssBaseline, Container, Divider, Avatar, AppBar, Toolbar, Modal
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../api';
import API from '../api'; // ✅ Adicionado API para buscar setores

// ✅ NOVO: Importa a função de atualização global do App.js
import { updateLoggedUserGlobally } from '../App'; 

import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import GroupIcon from '@mui/icons-material/Group';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SectorFlowLogo from '../assets/logo1.png';
import UserFormEdit from './UserFormEdit'; // ✅ Importa o componente UserEditForm

const drawerWidth = 200;
const HEADER_HEIGHT = 64;
const BACKEND_URL = 'http://localhost:3001';
const primaryColor = '#187bbd';

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

// FixedHeader recebe onOpenProfileModal
const FixedHeader = ({ loggedUser, pageTitle, pageSubtitle, onOpenProfileModal }) => {
    const profileSrc = loggedUser?.profilePicture
        ? `${BACKEND_URL}${loggedUser.profilePicture}`
        : undefined;

    return (
        <AppBar
            position="fixed"
            sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                height: HEADER_HEIGHT,
                bgcolor: '#ffffff',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                zIndex: 1100,
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: HEADER_HEIGHT }}>

                {/* Título e Subtítulo da Página */}
                <Box>
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{ color: '#424242', lineHeight: 1.2, fontSize: '1.4rem' }}
                    >
                        {pageTitle}
                    </Typography>
                    {pageSubtitle && (
                        <Typography
                            variant="body2"
                            color="textSecondary"
                        >
                            {pageSubtitle}
                        </Typography>
                    )}
                </Box>

                {/* Informações do Usuário (Direita) - Clicável */}
                <Box
                    onClick={onOpenProfileModal}
                    sx={{
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
                    <Typography variant="body2" fontWeight="medium" sx={{ color: '#424242' }}>
                        Olá, {loggedUser?.name ? loggedUser.name.split(' ')[0] : 'Usuário'}
                    </Typography>
                    <Avatar
                        src={profileSrc}
                        sx={{ width: 40, height: 40, fontSize: 18 }}
                    >
                        {!loggedUser?.profilePicture && loggedUser?.name ? loggedUser.name[0].toUpperCase() : <AccountCircleIcon sx={{ color: '#ffffff' }} />}
                    </Avatar>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 0,
    borderRadius: 2,
    outline: 'none',
};


function Layout({ loggedUser, setLoggedUser, children, pageTitle, pageSubtitle }) {
    const navigate = useNavigate();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    // Note: Mantendo a lógica de fallback do setor que você havia incluído, embora a busca na montagem seja mais segura.
    const [sectors, setSectors] = useState([]); 

    // ✅ Busca a lista de setores na montagem (necessário para o Select do UserEditForm)
    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const response = await API.get('/sectors');
                setSectors(response.data);
            } catch (error) {
                console.error("Erro ao buscar setores:", error);
                // Pode ignorar o erro se o usuário for VENDEDOR, pois os campos estarão disabled
                if (loggedUser?.role !== 'ADMIN') {
                    setSectors(loggedUser?.Sectors || []); // Usa os setores do próprio usuário para exibir
                } else {
                     setSectors([]); // Define como vazio se for ADMIN e falhar (para evitar campos nulos no form)
                }
            }
        };

        if (loggedUser) {
            fetchSectors();
        }
    }, [loggedUser]);


    const handleLogout = () => {
        logout();
        setLoggedUser(null);
        navigate('/');
    };

    const userRole = loggedUser?.role ? loggedUser.role.toUpperCase() : '';

    const handleOpenProfileModal = () => setIsProfileModalOpen(true);
    const handleCloseProfileModal = () => setIsProfileModalOpen(false);


    // ✅ FUNÇÃO ATUALIZADA: Agora usa a função global que gerencia o estado E o localStorage
    const handleUserUpdateAndCloseModal = (updatedUser) => {
        // 1. CHAVE: Usa a função exportada do App.js para atualizar o estado e o localStorage
        updateLoggedUserGlobally(updatedUser);
        
        // 2. Fecha a modal de edição
        handleCloseProfileModal();
    };


    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}>
            <CssBaseline />

            <Sidebar
                userRole={userRole}
                loggedUser={loggedUser}
                handleLogout={handleLogout}
                navigate={navigate}
            />

            <FixedHeader
                loggedUser={loggedUser}
                pageTitle={pageTitle}
                pageSubtitle={pageSubtitle}
                onOpenProfileModal={handleOpenProfileModal}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: `${drawerWidth}px`,
                    width: `calc(100% - ${drawerWidth}px)`,
                    pt: `${HEADER_HEIGHT + 24}px`,
                    pb: 4,
                    position: 'relative',
                }}
            >

                <Container maxWidth="xl" sx={{ pt: 0, pb: 0 }}>
                    {children}
                </Container>
            </Box>

            {/* ✅ Renderiza o Modal de Edição de Perfil usando UserEditForm */}
            <Modal
                open={isProfileModalOpen}
                onClose={handleCloseProfileModal}
                aria-labelledby="profile-edit-modal-title"
                aria-describedby="profile-edit-modal-description"
            >
                <Box sx={modalStyle}>
                    <UserFormEdit
                        sectors={sectors} // Passa a lista de setores (vazia ou completa)
                        currentUser={loggedUser} // O usuário sendo editado é o próprio loggedUser
                        onFinish={handleCloseProfileModal} // ✅ Usado para o botão 'Cancelar'
                        isSelfEdit={true} // ✅ Define o formulário no modo de auto-edição
                        // ✅ ATUALIZADO: Passa a nova função que faz o update E fecha a modal
                        onUserUpdate={handleUserUpdateAndCloseModal} 
                    />
                </Box>
            </Modal>
        </Box>
    );
}

export default Layout;