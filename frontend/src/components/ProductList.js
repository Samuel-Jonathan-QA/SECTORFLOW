// ProductList.jsx (REFATORADO)

import { List, ListItem, ListItemText, Typography, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// 🚨 NOVO: Recebe as props de permissão 🚨
function ProductList({ products, onDelete, userRole, userSectorIds }) {
    
    // Função helper para verificar se o usuário pode gerenciar o produto
    const canManageProduct = (product) => {
        // Se for ADMIN, sempre pode
        if (userRole === 'ADMIN') {
            return true;
        }

        // Se for VENDEDOR, só pode se o sectorId do produto estiver na sua lista
        if (userRole === 'VENDEDOR') {
            return userSectorIds && userSectorIds.includes(product.sectorId);
        }

        // Outros roles (como USER) não podem gerenciar
        return false;
    };

    return (
        <Paper elevation={3} style={{ padding: '20px' }}>
            {/* Título fixo */}
            <Typography variant="h6" style={{ marginBottom: '10px' }}>Produtos</Typography>

            {/* Lista rolável */}
            <div style={{ height: '150px', overflowY: 'auto' }}>
                <List>
                    {products.map(product => {
                        
                        // 🚨 1. CALCULA A PERMISSÃO PARA ESTE ITEM 🚨
                        const canDelete = canManageProduct(product);
                        
                        return (
                            <ListItem
                                key={product.id}
                                secondaryAction={
                                    // 🚨 2. RENDERIZA CONDICIONALMENTE O BOTÃO 🚨
                                    canDelete && (
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
                                    )
                                }
                            >
                                <ListItemText
                                    primary={`${product.name} - R$ ${product.price}`}
                                    secondary={`Setor: ${product.Sector?.name || 'Sem setor'}`}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </div>
        </Paper>
    );
}

export default ProductList;