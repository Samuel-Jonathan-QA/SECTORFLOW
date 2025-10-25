import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import DashboardCards from './pages/DashboardCards';
import SetoresPage from './pages/SetoresPage';
import UsuariosPage from './pages/UsuariosPage';
import ProdutosPage from './pages/ProdutosPage';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react'; // Importado useEffect
import ProtectedRoute from './components/ProtectedRoute'; // NOVO: Importa o ProtectedRoute

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function App() {
  const [loggedUser, setLoggedUser] = useState(null);

  // 1. Lógica para persistência de Login (Carrega do LocalStorage)
  useEffect(() => {
    const user = localStorage.getItem('loggedUser');
    if (user) {
      // Se o usuário existir no Local Storage, carrega ele para o estado
      setLoggedUser(JSON.parse(user));
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home setLoggedUser={setLoggedUser} />} />

          {/* 2. ROTAS AGORA ESTÃO PROTEGIDAS */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute loggedUser={loggedUser}>
                <DashboardCards sectors={[]} users={[]} products={[]} />
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
                <ProdutosPage loggedUser={loggedUser} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </ThemeProvider>
  );
}

export default App;