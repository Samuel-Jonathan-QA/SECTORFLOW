// frontend/src/components/ProductList.js

import React, { useState, useMemo } from 'react';
import {
    List, ListItem, ListItemText, Typography, Paper,
    IconButton, Box, Divider,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

function ProductList({
    products = [],
    sectors = [],
    searchTerm: controlledSearchTerm,
    onSearchChange: controlledOnSearchChange,
    selectedSectorId: controlledSelectedSectorId,
    onSectorChange: controlledOnSectorChange,
    showControls = true,
    onDelete,
    onEdit,
    userRole,
    userSectorIds,
    hideActions = false,
    height = 425
}) {

    const [internalSearchTerm, setInternalSearchTerm] = useState('');
    const [internalSelectedSectorId, setInternalSelectedSectorId] = useState('all');

    const currentSearchTerm = controlledSearchTerm !== undefined ? controlledSearchTerm : internalSearchTerm;
    const currentSelectedSectorId = controlledSelectedSectorId !== undefined ? controlledSelectedSectorId : internalSelectedSectorId;

    const handleSearchChange = controlledOnSearchChange
        ? controlledOnSearchChange
        : (e) => setInternalSearchTerm(e.target.value);

    const handleSectorChange = controlledOnSectorChange
        ? controlledOnSectorChange
        : (e) => setInternalSelectedSectorId(e.target.value);


    const canManageProduct = (product) => {
        if (!onEdit && !onDelete) return false;

        const role = userRole ? userRole.toUpperCase() : '';
        if (role === 'ADMIN') {
            return true;
        }
        if (role === 'VENDEDOR') {
            const validUserSectorIds = Array.isArray(userSectorIds) ? userSectorIds : [];
            return validUserSectorIds.includes(product.sectorId);
        }
        return false;
    };

    const PRICE_QUANTITY_WIDTH = 90;
    const ACTIONS_WIDTH = 50;
    const RESERVED_WIDTH = PRICE_QUANTITY_WIDTH + ACTIONS_WIDTH + 60;

    const filteredProducts = useMemo(() => {
        const productsToFilter = Array.isArray(products) ? products : [];

        const filtered = productsToFilter.filter(product => {
            let matchesSearch = true;
            let matchesSector = true;

            if (currentSearchTerm) {
                const term = currentSearchTerm.toLowerCase().trim();
                matchesSearch = product.name && product.name.toLowerCase().includes(term);
            }

            if (currentSelectedSectorId && currentSelectedSectorId !== 'all') {
                const sectorIdNum = Number(currentSelectedSectorId);
                matchesSector = product.sectorId === sectorIdNum;
            }

            return matchesSearch && matchesSector;
        });

        return filtered.slice().sort((a, b) => {
            return b.id - a.id;
        });

    }, [products, currentSearchTerm, currentSelectedSectorId]);

    const sectorsInDropdown = useMemo(() => {
        const allSectors = Array.isArray(sectors) ? sectors : [];
        const allProducts = Array.isArray(products) ? products : [];

        const sectorIdsInUse = new Set(allProducts.map(p => p.sectorId).filter(id => id !== undefined));

        return allSectors.filter(sector => sectorIdsInUse.has(sector.id));

    }, [products, sectors]); 


    return (
        <Paper elevation={3} style={{ padding: '10px' }}>

            {showControls && (
                <Box sx={{ mb: 2 }}>
                    <Grid container spacing={2}>

                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Buscar Produto por Nome"
                                variant="outlined"
                                size="small"
                                value={currentSearchTerm || ''}
                                onChange={handleSearchChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel id="sector-select-label">Setor</InputLabel>
                                <Select
                                    labelId="sector-select-label"
                                    id="sector-select"
                                    value={currentSelectedSectorId || 'all'}
                                    label="Setor"
                                    onChange={handleSectorChange}
                                >
                                    <MenuItem value="all">
                                        <em style={{ color: '#757575' }}>Todos os Setores</em>
                                    </MenuItem>
                                    {sectorsInDropdown.map((sector) => (
                                        <MenuItem key={sector.id} value={sector.id}>
                                            {sector.name}
                                        </MenuItem>
                                    ))}
                                    {currentSelectedSectorId !== 'all' &&
                                        !sectorsInDropdown.some(s => s.id === currentSelectedSectorId) &&
                                        sectors.find(s => s.id === currentSelectedSectorId) && (
                                            <MenuItem key={currentSelectedSectorId} value={currentSelectedSectorId} style={{ backgroundColor: '#fffbe5' }}>
                                                {sectors.find(s => s.id === currentSelectedSectorId)?.name} (Setor Ativo)
                                            </MenuItem>
                                        )}
                                </Select>
                            </FormControl>
                        </Grid>

                    </Grid>
                </Box>
            )}

            {showControls && <Divider sx={{ mb: 2 }} />}


            <div style={{ height: `${height}px`, overflowY: 'auto' }}>
                <List disablePadding>
                    {filteredProducts.map((product, index) => {

                        const canModify = canManageProduct(product);
                        const showActionsBlock = canModify && !hideActions;

                        const formattedPrice = new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        }).format(product.price || 0);

                        return (
                            <React.Fragment key={product.id}>
                                <ListItem
                                    sx={{ py: 1.5, px: 2 }}
                                    secondaryAction={
                                        <Box display="flex" alignItems="center">
                                            <Box textAlign="right" sx={{
                                                flexShrink: 0,
                                                minWidth: PRICE_QUANTITY_WIDTH,
                                                mr: showActionsBlock ? 1 : 0
                                            }}>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {formattedPrice}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {product.quantity || 0} un.
                                                </Typography>
                                            </Box>

                                            {showActionsBlock && (
                                                <Box
                                                    display="flex"
                                                    flexDirection="column"
                                                    alignItems="center"
                                                    minWidth={ACTIONS_WIDTH}
                                                >
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="edit"
                                                        size="small"
                                                        onClick={() => onEdit && onEdit(product)}
                                                        sx={{ color: '#1e88e5', '&:hover': { color: '#0d47a1' }, p: '4px' }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="delete"
                                                        size="small"
                                                        onClick={() => onDelete && onDelete(product.id)}
                                                        sx={{ color: '#f44336ff', '&:hover': { color: '#c62828' }, p: '4px' }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            )}
                                        </Box>
                                    }
                                >
                                    <LocalOfferIcon sx={{ color: '#bdbdbd', mr: 2, fontSize: 20, flexShrink: 0 }} />
                                    <ListItemText
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
                                        primary={<Typography variant="body1" fontWeight="medium" noWrap>{product.name}</Typography>}
                                        secondary={
                                            <Typography variant="body2" color="textSecondary">
                                                {'Setor: ' + (sectors.find(s => s.id === product.sectorId)?.name || 'Sem setor')}
                                            </Typography>
                                        }
                                        sx={{
                                            flexGrow: 0,
                                            flexShrink: 1,
                                            minWidth: 0,
                                            mr: 2,
                                            maxWidth: `calc(100% - ${RESERVED_WIDTH}px)`
                                        }}
                                    />

                                </ListItem>

                                {index < filteredProducts.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        );
                    })}
                </List>
                {filteredProducts.length === 0 && (
                    <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                        {
                            (currentSearchTerm || currentSelectedSectorId !== 'all')
                                ? 'Nenhum produto encontrado com os filtros aplicados.'
                                : 'Nenhum produto cadastrado.'
                        }
                    </Typography>
                )}
            </div>
        </Paper>
    );
}

export default ProductList;