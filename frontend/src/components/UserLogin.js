import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Paper } from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify';

function UserLogin({ setLoggedUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // A função useEffect e a busca de todos os usuários (API.get('/users')) FORAM REMOVIDAS.

  const handleLogin = async () => {
    try {
      // 1. Chama a nova rota de login segura no backend
      const response = await API.post('/login', { email, password });

      // A resposta contém { token, user: { id, name, email, sectorId, Sector } }
      const { token, user } = response.data;

      // Cria o objeto de usuário completo, incluindo o token
      const loggedUserObject = { ...user, token };

      // 2. Salva o usuário (com o token!) no estado da aplicação
      setLoggedUser(loggedUserObject);

      // 3. Salva no Local Storage (para o Interceptor do Axios e persistência)
      localStorage.setItem('loggedUser', JSON.stringify(loggedUserObject));

      toast.success(`Bem-vindo, ${user.name}!`);

      // 4. Navega para o Dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Erro de login:', error.response?.data || error);
      // Exibe a mensagem de erro do backend
      toast.error(error.response?.data?.message || 'Erro de autenticação. Verifique suas credenciais.');
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '10px', maxWidth: '400px', margin: '0 auto' }} data-testid="user-login">
      <Typography variant="h5" gutterBottom>Entrar no SectorFlow</Typography>

      {/* Campo de Email */}
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
      />

      {/* Campo de Senha */}
      <TextField
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />

      <Button
        variant="contained"
        onClick={handleLogin}
        disabled={!email || !password}
        fullWidth
        sx={{
          mt: 2, // margin top
          backgroundColor: 'rgba(24, 123, 189, 1)',
          color: '#ffffffff',
          '&:hover': {
            backgroundColor: 'rgba(3, 62, 102, 1)',
          },
        }}
      >
        Entrar
      </Button>

    </Paper>
  );
}

export default UserLogin;