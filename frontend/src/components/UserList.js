import React, { useState, useMemo } from 'react';
import { 
    List, ListItem, ListItemText, Typography, Paper,
    IconButton, Box, Divider,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Grid, Avatar // 🛑 NOVO: Importamos Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// 🛑 URL Base do Backend (Ajuste a porta se necessário)
const BACKEND_URL = 'http://localhost:3001'; 

function UserList({ 
    users = [], 
    onDelete, 
    onEdit 
}) {
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');

    const availableRoles = useMemo(() => {
        const roles = new Set(users.map(user => user.role).filter(role => role));
        return Array.from(roles);
    }, [users]);
    

    const filteredUsers = useMemo(() => {
        const usersToFilter = Array.isArray(users) ? users : [];

        const filtered = usersToFilter.filter(user => {
            let matchesSearch = true;
            let matchesRole = true;

            if (searchTerm) {
                const term = searchTerm.toLowerCase().trim();
                matchesSearch = user.name && user.name.toLowerCase().includes(term);
            }

            if (selectedRole && selectedRole !== 'all') {
                matchesRole = user.role === selectedRole;
            }
            
            return matchesSearch && matchesRole;
        });

        return filtered.slice().sort((a, b) => b.id - a.id);

    }, [users, searchTerm, selectedRole]);


    const LIST_HEIGHT = 440; 
    const ACTIONS_WIDTH = 50; 

    const renderActions = (user) => (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            minWidth={ACTIONS_WIDTH}
        >
            {/* BOTÃO DE EDIÇÃO */}
            {onEdit && (
                <IconButton
                    edge="end"
                    aria-label="edit"
                    size="small"
                    onClick={() => onEdit(user)}
                    sx={{ color: '#1e88e5', '&:hover': { color: '#0d47a1' }, p: '4px' }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            )}

            {onDelete && (
                <IconButton
                    edge="end"
                    aria-label="delete"
                    size="small"
                    onClick={() => onDelete(user.id)}
                    sx={{ color: '#f44336ff', '&:hover': { color: '#c62828' }, p: '4px' }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            )}
        </Box>
    );

    return (
        <Paper elevation={3} style={{ padding: '10px' }}>
            
            <Box sx={{ mb: 2 }}>
                
                <Grid container spacing={2}> 

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Buscar Usuário por Nome"
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel id="role-select-label">Cargo</InputLabel>
                            <Select
                                labelId="role-select-label"
                                id="role-select"
                                value={selectedRole}
                                label="Cargo"
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <MenuItem value="all">
                                    <em style={{ color: '#757575' }}>Todos os Cargos</em>
                                </MenuItem>
                                
                                {availableRoles.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                </Grid>
            </Box>

            <Divider sx={{ mb: 2 }} />


            <div style={{ height: `${LIST_HEIGHT}px`, overflowY: 'auto' }}>
                <List disablePadding>
                    
                    {filteredUsers.map((user, index) => {
                        
                        const secondaryText = `Cargo: ${user.role} | ${user.email}`;

                        // 🛑 Lógica para a foto de perfil: Se profilePicture existir, usamos o caminho completo do backend.
                        const profileSrc = user.profilePicture 
                            ? `${BACKEND_URL}${user.profilePicture}` 
                            : undefined;

                        return (
                            <React.Fragment key={user.id}>
                                <ListItem
                                    sx={{ py: 1.5, px: 2 }}
                                    secondaryAction={renderActions(user)}
                                >
                                    {/* 🛑 SUBSTITUIÇÃO: Ícone genérico por Avatar */}
                                    <Avatar 
                                        src={profileSrc} 
                                        sx={{ 
                                            bgcolor: user.profilePicture ? 'transparent' : '#bdbdbd', 
                                            color: 'white', 
                                            mr: 2, 
                                            width: 30, 
                                            height: 30, 
                                            fontSize: 16,
                                            flexShrink: 0
                                        }}
                                    >
                                        {!user.profilePicture && user.name ? user.name[0].toUpperCase() : <AccountCircleIcon />}
                                    </Avatar>
                                    
                                    <ListItemText
                                        primary={
                                            <Typography variant="body1" fontWeight="medium" noWrap>
                                                {user.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="textSecondary" noWrap>
                                                {secondaryText}
                                            </Typography>
                                        }
                                        primaryTypographyProps={{
                                            noWrap: true,
                                            sx: {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                minWidth: 0,
                                                display: 'block',
                                                whiteSpace: 'nowrap'
                                            }
                                        }}
                                        sx={{
                                            flexGrow: 1,
                                            flexShrink: 1,
                                            minWidth: 0,
                                            mr: 2,
                                            maxWidth: `calc(100% - ${ACTIONS_WIDTH + 40}px)`
                                        }}
                                    />
                                </ListItem>

                                {index < filteredUsers.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        );
                    })}
                    
                    {filteredUsers.length === 0 && (
                        <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                            {
                                (searchTerm || selectedRole !== 'all')
                                    ? 'Nenhum usuário encontrado com os filtros aplicados.'
                                    : 'Nenhum usuário cadastrado.'
                            }
                        </Typography>
                    )}
                </List>
            </div>
        </Paper>
    );
}

export default UserList;
