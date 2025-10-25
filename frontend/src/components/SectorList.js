import { List, ListItem, ListItemText, Typography, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function SectorList({ sectors, onDelete }) {
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
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onDelete(sector.id)}
                  sx={{
                    color: '#f44336ff', // cor padrão do ícone
                    '&:hover': {
                      color: '#c62828', // muda a cor quando passa o mouse
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>

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
