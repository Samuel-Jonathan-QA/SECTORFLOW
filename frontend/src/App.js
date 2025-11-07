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
        // Buscamos o usuário no Local Storage para persistência
        const user = localStorage.getItem('loggedUser');
        if (user) {
            try {
                setLoggedUser(JSON.parse(user));
            } catch (e) {
                // Limpa Local Storage se o JSON estiver corrompido
                localStorage.removeItem('loggedUser');
                console.error("Erro ao fazer parse do usuário salvo.");
            }
        }
        // Finaliza o carregamento após tentar buscar o usuário
        setIsLoading(false);
    }, []);

    const getUserRole = () => loggedUser?.user?.role;
    const getUserSectorIds = () => loggedUser?.user?.sectorIds || [];

    // A função handleLogout não é mais estritamente necessária aqui, 
    // mas a mantemos como utilitário se for usada em outro lugar.
    // O DashboardCards agora usa setLoggedUser e a função logout do api.js
    const handleLogout = () => {
        localStorage.removeItem('loggedUser');
        setLoggedUser(null);
    };

    // 2. CHECAGEM DE CARREGAMENTO GLOBAL 
    if (isLoading) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </div>
            </ThemeProvider>
        );
    }

    // 3. Renderização Principal (só ocorre após o carregamento)
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    {/* Rota de Login/Home (Redireciona se logado) */}
                    <Route
                        path="/"
                        element={loggedUser ? <Navigate to="/dashboard" replace /> : <Home setLoggedUser={setLoggedUser} />}
                    />

                    {/* ROTAS PROTEGIDAS INDIVIDUAIS */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute loggedUser={loggedUser}>
                                {/* 🚨 INTEGRAÇÃO DO BOTÃO DE LOGOUT 🚨
                                     Passamos setLoggedUser para que DashboardCards possa limpar o estado global. */}
                                <DashboardCards
                                    loggedUser={loggedUser}
                                    setLoggedUser={setLoggedUser} // Propriedade necessária para o logout
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sectors"
                        element={
                            <ProtectedRoute loggedUser={loggedUser}>
                                <SetoresPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute loggedUser={loggedUser}>
                                <UsuariosPage />
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