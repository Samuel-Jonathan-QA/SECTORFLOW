// UserList.jsx
import { List, ListItem, ListItemText, Typography, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function UserList({ users, onDelete }) {
  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      {/* Título fixo */}
      <Typography variant="h6" style={{ marginBottom: '10px' }}>Usuários</Typography>

      {/* Lista rolável */}
      <div style={{ height: '150px', overflowY: 'auto' }}>
        <List>
          {users.map(user => (
            <ListItem
              key={user.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onDelete(user.id)}
                  sx={{
                    color: '#f44336ff', // cor padrão
                    '&:hover': { color: '#c62828' } // vermelho escuro ao passar o mouse
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${user.name} (${user.Sector?.name || 'Sem setor'})`}
                secondary={user.email}
              />
            </ListItem>
          ))}
        </List>
      </div>
    </Paper>
  );
}

export default UserList;
