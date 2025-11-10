// src/App.js (VERSÃO FINAL E CORRIGIDA COM LAYOUT)

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CircularProgress } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// 🚨 NOVO: Importe o componente Layout 
import Layout from './components/Layout';

// 🚨 CORREÇÃO: Usando o nome ajustado (DashboardPage)
import DashboardPage from './pages/DashboardPage';
import SetoresPage from './pages/SetoresPage';
import UsuariosPage from './pages/UsuariosPage';
import ProdutosPage from './pages/ProdutosPage';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';

// DEFINIÇÃO DO TEMA
const theme = createTheme({
    palette: {
        primary: {
            main: '#187bbd', // Cor primária (azul SectorFlow)
        },
        secondary: {
            main: '#f44336', // Cor secundária
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});
// FIM DA DEFINIÇÃO DO TEMA 


function App() {
    const [loggedUser, setLoggedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Lógica para persistência de Login
    useEffect(() => {
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

    // 2. Funções utilitárias para extrair dados do usuário
    const getUserRole = () => loggedUser?.role;
    const getUserSectorIds = () => loggedUser?.sectorIds || [];

    // 3. Renderização Condicional
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    {/* Rota de Login/Home (Não precisa do Layout) */}
                    <Route
                        path="/"
                        element={<Home loggedUser={loggedUser} setLoggedUser={setLoggedUser} />}
                    />

                    {/* 🎯 ROTAS PROTEGIDAS (ENVOLVIDAS PELO LAYOUT) 🎯 */}

                    {/* 1. Rota do Dashboard */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute loggedUser={loggedUser}>
                                {/* 🎯 USANDO LAYOUT 🎯 */}
                                <Layout loggedUser={loggedUser} setLoggedUser={setLoggedUser}>
                                    {/* 🚨 CORRIGIDO O NOME DO COMPONENTE (DashboardPage) 🚨 */}
                                    <DashboardPage loggedUser={loggedUser} />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* 2. Rota de Setores */}
                    <Route
                        path="/sectors"
                        element={
                            <ProtectedRoute loggedUser={loggedUser}>
                                {/* 🎯 USANDO LAYOUT 🎯 */}
                                <Layout loggedUser={loggedUser} setLoggedUser={setLoggedUser}>
                                    <SetoresPage userRole={getUserRole()} />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* 3. Rota de Usuários */}
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute loggedUser={loggedUser}>
                                {/* 🎯 USANDO LAYOUT 🎯 */}
                                <Layout loggedUser={loggedUser} setLoggedUser={setLoggedUser}>
                                    <UsuariosPage userRole={getUserRole()} />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* 4. Rota de Produtos */}
                    <Route
                        path="/products"
                        element={
                            <ProtectedRoute loggedUser={loggedUser}>
                                {/* 🎯 USANDO LAYOUT 🎯 */}
                                <Layout loggedUser={loggedUser} setLoggedUser={setLoggedUser}>
                                    <ProdutosPage
                                        loggedUser={loggedUser}
                                        userRole={getUserRole()}
                                        userSectorIds={getUserSectorIds()}
                                    />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Rota de fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </Router>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </ThemeProvider>
    );
}

export default App;