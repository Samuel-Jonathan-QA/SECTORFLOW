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
            console.error('Erro de login:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Erro de autenticação. Verifique suas credenciais.');
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

    const localHandleLogout = () => {
        localStorage.removeItem('loggedUser');
        setLoggedUser(null);
        navigate('/'); 
    };

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

                {loggedUser ? (
                    <Box 
                        sx={{ 
                            mt: 4, 
                            p: 5, // Mais padding
                            bgcolor: 'rgba(255, 255, 255, 0.95)', 
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
                            variant="outlined" 
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