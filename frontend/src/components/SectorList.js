// frontend/src/components/SectorList.js

import React, { useMemo } from 'react';
import PropTypes from 'prop-types'; 
import { 
    List, ListItem, ListItemText, Typography, Paper, 
    IconButton, Box, Divider 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; 
import CategoryIcon from '@mui/icons-material/Category';

// BACKEND_URL, Avatar, AvatarGroup, e AccountCircleIcon removidos

function SectorList({ 
    sectors = [], 
    users = [], // Mantido para calcular a contagem
    onDelete, 
    onEdit, 
    userRole, 
    height = 350 
}) {

    const isAdmin = userRole && userRole.toUpperCase() === 'ADMIN';

    // Constantes de Layout
    const ACTIONS_WIDTH = 50; 
    // RESERVED_WIDTH foi ajustada para remover o espaço dos avatares (80px)
    // 40 é o espaço de margem à direita da lista, para alinhar o texto.
    const RESERVED_WIDTH = ACTIONS_WIDTH + 40; 
    
    // --- 1. Mapeamento de Usuários por Setor (Apenas Contagem) ---
    const sectorUserMap = useMemo(() => {
        const map = {};
        const allUsers = Array.isArray(users) ? users : [];

        // Filtra apenas usuários que têm setores (SectorList só se preocupa com eles)
        const usersWithSectors = allUsers.filter(user => 
            Array.isArray(user.sectorIds) && user.sectorIds.length > 0
        );

        sectors.forEach(sector => {
            // Contagem direta: Quantos usuários têm o ID desse setor no seu sectorIds
            const userCount = usersWithSectors.filter(user => 
                user.sectorIds.includes(sector.id)
            ).length;
            map[sector.id] = userCount; // Mapeia apenas a contagem
        });

        return map;
    }, [sectors, users]);


    // --- 2. Renderização ---
    return (
        <Paper elevation={3} sx={{ p: 1.25 }}> 
            
            <div style={{ height: `${height}px`, overflowY: 'auto' }}>
                <List disablePadding>
                    {sectors.map((sector, index) => {
                        
                        const userCount = sectorUserMap[sector.id] || 0;
                        
                        // O texto secundário agora só exibe a contagem
                        const secondaryText = userCount > 0 ? `Usuários vinculados: ${userCount}` : 'Nenhum usuário vinculado'; 
                        
                        return (
                            <React.Fragment key={sector.id}>
                                <ListItem
                                    sx={{ py: 1.5, px: 2 }} 
                                    secondaryAction={
                                        // Ações de Edição/Exclusão (Visível apenas para Admin)
                                        isAdmin && (
                                            <Box 
                                                display="flex" 
                                                flexDirection="column"
                                                alignItems="center"
                                                minWidth={ACTIONS_WIDTH}
                                            >
                                                <IconButton
                                                    edge="end" aria-label="edit" size="small"
                                                    onClick={() => onEdit && onEdit(sector)}
                                                    sx={{ color: '#1e88e5', '&:hover': { color: '#0d47a1' }, p: '4px' }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>

                                                <IconButton
                                                    edge="end" aria-label="delete" size="small"
                                                    onClick={() => onDelete && onDelete(sector.id)}
                                                    // Desabilita a exclusão se houver usuários vinculados, para evitar erros
                                                    disabled={userCount > 0} 
                                                    sx={{ 
                                                        color: userCount > 0 ? '#b71c1c' : '#f44336ff', // Cor mais suave se desabilitado
                                                        '&:hover': { color: '#c62828' }, 
                                                        p: '4px' 
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )
                                    }
                                >
                                    <CategoryIcon sx={{ color: '#bdbdbd', mr: 2, fontSize: 20, flexShrink: 0 }} />
                                    
                                    <ListItemText 
                                        primaryTypographyProps={{ fontWeight: 'medium', noWrap: true }}
                                        primary={sector.name}
                                        secondary={
                                             <Typography variant="body2" color="textSecondary">
                                                 {secondaryText} 
                                             </Typography>
                                        }
                                        sx={{
                                            flexGrow: 1,
                                            flexShrink: 1,
                                            minWidth: 0,
                                            mr: 2,
                                            // MaxWidth ajustado para considerar APENAS o espaço das ações
                                            maxWidth: isAdmin ? `calc(100% - ${RESERVED_WIDTH}px)` : '100%'
                                        }}
                                    />
                                </ListItem>

                                {index < sectors.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        );
                    })}

                    {sectors.length === 0 && (
                        <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                            Nenhum setor cadastrado.
                        </Typography>
                    )}
                </List>
            </div>
        </Paper>
    );
}

SectorList.propTypes = {
    sectors: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
    })).isRequired,
    // A prop 'users' continua necessária para o cálculo da contagem
    users: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        role: PropTypes.string,
        // O campo profilePicture não é mais usado, mas sectorIds é essencial
        sectorIds: PropTypes.arrayOf(PropTypes.number), 
    })),
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    userRole: PropTypes.string,
    height: PropTypes.number,
};

export default SectorList;