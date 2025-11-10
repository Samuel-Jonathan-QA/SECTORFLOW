// frontend/src/components/ProductList.js (Refatorado com Divisor)

// ✅ Importa Divider e React
import React from 'react';
import { List, ListItem, ListItemText, Typography, Paper, IconButton, Box, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // Novo ícone de edição

// Recebe a nova prop 'onEdit'
function ProductList({ products, onDelete, onEdit, userRole, userSectorIds }) {

    // Função helper para verificar se o usuário pode gerenciar o produto
    const canManageProduct = (product) => {
        // Se for ADMIN, sempre pode
        // AJUSTE: Usa toUpperCase() para robustez
        if (userRole && userRole.toUpperCase() === 'ADMIN') {
            return true;
        }

        // Se for VENDEDOR, só pode se o sectorId do produto estiver na sua lista
        // AJUSTE: Usa toUpperCase() para robustez
        if (userRole && userRole.toUpperCase() === 'VENDEDOR') {
            return userSectorIds && userSectorIds.includes(product.sectorId);
        }

        // Outros roles (como USER) não podem gerenciar
        return false;
    };

    return (
        <Paper elevation={3} style={{ padding: '10px' }}>
            <div style={{ height: '350px', overflowY: 'auto' }}>
                <List>
                    {/* Adicionamos 'index' ao map para controlar o Divider */}
                    {products.map((product, index) => {

                        // Calcula a permissão para este item
                        const canModify = canManageProduct(product);

                        return (
                            // Usamos React.Fragment para agrupar o item e o divisor
                            <React.Fragment key={product.id}>
                                <ListItem
                                    secondaryAction={
                                        // RENDERIZA CONDICIONALMENTE OS BOTÕES AGRUPADOS
                                        canModify && (
                                            <Box>
                                                {/* BOTÃO DE EDIÇÃO */}
                                                <IconButton
                                                    edge="end"
                                                    aria-label="edit"
                                                    // Chama onEdit e passa o objeto 'product' completo
                                                    onClick={() => onEdit(product)}
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
                                                    onClick={() => onDelete(product.id)}
                                                    sx={{
                                                        color: '#f44336ff',
                                                        '&:hover': { color: '#c62828' }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )
                                    }
                                >
                                    <ListItemText
                                        primary={`${product.name} - R$ ${product.price}`}
                                        secondary={`Setor: ${product.Sector?.name || 'Sem setor'}`}
                                    />
                                </ListItem>

                                {/* Adiciona o Divider se não for o último item */}
                                {index < products.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        );
                    })}
                </List>
            </div>
        </Paper>
    );
}

export default ProductList;