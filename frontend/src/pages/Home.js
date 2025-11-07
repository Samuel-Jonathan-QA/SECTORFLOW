// frontend/src/pages/Home.js (CÓDIGO CORRIGIDO E FUNCIONAL)

import React from 'react';
import { Container, Typography, Button } from '@mui/material'; // Adicionado Button
import { useNavigate } from 'react-router-dom'; // 🚨 IMPORTANTE para o redirecionamento
import UserLogin from '../components/UserLogin';

// Importa a função de logout do api.js
import { logout } from '../api'; 

// O componente Home deve receber a informação do usuário logado (loggedUser)
// e a função para atualizá-lo (setLoggedUser).
function Home({ loggedUser, setLoggedUser }) { 
    const navigate = useNavigate();

    // 🚨 FUNÇÃO handleLogout 🚨
    const handleLogout = () => {
        logout();             // Limpa o token e headers
        setLoggedUser(null);  // Limpa o estado no componente principal (App.js)
        navigate('/');        // Redireciona para a raiz ou a tela de login
    };

    // Estrutura Condicional
    return (
        <Container maxWidth="md" style={{ textAlign: 'center', marginTop: '50px' }}>
            <Typography variant="h3" gutterBottom>
                Bem-vindo ao SectorFlow
            </Typography>

            {/* 🚨 CONDIÇÃO: SE ESTIVER LOGADO, MOSTRA O CONTEÚDO 🚨 */}
            {loggedUser ? (
                <div>
                    <Typography variant="h5" color="primary" style={{ marginBottom: '20px' }}>
                        Olá, {loggedUser.name} ({loggedUser.role})!
                    </Typography>
                    
                    {/* Botão de Deslogar com MUI Button */}
                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleLogout} 
                        style={{ marginTop: '20px' }}
                    >
                        Sair / Deslogar
                    </Button>
                    
                    {/* Aqui você colocaria links ou dashboard para usuários logados */}
                    {/* Ex: <SectorList /> */}
                </div>
            ) : (
                // 🚨 CONDIÇÃO: SE NÃO ESTIVER LOGADO, MOSTRA A TELA DE LOGIN 🚨
                <UserLogin setLoggedUser={setLoggedUser} />
            )}
        </Container>
    );
}

export default Home;