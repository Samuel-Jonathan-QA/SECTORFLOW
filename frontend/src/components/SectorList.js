import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TableSortLabel, TablePagination,
    Typography, Paper, IconButton, Box, Divider,
    TextField, Grid, Tooltip, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';

function descendingComparator(a, b, orderBy) {
    let aValue;
    let bValue;

    if (orderBy === 'userCount') {
        aValue = a.userCount || 0;
        bValue = b.userCount || 0;

        if (bValue < aValue) return -1;
        if (bValue > aValue) return 1;
        return 0;
    }

    // Para 'name'
    aValue = a[orderBy]?.toLowerCase() || '';
    bValue = b[orderBy]?.toLowerCase() || '';


    if (bValue < aValue) {
        return -1;
    }
    if (bValue > aValue) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    { id: 'name', numeric: false, label: 'Setor' },
    { id: 'userCount', numeric: true, label: 'Usuários' },
    { id: 'actions', numeric: false, label: 'Ações', disableSorting: true },
];

const dataCellStyles = {
    maxWidth: 300,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const nameCellStyles = {
    ...dataCellStyles,
    maxWidth: 400,
    minWidth: 250,
};

function SectorList({
    sectors = [],
    users = [],
    onDelete,
    onEdit,
    userRole,
    height = 500
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('name');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const isAdmin = userRole && userRole.toUpperCase() === 'ADMIN';

    const sectorsWithCounts = useMemo(() => {
        const allUsers = Array.isArray(users) ? users : [];
        const usersWithSectors = allUsers.filter(user =>
            Array.isArray(user.sectorIds) && user.sectorIds.length > 0
        );

        return (Array.isArray(sectors) ? sectors : []).map(sector => {
            const userCount = usersWithSectors.filter(user =>
                user.sectorIds.includes(sector.id)
            ).length;

            return {
                ...sector,
                userCount: userCount
            };
        });
    }, [sectors, users]);


    const sortedFilteredSectors = useMemo(() => {
        const filtered = sectorsWithCounts.filter(sector => {
            if (!searchTerm) return true;

            const term = searchTerm.toLowerCase().trim();
            return sector.name && sector.name.toLowerCase().includes(term);
        });

        if (!orderBy) {
            return filtered.slice().sort((a, b) => b.id - a.id);
        }

        return stableSort(filtered, getComparator(order, orderBy));

    }, [sectorsWithCounts, searchTerm, order, orderBy]);


    const handleRequestSort = useCallback((property) => {
        let newOrder = 'asc';
        let newOrderBy = property;

        if (orderBy === property) {
            if (order === 'asc') {
                newOrder = 'desc';
            } else if (order === 'desc') {
                newOrderBy = null;
                newOrder = 'asc';
            }
        }

        setOrder(newOrder);
        setOrderBy(newOrderBy);
        setPage(0);
    }, [order, orderBy]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, sortedFilteredSectors.length - page * rowsPerPage);


    return (
        <Paper elevation={3} sx={{ p: 2 }}>

            <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Buscar Setor por Nome"
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(0);
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                    </Grid>
                </Grid>
            </Box>

            <Divider />

            <TableContainer sx={{ maxHeight: height }}>
                <Table stickyHeader sx={{ minWidth: 650 }} aria-label="lista de setores">

                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    align={headCell.numeric ? 'right' : 'left'}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                    sx={{
                                        minWidth: headCell.id === 'name' ? 250 : 150,
                                        pr: headCell.id === 'actions' ? 3 : 0
                                    }}
                                >
                                    {headCell.disableSorting ? (
                                        <Typography fontWeight="bold" sx={{ pr: headCell.id === 'actions' ? 3 : 0 }}>
                                            {headCell.label}
                                        </Typography>
                                    ) : (
                                        <TableSortLabel
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={() => handleRequestSort(headCell.id)}
                                        >
                                            <Typography fontWeight="bold">
                                                {headCell.label}
                                            </Typography>
                                        </TableSortLabel>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {sortedFilteredSectors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                                        {
                                            searchTerm
                                                ? 'Nenhum setor encontrado com os filtros aplicados.'
                                                : 'Nenhum setor cadastrado.'
                                        }
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedFilteredSectors
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((sector) => {
                                    const userCount = sector.userCount;
                                    const isDeletable = onDelete && userCount === 0;

                                    return (
                                        <TableRow
                                            hover
                                            tabIndex={-1}
                                            key={sector.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >

                                            <TableCell component="th" scope="row" sx={nameCellStyles}>
                                                <Box display="flex" alignItems="center">
                                                    <CategoryIcon
                                                        sx={{
                                                            color: '#bdbdbd',
                                                            mr: 1.5,
                                                            width: 30,
                                                            height: 30,
                                                            p: 0.5,
                                                            boxSizing: 'border-box'
                                                        }}
                                                    />
                                                    <Tooltip title={sector.name} placement="top" arrow>
                                                        <Typography variant="body2" noWrap>
                                                            {sector.name}
                                                        </Typography>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>

                                            {/* Coluna de Usuários */}
                                            <TableCell align="right" sx={dataCellStyles}>
                                                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                                                    <Chip
                                                        icon={<PersonIcon fontSize="small" />}
                                                        label={`${userCount} Usuário${userCount !== 1 ? 's' : ''}`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            bgcolor: userCount > 0 ? '#f0f4c3' : '#eeeeee',
                                                            color: userCount > 0 ? '#827717' : '#616161',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>

                                            {/* Coluna de Ações */}
                                            <TableCell align="left">
                                                {isAdmin && (
                                                    <Box display="flex" gap={1}>
                                                        {onEdit && (
                                                            <IconButton size="small" onClick={() => onEdit(sector)}>
                                                                <EditIcon fontSize="small" color="info" />
                                                            </IconButton>
                                                        )}

                                                        {onDelete && (
                                                            <Tooltip
                                                                title={userCount > 0 ? 'Não é possível excluir setores com usuários vinculados.' : 'Excluir Setor'}
                                                                placement="top"
                                                                arrow
                                                            >
                                                                <span>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => onDelete(sector.id)}
                                                                        disabled={!isDeletable}
                                                                    >
                                                                        <DeleteIcon
                                                                            fontSize="small"
                                                                            color={isDeletable ? 'error' : 'disabled'}
                                                                        />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                        )}
                        {emptyRows > 0 && sortedFilteredSectors.length > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={3} />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={sortedFilteredSectors.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Linhas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
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