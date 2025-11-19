// frontend/src/pages/Home.js

import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { 
    Container, Typography, Button, Box, 
    TextField, Paper, 
    InputAdornment, IconButton
} from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify';
import logoImage from '../assets/logo1.png';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


function UserLogin({ setLoggedUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); 
    const navigate = useNavigate();

    const getFirstAndLastName = (fullName) => {
        if (!fullName) return '';
        
        const parts = fullName.trim().split(/\s+/).filter(Boolean);

        if (parts.length < 2) {
            return fullName;
        }
        
        const firstName = parts[0];
        const lastName = parts[parts.length - 1];
        
        return `${firstName} ${lastName}`;
    };

    const handleLogin = async () => {
        try {
            const response = await API.post('/login', { email, password });
            const { token, user } = response.data;

            const loggedUserObject = { ...user, token };
            setLoggedUser(loggedUserObject);
            localStorage.setItem('loggedUser', JSON.stringify(loggedUserObject));

            const displayableName = getFirstAndLastName(user.name);
            toast.success(`Bem-vindo, ${displayableName}!`);
            
            navigate('/dashboard', { replace: true }); 

        } catch (error) {
            console.error('Erro de login:', error.response?.data || error);
            toast.error(
                error.response?.data?.error || 'Erro de autenticação. Verifique suas credenciais.',
                {
                    style: { whiteSpace: 'pre-line' }
                }
            );
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                sx={{ mb: 3 }} 
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                inputProps={{
                    autocomplete: 'new-password', 
                }}
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

    useEffect(() => {
        if (loggedUser) {
            navigate('/dashboard', { replace: true });
        }
    }, [loggedUser, navigate]);
    
    if (loggedUser) {
        return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography>Redirecionando...</Typography></Box>;
    }


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
                <UserLogin setLoggedUser={setLoggedUser} />
            </Container>
        </Box>
    );
}

export default Home;