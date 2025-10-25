import { useState, useEffect } from 'react';
import { Container, Typography, Grid } from '@mui/material'; // Importado
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import API from '../api';
import { toast } from 'react-toastify';

function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [sectors, setSectors] = useState([]);

  const fetchUsers = async () => {
    const res = await API.get('/users');
    setUsers(res.data);
  };

  const fetchSectors = async () => {
    const res = await API.get('/sectors');
    setSectors(res.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchSectors();
  }, []);

  const handleDeleteUser = async (id) => {
    try {
      await API.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      toast.success('Usuário deletado com sucesso!');
    } catch {
      toast.error('Erro ao deletar usuário.');
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '30px' }}>
      {/* TÍTULO ADICIONADO AQUI */}
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Usuários
      </Typography>

      <Grid container spacing={3}>
        {/* Formulário de Criação */}
        <Grid item xs={12}>
          <UserForm sectors={sectors} onAdd={fetchUsers} />
        </Grid>

        {/* Lista de Usuários */}
        <Grid item xs={12}>
          <UserList users={users} onDelete={handleDeleteUser} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default UsuariosPage;