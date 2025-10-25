import { useState, useEffect } from 'react';
import { Container, Typography, Grid } from '@mui/material'; // Importado Container, Typography e Grid
import SectorForm from '../components/SectorForm';
import SectorList from '../components/SectorList';
import API from '../api';
import { toast } from 'react-toastify';

function SetoresPage() {
  const [sectors, setSectors] = useState([]);

  const fetchSectors = async () => {
    const res = await API.get('/sectors');
    setSectors(res.data);
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  const handleDeleteSector = async (id) => {
    try {
      await API.delete(`/sectors/${id}`);
      setSectors(sectors.filter(s => s.id !== id));
      toast.success('Setor deletado com sucesso!');
    } catch {
      toast.error('Erro ao deletar setor.');
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '30px' }}>
      {/* TÍTULO ADICIONADO AQUI */}
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Setores
      </Typography>

      <Grid container spacing={3}>
        {/* Formulário de Criação */}
        <Grid item xs={12}>
          <SectorForm onAdd={fetchSectors} />
        </Grid>

        {/* Lista de Setores */}
        <Grid item xs={12}>
          <SectorList sectors={sectors} onDelete={handleDeleteSector} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default SetoresPage;