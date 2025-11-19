import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CircularProgress } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import API, { logout, setLogoutHandler } from './api'; 
import Layout from './components/Layout';

import DashboardPage from './pages/DashboardPage';
import SetoresPage from './pages/SetoresPage';
import UsuariosPage from './pages/UsuariosPage';
import ProdutosPage from './pages/ProdutosPage';
import Home from './pages/Home';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundRedirect from './components/NotFoundRedirect'; 

// --- SOLUÇÃO DE ARQUIVO ÚNICO: Gerenciamento Global de Estado do Usuário ---

// Variável para armazenar a função setLoggedUser do AppContent
let globalSetLoggedUser = null;

/**
 * Atualiza o objeto do usuário logado no localStorage e no estado global do React.
 * Qualquer componente pode importar e chamar esta função:
 * import { updateLoggedUserGlobally } from '../App';
 * * @param {object} newUserData - O novo objeto de usuário (ex: { name: 'Novo Nome' }).
 */
export const updateLoggedUserGlobally = (newUserData) => {
    if (globalSetLoggedUser && newUserData) {
        try {
            // 1. Puxa os dados atuais do localStorage (incluindo o token)
            const storedUser = JSON.parse(localStorage.getItem('loggedUser') || '{}');
            
            // Mescla os dados existentes com os novos dados recebidos
            const finalUserData = { 
                ...storedUser,
                ...newUserData 
            };

            // 2. Atualiza o localStorage com os novos dados
            localStorage.setItem('loggedUser', JSON.stringify(finalUserData));
            
            // 3. Atualiza o estado do React no componente principal (AppContent)
            globalSetLoggedUser(finalUserData);
            
            console.log("Usuário atualizado globalmente (Solução 1 arquivo).");

        } catch (error) {
            console.error("Erro ao atualizar o usuário globalmente:", error);
            toast.error("Falha ao sincronizar dados do usuário.");
        }
    } else {
        console.warn("Tentativa de atualizar usuário globalmente sem setter registrado ou sem dados.");
    }
};

// --- FIM DA SOLUÇÃO ARQUIVO ÚNICO ---


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
        // NOVO: Registra o setLoggedUser na variável global
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
    }, []); // A array vazia garante que a função só roda na montagem inicial
    
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
                element={<Home loggedUser={loggedUser} setLoggedUser={setLoggedUser} />}
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
                    // ✅ Restrição: Apenas 'ADMIN' pode acessar. Outros vão para /dashboard.
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
                    // ✅ Restrição: Apenas 'ADMIN' pode acessar. Outros vão para /dashboard.
                    <ProtectedRoute loggedUser={loggedUser} allowedRoles={['ADMIN']}>
                        <Layout
                            loggedUser={loggedUser}
                            setLoggedUser={setLoggedUser}
                            pageTitle="Gerenciamento de Usuários"
                            pageSubtitle="Visualize e gerencie os usuários." 
                        >
                            <UsuariosPage userRole={getUserRole()} />
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