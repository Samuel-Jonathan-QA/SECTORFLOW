import React, { useMemo } from 'react';
import PropTypes from 'prop-types'; 
import { 
    List, ListItem, ListItemText, Typography, Paper, 
    IconButton, Box, Divider 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; 
import CategoryIcon from '@mui/icons-material/Category';

function SectorList({ 
    sectors = [], 
    users = [],
    onDelete, 
    onEdit, 
    userRole, 
    height = 350 
}) {

    const isAdmin = userRole && userRole.toUpperCase() === 'ADMIN';

    const ACTIONS_WIDTH = 50; 
    const RESERVED_WIDTH = ACTIONS_WIDTH + 40; 
    
    const sectorUserMap = useMemo(() => {
        const map = {};
        const allUsers = Array.isArray(users) ? users : [];

        const usersWithSectors = allUsers.filter(user => 
            Array.isArray(user.sectorIds) && user.sectorIds.length > 0
        );

        sectors.forEach(sector => {
            const userCount = usersWithSectors.filter(user => 
                user.sectorIds.includes(sector.id)
            ).length;
            map[sector.id] = userCount;
        });

        return map;
    }, [sectors, users]);


    return (
        <Paper elevation={3} sx={{ p: 1.25 }}> 
            
            <div style={{ height: `${height}px`, overflowY: 'auto' }}>
                <List disablePadding>
                    {sectors.map((sector, index) => {
                        
                        const userCount = sectorUserMap[sector.id] || 0;
                        
                        const secondaryText = userCount > 0 ? `Usuários vinculados: ${userCount}` : 'Nenhum usuário vinculado'; 
                        
                        return (
                            <React.Fragment key={sector.id}>
                                <ListItem
                                    sx={{ py: 1.5, px: 2 }} 
                                    secondaryAction={
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
                                                    disabled={userCount > 0} 
                                                    sx={{ 
                                                        color: userCount > 0 ? '#b71c1c' : '#f44336ff',
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
    users: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        role: PropTypes.string,
        sectorIds: PropTypes.arrayOf(PropTypes.number), 
    })),
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    userRole: PropTypes.string,
    height: PropTypes.number,
};

export default SectorList;