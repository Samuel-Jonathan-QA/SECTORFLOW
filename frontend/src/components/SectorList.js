// frontend/src/components/SectorList.js (Refatorado com Divisor)

// ✅ Importa Divider e React
import React from 'react';
import { List, ListItem, ListItemText, Typography, Paper, IconButton, Box, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // Novo ícone de edição

// Recebe a nova prop 'onEdit'
function SectorList({ sectors, onDelete, onEdit, userRole }) {

  // Verifica se o usuário logado é um ADMIN
  const isAdmin = userRole && userRole.toUpperCase() === 'ADMIN';

  return (
    <Paper elevation={3} style={{ padding: '10px' }}>
      <div style={{ height: '350px', overflowY: 'auto' }}>
        <List>
          {/* Adicionamos 'index' ao map para controlar o Divider */}
          {sectors.map((sector, index) => (
            // Usamos React.Fragment para agrupar o item e o divisor
            <React.Fragment key={sector.id}>
              <ListItem
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

              {/* ✅ NOVO: Adiciona o Divider se não for o último item */}
              {index < sectors.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </div>
    </Paper>
  );
}

export default SectorList;