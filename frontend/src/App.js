import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CircularProgress } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import API, { logout, setLogoutHandler } from './api';
import Layout from './components/Layout';

import DashboardPage from './pages/DashboardPage';
import SetoresPage from './pages/SetoresPage';
import UsuariosPage from './pages/UsuariosPage';
import ProdutosPage from './pages/ProdutosPage';
import Login from './pages/Login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundRedirect from './components/NotFoundRedirect';

let globalSetLoggedUser = null;
let globalUserListUpdateCallback = null;

export const updateLoggedUserGlobally = (newUserData) => {
    if (globalSetLoggedUser && newUserData) {
        try {
            const storedUser = JSON.parse(localStorage.getItem('loggedUser') || '{}');

            const finalUserData = {
                ...storedUser,
                ...newUserData
            };

            localStorage.setItem('loggedUser', JSON.stringify(finalUserData));

            globalSetLoggedUser(finalUserData);

            console.log("Usuário atualizado globalmente.");

        } catch (error) {
            console.error("Erro ao atualizar o usuário globalmente:", error);
            toast.error("Falha ao sincronizar dados do usuário.");
        }
    } else {
        console.warn("Tentativa de atualizar usuário globalmente sem setter registrado ou sem dados.");
    }
};

export const setUserListUpdateCallback = (callback) => {
    globalUserListUpdateCallback = callback;
};

export const triggerUserListUpdate = () => {
    if (globalUserListUpdateCallback) {
        globalUserListUpdateCallback();
    }
};


const theme = createTheme({
    palette: {
        primary: {
            main: '#187bbd',
        },
        secondary: {
            main: '#f44336',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

function AppContent() {
    const navigate = useNavigate();

    const [loggedUser, setLoggedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const performAppLogout = () => {
        logout();
        setLoggedUser(null);
        toast.error("Sessão expirada. Faça login novamente.");
        navigate('/');
    };

    useEffect(() => {
        globalSetLoggedUser = setLoggedUser;

        const storedUser = localStorage.getItem('loggedUser');
        if (storedUser) {
            try {
                const userObject = JSON.parse(storedUser);
                setLoggedUser(userObject);
            } catch (e) {
                console.error("Erro ao carregar usuário do localStorage:", e);
                localStorage.removeItem('loggedUser');
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        setLogoutHandler(performAppLogout);
    }, [navigate]);

    const getUserRole = () => loggedUser?.role;
    const getUserSectorIds = () => loggedUser?.sectorIds || [];

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <Routes>
            <Route
                path="/"
                element={<Login loggedUser={loggedUser} setLoggedUser={setLoggedUser} />}
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute loggedUser={loggedUser}>
                        <Layout
                            loggedUser={loggedUser}
                            setLoggedUser={setLoggedUser}
                            pageTitle="Dashboard"
                            pageSubtitle="Métricas e atividades recentes da sua gestão."
                        >
                            <DashboardPage loggedUser={loggedUser} />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/sectors"
                element={
                    <ProtectedRoute loggedUser={loggedUser} allowedRoles={['ADMIN']}>
                        <Layout
                            loggedUser={loggedUser}
                            setLoggedUser={setLoggedUser}
                            pageTitle="Gerenciamento de Setores"
                            pageSubtitle="Visualize e gerencie os setores."
                        >
                            <SetoresPage userRole={getUserRole()} />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/users"
                element={
                    <ProtectedRoute loggedUser={loggedUser} allowedRoles={['ADMIN']}>
                        <Layout
                            loggedUser={loggedUser}
                            setLoggedUser={setLoggedUser}
                            pageTitle="Gerenciamento de Usuários"
                            pageSubtitle="Visualize e gerencie os usuários."
                        >
                            <UsuariosPage
                                loggedUser={loggedUser}
                                userRole={getUserRole()}
                            />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/products"
                element={
                    <ProtectedRoute loggedUser={loggedUser}>
                        <Layout
                            loggedUser={loggedUser}
                            setLoggedUser={setLoggedUser}
                            pageTitle="Gerenciamento de Produtos"
                            pageSubtitle="Visualize e gerencie os produtos."
                        >
                            <ProdutosPage
                                loggedUser={loggedUser}
                                userRole={getUserRole()}
                                userSectorIds={getUserSectorIds()}
                            />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<NotFoundRedirect loggedUser={loggedUser} />} />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppContent />
            </Router>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </ThemeProvider>
    );
}

export default App;