// frontend/src/components/SectorList.js (VERSÃO FINAL SUGERIDA)

import { List, ListItem, ListItemText, Typography, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// 🚨 NOVO: Recebe a prop userRole 🚨
function SectorList({ sectors, onDelete, userRole }) {
    
  // Verifica se o usuário logado é um ADMIN
  const isAdmin = userRole === 'ADMIN';

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      {/* Título fixo */}
      <Typography variant="h6" style={{ marginBottom: '10px' }}>Setores</Typography>

      {/* Lista rolável */}
      <div style={{ height: '350px', overflowY: 'auto' }}>
        <List>
          {sectors.map(sector => (
            <ListItem
              key={sector.id}
              secondaryAction={
                // 🚨 RENDERIZA CONDICIONALMENTE O BOTÃO 🚨
                isAdmin && (
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => onDelete(sector.id)}
                    sx={{
                      color: '#f44336ff',
                      '&:hover': {
                        color: '#c62828',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )
              }
            >
              <ListItemText primary={sector.name} />
            </ListItem>
          ))}
        </List>
      </div>

    </Paper>
  );
}

export default SectorList;