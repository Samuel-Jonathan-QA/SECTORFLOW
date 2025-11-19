// frontend/src/pages/Home.js

import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { 
    Container, Typography, Button, Box, 
    TextField, Paper, 
    // ✅ NOVO: Importa componentes e ícones para o botão de senha
    InputAdornment, IconButton
} from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify';
import logoImage from '../assets/logo1.png';
// ✅ NOVO: Importa ícones de olho
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


function UserLogin({ setLoggedUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // ⬅️ NOVO: Estado para mostrar/ocultar senha
    const navigate = useNavigate();

    /**
     * @description Extrai apenas o primeiro e o último nome de uma string de nome completo.
     * @param {string} fullName - O nome completo do usuário (e.g., "João Pedro da Silva").
     * @returns {string} Primeiro e último nome (e.g., "João Silva").
     */
    const getFirstAndLastName = (fullName) => {
        if (!fullName) return '';
        
        // Divide o nome completo em palavras, usando regex para lidar com múltiplos espaços
        const parts = fullName.trim().split(/\s+/).filter(Boolean);

        // Se houver menos de 2 partes (apenas 1 palavra ou vazio), retorna o nome completo
        if (parts.length < 2) {
            return fullName;
        }
        
        // Retorna a primeira palavra (Primeiro Nome) e a última palavra (Sobrenome)
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

            // ⬅️ Alteração: Processa o nome antes de exibir no toast
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

    // ⬅️ NOVO: Função para alternar a visibilidade da senha
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
                // O autocompletar de e-mail é geralmente útil e permitido pelo navegador.
                // Não precisa de inputProps extra.
            />

            <TextField
                label="Senha"
                // ⬅️ MUDANÇA: Altera o tipo baseado no estado showPassword
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                sx={{ mb: 3 }} 
                // ⬅️ NOVO: Adiciona o botão de mostrar/ocultar senha
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
                // 🛑 CORREÇÃO: Usa 'new-password' para desabilitar o preenchimento de senhas salvas.
                inputProps={{
                    autocomplete: 'new-password', // ⬅️ ALTERAÇÃO CHAVE
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

    // ✅ CORREÇÃO: Usar useEffect para o redirecionamento
    useEffect(() => {
        if (loggedUser) {
            // Se o usuário estiver logado no estado, redireciona para a dashboard
            navigate('/dashboard', { replace: true });
        }
    }, [loggedUser, navigate]);
    
    // Exibe um indicador rápido se estiver prestes a redirecionar
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