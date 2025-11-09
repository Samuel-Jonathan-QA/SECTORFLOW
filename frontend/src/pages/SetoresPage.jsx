// frontend/src/pages/SetoresPage.jsx (VERSÃO FINAL COM RESTRIÇÃO DE TELA)

import { useState, useEffect, useCallback } from 'react'; // Adicionado useCallback para limpeza
import { Container, Typography, Grid } from '@mui/material';
import SectorForm from '../components/SectorForm';
import SectorList from '../components/SectorList';
import API from '../api';
import { toast } from 'react-toastify';

// 🚨 NOVO: O componente deve receber a role 🚨
function SetoresPage({ userRole }) { 
  const [sectors, setSectors] = useState([]);
  
  // 🚨 Checa se o usuário pode gerenciar setores 🚨
  const canManageSectors = userRole === 'ADMIN';

  // Usa useCallback para evitar recriação desnecessária da função
  const fetchSectors = useCallback(async () => {
    try {
      // Esta rota foi corrigida para exigir autenticação
      const res = await API.get('/sectors'); 
      setSectors(res.data);
    } catch (error) {
       // Se o GET falhar (ex: token inválido ou não autorizado), a lista fica vazia.
       // Adicionamos um toast de erro para feedback.
       toast.error('Não foi possível carregar a lista de setores.');
    }
  }, []);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  const handleDeleteSector = async (id) => {
    try {
      await API.delete(`/sectors/${id}`); // O Backend verifica a role ADMIN
      setSectors(sectors.filter(s => s.id !== id));
      toast.success('Setor deletado com sucesso!');
    } catch (error) {
       // Mensagem de erro amigável, caso o Backend retorne 403
       toast.error(error.response?.data?.error || 'Erro ao deletar setor. Permissão insuficiente.');
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '30px' }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Setores
      </Typography>

      <Grid container spacing={3}>
        {/* 🚨 CONDIÇÃO DE RENDERIZAÇÃO: Apenas ADMIN vê o Formulário 🚨 */}
        {canManageSectors && (
          <Grid item xs={12}>
            <SectorForm onAdd={fetchSectors} />
          </Grid>
        )}

        {/* Lista de Setores */}
        <Grid item xs={12}>
          <SectorList 
            sectors={sectors} 
            onDelete={handleDeleteSector} 
            // 🚨 Passa a role para o SectorList esconder o botão de delete (ajuste feito na revisão anterior) 🚨
            userRole={userRole}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default SetoresPage;