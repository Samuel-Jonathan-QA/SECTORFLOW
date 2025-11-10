// frontend/src/pages/Home.js (CÓDIGO COM DEGRADÊ DE FUNDO)

import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserLogin from '../components/UserLogin';

// Importa a função de logout do api.js
import { logout } from '../api';

// NÃO PRECISA MAIS IMPORTAR A IMAGEM DE FUNDO
// import HomeBackground from '../assets/fundo.jpg'; 

function Home({ loggedUser, setLoggedUser }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setLoggedUser(null);
        navigate('/');
    };

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #42a5f5 0%, #90caf9 50%, #e1bee7 100%)',
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
                    borderRadius: '12px', // Bordas mais arredondadas
                    backgroundColor: 'rgba(255, 255, 255, 0)', // Fundo semi-transparente para o conteúdo
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)', // Sombra mais proeminente
                }}
            >
                <Typography variant="h3" gutterBottom sx={{ color: '#333' }}> {/* Cor de texto mais escura para contraste */}
                    Bem-vindo ao SectorFlow
                </Typography>

                {loggedUser ? (
                    <div>
                        <Typography variant="h5" color="primary" sx={{ marginBottom: '20px' }}>
                            Olá, {loggedUser.name} ({loggedUser.role})!
                        </Typography>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleLogout}
                            sx={{ marginTop: '20px' }}
                        >
                            Sair / Deslogar
                        </Button>
                    </div>
                ) : (
                    <UserLogin setLoggedUser={setLoggedUser} />
                )}
            </Container>
        </Box>
    );
}

export default Home;