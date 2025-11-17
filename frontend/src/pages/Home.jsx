// frontend/src/pages/Home.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, Typography, Button, Box, 
    TextField, Paper
} from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify';

import logoImage from '../assets/logo1.png';


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
            // Este bloco captura erros 400 (Credenciais inválidas) ou outros
            console.error('Erro de login:', error.response?.data || error);
            toast.error(error.response?.data?.error || 'Erro de autenticação. Verifique suas credenciais.');
        }
    };

    return (
        <Paper 
            elevation={6} 
            sx={{ 
                padding: '40px', 
                maxWidth: '420px', 
                margin: '0 auto',
                borderRadius: '12px', 
                backgroundColor: 'rgba(255, 255, 255, 1)', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', 
            }} 
            data-testid="user-login"
        >
            <Box 
                component="img" 
                src={logoImage} 
                alt="SectorFlow Logo" 
                sx={{ 
                    width: 120, 
                    height: 120, 
                    mb: 1, 
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
                variant="outlined" 
                sx={{ mb: 2 }} 
            />

            <TextField
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                sx={{ mb: 3 }} 
            />

            <Button
                variant="contained"
                onClick={handleLogin}
                disabled={!email || !password}
                fullWidth
                size="large" 
                sx={{
                    mt: 2, 
                    backgroundColor: '#187bbd', 
                    color: '#fff',
                    fontWeight: 'bold',
                    '&:hover': {
                        backgroundColor: '#0f5a8a', 
                    },
                }}
            >
                Entrar
            </Button>

        </Paper>
    );
}

function Home({ loggedUser, setLoggedUser }) { 
    const navigate = useNavigate();

    // ✅ IMPLEMENTAÇÃO DO REDIRECIONAMENTO IMEDIATO
    if (loggedUser) {
        // Se o usuário estiver logado, redireciona para a dashboard e para de renderizar este componente.
        navigate('/dashboard');
        return null;
    }

    // Se a função localHandleLogout era usada apenas no bloco que removemos, ela não é mais necessária aqui.

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #187bbd 0%, #42a5f5 50%, #90caf9 100%)',
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
                    backgroundColor: 'transparent', 
                    boxShadow: 'none', 
                }}
            >
                {/* Se chegarmos até aqui, loggedUser é null, então exibimos o login */}
                <UserLogin setLoggedUser={setLoggedUser} />
            </Container>
        </Box>
    );
}

export default Home;