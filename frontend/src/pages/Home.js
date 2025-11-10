// frontend/src/pages/Home.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, Typography, Button, Box, 
    TextField, Paper, Avatar // Adicionado Avatar para a logo
} from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify';

// Importa a imagem da logo (assumindo que está em public/assets)
import logoImage from '../assets/logo1.png'; // Ajuste o caminho conforme necessário


// ----------------------------------------------------------------------
// 1. COMPONENTE INTERNO: UserLogin
// ----------------------------------------------------------------------
function UserLogin({ setLoggedUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await API.post('/login', { email, password });
            const { token, user } = response.data;

            const loggedUserObject = { ...user, token };
            setLoggedUser(loggedUserObject);
            localStorage.setItem('loggedUser', JSON.stringify(loggedUserObject));
            toast.success(`Bem-vindo, ${user.name}!`);
            navigate('/dashboard');

        } catch (error) {
            console.error('Erro de login:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Erro de autenticação. Verifique suas credenciais.');
        }
    };

    return (
        <Paper 
            elevation={6} // Sombra mais pronunciada para dar profundidade
            sx={{ 
                padding: '40px', // Aumentado o padding
                maxWidth: '420px', 
                margin: '0 auto',
                borderRadius: '12px', // Bordas arredondadas
                backgroundColor: 'rgba(255, 255, 255, 1)', // Fundo branco sólido
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Centraliza itens horizontalmente
            }} 
            data-testid="user-login"
        >
           {/* Logo acima do formulário */}
            <Box 
                component="img" // Diz ao Box para renderizar como uma tag <img>
                src={logoImage} // Usa a imagem importada
                alt="SectorFlow Logo" 
                sx={{ 
                    width: 120, 
                    height: 120, 
                    mb: 1, // Margem inferior
                }} 
            />

            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                Entrar no SectorFlow
            </Typography>

            <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined" // Estilo outlined para um visual mais moderno
                sx={{ mb: 2 }} // Margem inferior
            />

            <TextField
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                sx={{ mb: 3 }} // Margem inferior maior
            />

            <Button
                variant="contained"
                onClick={handleLogin}
                disabled={!email || !password}
                fullWidth
                size="large" // Botão maior
                sx={{
                    mt: 2, 
                    // Usando uma cor mais próxima do azul da logo
                    backgroundColor: '#187bbd', 
                    color: '#fff',
                    fontWeight: 'bold',
                    '&:hover': {
                        backgroundColor: '#0f5a8a', // Tom mais escuro no hover
                    },
                }}
            >
                Entrar
            </Button>

        </Paper>
    );
}

// ----------------------------------------------------------------------
// 2. COMPONENTE PRINCIPAL: Home
// ----------------------------------------------------------------------
function Home({ loggedUser, setLoggedUser }) { 
    const navigate = useNavigate();

    const localHandleLogout = () => {
        localStorage.removeItem('loggedUser');
        setLoggedUser(null);
        navigate('/'); // Redireciona para a home (que mostrará o login)
    };

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #187bbd 0%, #42a5f5 50%, #90caf9 100%)', // Gradiente mais azulado e suave
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}
        >
            <Container
                maxWidth="md"
                sx={{
                    textAlign: 'center',
                    padding: '40px',
                    borderRadius: '12px', 
                    backgroundColor: 'transparent', // Manter transparente para o login no centro
                    boxShadow: 'none', // Remover sombra extra do container
                }}
            >

                {loggedUser ? (
                    <Box 
                        sx={{ 
                            mt: 4, 
                            p: 5, // Mais padding
                            bgcolor: 'rgba(255, 255, 255, 0.95)', // Fundo semi-opaco para o conteúdo logado
                            borderRadius: '12px',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <Typography variant="h5" color="primary" sx={{ marginBottom: '20px' }}>
                            Olá, {loggedUser.name} ({loggedUser.role})!
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/dashboard')}
                            sx={{ mr: 2, mb: 2 }}
                        >
                            Ir para Dashboard
                        </Button>

                        <Button
                            variant="outlined" // Botão de sair pode ser outlined
                            color="error"
                            onClick={localHandleLogout}
                            sx={{ mb: 2 }}
                        >
                            Sair / Deslogar
                        </Button>
                    </Box>
                ) : (
                    <UserLogin setLoggedUser={setLoggedUser} />
                )}
            </Container>
        </Box>
    );
}

export default Home;