// src/App.js (VERSÃO FINAL E CORRIGIDA)

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CircularProgress } from '@mui/material'; // Importado CircularProgress
import CssBaseline from '@mui/material/CssBaseline';
import DashboardCards from './pages/DashboardCards';
import SetoresPage from './pages/SetoresPage';
import UsuariosPage from './pages/UsuariosPage';
import ProdutosPage from './pages/ProdutosPage';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
// Substitua pela importação simplificada
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
    const [isLoading, setIsLoading] = useState(true); // Estado de carregamento

    // 1. Lógica para persistência de Login
    useEffect(() => {
        const storedUser = localStorage.getItem('loggedUser');
        if (storedUser) {
            try {
                // Tenta fazer o parse do JSON
                const userObject = JSON.parse(storedUser);
                setLoggedUser(userObject);
            } catch (e) {
                // Em caso de erro, limpa o localStorage e considera deslogado
                console.error("Erro ao carregar usuário do localStorage:", e);
                localStorage.removeItem('loggedUser');
            }
        }
        setIsLoading(false); // Termina o carregamento inicial
    }, []);

    // 2. Funções utilitárias para extrair dados do usuário (usadas nas Rotas)
    // A ROLE está no objeto root 'loggedUser'
    const getUserRole = () => loggedUser?.role;
    // Os IDs também
    const getUserSectorIds = () => loggedUser?.sectorIds || [];

    // 3. Renderização Condicional
    if (isLoading) {
        return (
            // Exibe um spinner de carregamento enquanto o estado de login está sendo verificado
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
                    {/* Rota inicial: Lida com Login/Logout e Exibe a Home */}
                    <Route
                        path="/"
                        element={<Home loggedUser={loggedUser} setLoggedUser={setLoggedUser} />}
                    />

                    {/* Rota do Dashboard (Protegida) */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute loggedUser={loggedUser}>
                                <DashboardCards loggedUser={loggedUser} setLoggedUser={setLoggedUser} />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rotas de Gerenciamento (Protegidas) */}
                    <Route
                        path="/sectors"
                        element={
                            <ProtectedRoute loggedUser={loggedUser}>
                               {/* ✅ CORREÇÃO: Passando a role para SetoresPage */}
                            <SetoresPage userRole={getUserRole()} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute loggedUser={loggedUser}>
                                {/* 🚨 ALTERAÇÃO AQUI: Passando a role para o UsuariosPage 🚨 */}
                                <UsuariosPage userRole={getUserRole()} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/products"
                        element={
                            <ProtectedRoute loggedUser={loggedUser}>
                                <ProdutosPage
                                    loggedUser={loggedUser}
                                    userRole={getUserRole()}
                                    userSectorIds={getUserSectorIds()}
                                />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rota de fallback para qualquer coisa que não seja mapeada */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </Router>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </ThemeProvider>
    );
}

export default App;