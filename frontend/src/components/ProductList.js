// frontend/src/components/ProductList.js

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types'; // ⬅️ Adicionado: Para validação de props
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

    // --- 1. Estado Interno (Para permitir controle interno ou externo) ---
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


    // --- 2. Lógica de Permissões ---
    const canManageProduct = (product) => {
        if (!onEdit && !onDelete) return false;

        const role = userRole ? userRole.toUpperCase() : '';
        if (role === 'ADMIN') {
            return true;
        }
        if (role === 'VENDEDOR') {
            const validUserSectorIds = Array.isArray(userSectorIds) ? userSectorIds : [];
            // Comparação de ID de setor: assume-se que sectorId é um número.
            return validUserSectorIds.includes(product.sectorId); 
        }
        return false;
    };

    // --- 3. Constantes de Layout ---
    const PRICE_QUANTITY_WIDTH = 90;
    const ACTIONS_WIDTH = 50;
    const RESERVED_WIDTH = PRICE_QUANTITY_WIDTH + ACTIONS_WIDTH + 60; // 60 é o padding/margem + ícone da tag

    // --- 4. Produtos Filtrados (Memorizado para performance) ---
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

        // Ordenação por ID decrescente (mais recente primeiro)
        return filtered.slice().sort((a, b) => {
            return b.id - a.id;
        });

    }, [products, currentSearchTerm, currentSelectedSectorId]);

    // --- 5. Setores para o Dropdown (Memorizado para performance) ---
    const sectorsInDropdown = useMemo(() => {
        const allSectors = Array.isArray(sectors) ? sectors : [];
        const allProducts = Array.isArray(products) ? products : [];

        const sectorIdsInUse = new Set(allProducts.map(p => p.sectorId).filter(id => id !== undefined));

        // Retorna apenas setores que possuem produtos
        return allSectors.filter(sector => sectorIdsInUse.has(sector.id));

    }, [products, sectors]); 


    // --- 6. Renderização ---
    return (
        // ⬅️ Ajuste: Usando sx no lugar de style, mais idiomático do MUI
        <Paper elevation={3} sx={{ p: 1.25 }}> 

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
                                    {/* Lógica para incluir o setor atual se ele estiver selecionado, mas não tiver produtos (situação incomum, mas tratada) */}
                                    {currentSelectedSectorId !== 'all' &&
                                        !sectorsInDropdown.some(s => Number(s.id) === Number(currentSelectedSectorId)) &&
                                        sectors.find(s => Number(s.id) === Number(currentSelectedSectorId)) && (
                                            <MenuItem 
                                                key={currentSelectedSectorId} 
                                                value={currentSelectedSectorId} 
                                                sx={{ backgroundColor: '#fffbe5' }} // ⬅️ Ajuste: Usando sx
                                            >
                                                {sectors.find(s => Number(s.id) === Number(currentSelectedSectorId))?.name} (Setor Ativo)
                                            </MenuItem>
                                        )}
                                </Select>
                            </FormControl>
                        </Grid>

                    </Grid>
                </Box>
            )}

            {showControls && <Divider sx={{ mb: 2 }} />}


            {/* ⬅️ Div com altura controlada e scroll */}
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
                                            {/* Bloco de Preço/Quantidade */}
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

                                            {/* Bloco de Ações (Editar/Excluir) */}
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
                                            // MaxWidth calcula o espaço disponível, subtraindo o preço/quantidade e ações
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

// ⬅️ Adicionado: Definição de PropTypes para robustez, Samuka.
ProductList.propTypes = {
    products: PropTypes.array,
    sectors: PropTypes.array,
    searchTerm: PropTypes.string,
    onSearchChange: PropTypes.func,
    selectedSectorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onSectorChange: PropTypes.func,
    showControls: PropTypes.bool,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    userRole: PropTypes.string,
    userSectorIds: PropTypes.array,
    hideActions: PropTypes.bool,
    height: PropTypes.number,
};

export default ProductList;