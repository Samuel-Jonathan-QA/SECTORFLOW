// frontend/src/components/UserList.jsx (PADRÃO DE REFERÊNCIA)

import { List, ListItem, ListItemText, Typography, Paper, IconButton, Box } from '@mui/material'; // Adicionado Box
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

                    {users.map(user => (
                        <ListItem
                            key={user.id}
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