// ProductList.jsx
import { List, ListItem, ListItemText, Typography, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function ProductList({ products, onDelete }) {
  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      {/* Título fixo */}
      <Typography variant="h6" style={{ marginBottom: '10px' }}>Produtos</Typography>

      {/* Lista rolável */}
      <div style={{ height: '150px', overflowY: 'auto' }}>
        <List>
          {products.map(product => (
            <ListItem
              key={product.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onDelete(product.id)}
                  sx={{
                    color: '#f44336ff',
                    '&:hover': { color: '#c62828' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${product.name} - R$ ${product.price}`}
                secondary={`Setor: ${product.Sector?.name || 'Sem setor'}`}
              />
            </ListItem>
          ))}
        </List>
      </div>
    </Paper>
  );
}

export default ProductList;
