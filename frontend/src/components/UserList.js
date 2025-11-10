// frontend/src/components/UserList.jsx (COM DIVISOR)

// ✅ Importa Divider e React
import React from 'react';
import { List, ListItem, ListItemText, Typography, Paper, IconButton, Box, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// Recebe a nova prop 'onEdit' 
function UserList({ users, onDelete, onEdit }) {
    return (
        <Paper elevation={3} style={{ padding: '10px' }}>

            <div style={{ height: '440px', overflowY: 'auto' }}>
                <List>
                    {/* Exibe uma mensagem se a lista estiver vazia */}
                    {users.length === 0 && (
                        <ListItem>
                            <ListItemText primary="Nenhum usuário cadastrado." />
                        </ListItem>
                    )}

                    {/* Itera sobre os usuários e adiciona 'index' */}
                    {users.map((user, index) => (
                        // Usamos React.Fragment para agrupar o item e o divisor
                        <React.Fragment key={user.id}>
                            <ListItem
                                // Usamos Box para agrupar os dois botões no secondaryAction
                                secondaryAction={
                                    <Box>
                                        {/* BOTÃO DE EDIÇÃO */}
                                        <IconButton
                                            edge="end"
                                            aria-label="edit"
                                            // Chama onEdit e passa o objeto 'user' completo
                                            onClick={() => onEdit(user)}
                                            sx={{
                                                color: '#1e88e5', // Azul para Edição
                                                '&:hover': { color: '#0d47a1' },
                                                marginRight: 1 // Espaçamento entre os ícones
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>

                                        {/* BOTÃO DE DELETAR */}
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => onDelete(user.id)}
                                            sx={{
                                                color: '#f44336ff',
                                                '&:hover': { color: '#c62828' }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={`${user.name} - ${user.role}`}
                                    secondary={user.email}
                                />
                            </ListItem>

                            {/* Adiciona o Divider se não for o último item */}
                            {index < users.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            </div>
        </Paper>
    );
}

export default UserList;