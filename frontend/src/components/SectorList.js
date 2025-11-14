// frontend/src/components/SectorList.js

import React from 'react';
import { List, ListItem, ListItemText, Typography, Paper, IconButton, Box, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; 

function SectorList({ sectors, onDelete, onEdit, userRole }) {

  const isAdmin = userRole && userRole.toUpperCase() === 'ADMIN';

  return (
    <Paper elevation={3} style={{ padding: '10px' }}>
      <div style={{ height: '350px', overflowY: 'auto' }}>
        <List>
          {sectors.map((sector, index) => (
            <React.Fragment key={sector.id}>
              <ListItem
                secondaryAction={
                  isAdmin && (
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => onEdit(sector)}
                        sx={{
                          color: '#1e88e5',
                          '&:hover': { color: '#0d47a1' },
                          marginRight: 1
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>

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

              {index < sectors.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </div>
    </Paper>
  );
}

export default SectorList;