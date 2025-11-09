// frontend/src/components/SectorList.js (Refatorado no padrão UserList)

import { List, ListItem, ListItemText, Typography, Paper, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // Novo ícone de edição

// Recebe a nova prop 'onEdit'
function SectorList({ sectors, onDelete, onEdit, userRole }) {
    
  // Verifica se o usuário logado é um ADMIN
  const isAdmin = userRole && userRole.toUpperCase() === 'ADMIN';

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <div style={{ height: '350px', overflowY: 'auto' }}>
        <List>
          {sectors.map(sector => (
            <ListItem
              key={sector.id}
              secondaryAction={
                // Apenas ADMIN pode editar ou deletar
                isAdmin && (
                  <Box>
                      {/* BOTÃO DE EDIÇÃO */}
                      <IconButton
                          edge="end"
                          aria-label="edit"
                          // Passa o objeto 'sector' completo para a função onEdit
                          onClick={() => onEdit(sector)} 
                          sx={{
                              color: '#1e88e5', 
                              '&:hover': { color: '#0d47a1' },
                              marginRight: 1 
                          }}
                      >
                          <EditIcon fontSize="small" />
                      </IconButton>

                      {/* BOTÃO DE DELETAR */}
                      <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => onDelete(sector.id)}
                          sx={{
                              color: '#f44336ff',
                              '&:hover': { color: '#c62828' },
                          }}
                      >
                          <DeleteIcon fontSize="small" />
                      </IconButton>
                  </Box>
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