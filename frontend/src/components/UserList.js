import React, { useState, useMemo, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TableSortLabel, TablePagination,
    Typography, Paper, IconButton, Box, Divider,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Grid, Avatar, Tooltip, Chip,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { toast } from 'react-toastify';

const BACKEND_URL = 'http://localhost:3001';

const roleMap = {
    ADMIN: 'Administrador',
    VENDEDOR: 'Vendedor',
};
const roleChipMap = {
    ADMIN: {
        variant: 'filled',
        sx: {
            bgcolor: '#e3f2fd',
            color: '#1565c0',
            fontWeight: 'bold'
        }
    },
    VENDEDOR: {
        variant: 'filled',
        sx: {
            bgcolor: '#e8f5e9',
            color: '#2e7d32',
            fontWeight: 'bold'
        }
    },
    DEFAULT: {
        variant: 'filled',
        sx: {
            bgcolor: '#eeeeee',
            color: '#616161',
            fontWeight: 'bold'
        }
    }
};

const DeleteConfirmationModal = ({ open, handleClose, handleConfirm, userName }) => (
    <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
    >
        <DialogTitle id="delete-modal-title" sx={{ color: 'error.main', fontWeight: 'bold' }}>
            Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="delete-modal-description">
                Tem certeza que deseja excluir o usuário{' '}
                <Box component="span" sx={{ fontWeight: 'bold' }}>
                    {userName || 'selecionado'}
                </Box>
                ?
                <br />
                Esta ação é irreversível.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose} color="primary" variant="outlined" >
                Cancelar
            </Button>
            <Button onClick={handleConfirm} color="error" variant="contained" autoFocus>
                Excluir
            </Button>
        </DialogActions>
    </Dialog>
);


function descendingComparator(a, b, orderBy) {
    const getComparisonValue = (item, key) => {
        if (key === 'sectorName') {
            const sectorNames = item.Sectors?.map(s => s.name).join(', ') || '';
            return sectorNames.toLowerCase();
        }
        if (key === 'role') {
            return (roleMap[item.role] || item.role)?.toLowerCase() || '';
        }

        return item[key]?.toLowerCase() || '';
    };

    const aValue = getComparisonValue(a, orderBy);
    const bValue = getComparisonValue(b, orderBy);

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
    { id: 'name', numeric: false, label: 'Nome' },
    { id: 'role', numeric: false, label: 'Cargo' },
    { id: 'email', numeric: false, label: 'E-mail' },
    { id: 'sectorName', numeric: false, label: 'Setor' },
    { id: 'actions', numeric: false, label: 'Ações', disableSorting: true },
];

const dataCellStyles = {
    maxWidth: 250,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const nameCellStyles = {
    ...dataCellStyles,
    maxWidth: 200,
    minWidth: 200,
};

function UserList({
    users = [],
    onDelete,
    onEdit,
    loggedInUser = {}
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const availableRoles = useMemo(() => {
        const roles = new Set(users.map(user => user.role).filter(role => role));
        return Array.from(roles);
    }, [users]);

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

    const handleDeleteClick = useCallback((user) => {
        
        const userToDeleteId = String(user.id);
        const currentLoggedInId = String(loggedInUser.id);
        
        if (userToDeleteId === currentLoggedInId) {
            toast.error("Acesso negado. Administradores não podem deletar a si mesmos.");
            return;
        }

        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    }, [loggedInUser]);

    const handleCloseDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (userToDelete && onDelete) {
            onDelete(userToDelete.id);
        }
        handleCloseDeleteModal();
    }, [userToDelete, onDelete, handleCloseDeleteModal]);


    const sortedFilteredUsers = useMemo(() => {
        const usersToFilter = Array.isArray(users) ? users : [];

        const filtered = usersToFilter.filter(user => {
            let matchesSearch = true;
            let matchesRole = true;

            if (searchTerm) {
                const term = searchTerm.toLowerCase().trim();
                matchesSearch = (user.name && user.name.toLowerCase().includes(term)) ||
                    (user.email && user.email.toLowerCase().includes(term));
            }

            if (selectedRole && selectedRole !== 'all') {
                matchesRole = user.role === selectedRole;
            }

            return matchesSearch && matchesRole;
        });

        if (!orderBy) {
            return filtered.slice().sort((a, b) => b.id - a.id);
        }

        return stableSort(filtered, getComparator(order, orderBy));

    }, [users, searchTerm, selectedRole, order, orderBy]);

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, sortedFilteredUsers.length - page * rowsPerPage);

    return (
        <Paper elevation={3} sx={{ p: 2 }}>

            <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Buscar Usuário por Nome ou E-mail"
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
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel id="role-select-label">Cargo</InputLabel>
                            <Select
                                labelId="role-select-label"
                                id="role-select"
                                value={selectedRole}
                                label="Cargo"
                                onChange={(e) => {
                                    setSelectedRole(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <MenuItem value="all">
                                    <em style={{ color: '#757575' }}>Todos os Cargos</em>
                                </MenuItem>

                                {availableRoles.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {roleMap[role] || role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                </Grid>
            </Box>

            <Divider />

            <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader sx={{ minWidth: 750 }} aria-label="lista de usuários">

                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    align={headCell.numeric ? 'right' : 'left'}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                    sx={{
                                        minWidth: headCell.id === 'name' ? 200 : 150,
                                        ...(headCell.id === 'name' ? nameCellStyles : (headCell.id !== 'actions' ? dataCellStyles : {})),
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
                        {sortedFilteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                                        {
                                            (searchTerm || selectedRole !== 'all')
                                                ? 'Nenhum usuário encontrado com os filtros aplicados.'
                                                : 'Nenhum usuário cadastrado.'
                                        }
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedFilteredUsers
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((user) => {

                                    const cacheBuster = user.profilePicture ? `?t=${Date.now()}` : '';

                                    const profileSrc = user.profilePicture
                                        ? `${BACKEND_URL}${user.profilePicture}${cacheBuster}`
                                        : undefined;

                                    const fullName = user.name || '';
                                    const nameParts = fullName.split(' ');

                                    let displayName = nameParts[0] || '';
                                    if (nameParts.length > 1) {
                                        displayName += ' ' + nameParts[1];
                                    }

                                    let displaySectorName;
                                    let displayTooltip;
                                    let additionalSectorsCount = 0;

                                    if (user.role === 'ADMIN') {
                                        displaySectorName = 'Acesso Global';
                                        displayTooltip = 'Administrador possui acesso a todos os setores.';
                                    } else {
                                        const sectors = user.Sectors || [];

                                        displayTooltip = sectors.length > 0
                                            ? sectors.map(sector => sector.name).join(', ')
                                            : 'N/A';

                                        displaySectorName = sectors.length > 0
                                            ? sectors[0].name
                                            : 'N/A';

                                        additionalSectorsCount = sectors.length > 1
                                            ? sectors.length - 1
                                            : 0;
                                    }

                                    const roleLabel = roleMap[user.role] || user.role;
                                    const chipProps = roleChipMap[user.role] || roleChipMap.DEFAULT;

                                    const isDeletable = onDelete; 

                                    return (
                                        <TableRow
                                            hover
                                            tabIndex={-1}
                                            key={user.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >

                                            <TableCell component="th" scope="row" sx={nameCellStyles}>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar
                                                        src={profileSrc}
                                                        sx={{
                                                            bgcolor: user.profilePicture ? 'transparent' : '#bdbdbd',
                                                            color: 'white',
                                                            mr: 1.5,
                                                            width: 30,
                                                            height: 30,
                                                            fontSize: 16,
                                                        }}
                                                    >
                                                        {!user.profilePicture && user.name ? user.name[0].toUpperCase() : <AccountCircleIcon sx={{ fontSize: 18 }} />}
                                                    </Avatar>

                                                    <Tooltip title={fullName} placement="top" arrow>
                                                        <Typography variant="body2" noWrap>
                                                            {displayName}
                                                        </Typography>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>

                                            <TableCell align="left" sx={dataCellStyles}>
                                                <Chip
                                                    label={roleLabel}
                                                    size="small"
                                                    variant={chipProps.variant}
                                                    sx={{
                                                        ...chipProps.sx,
                                                        maxWidth: '100%',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell align="left" sx={dataCellStyles}>
                                                <Typography variant="body2" sx={dataCellStyles}>{user.email}</Typography>
                                            </TableCell>

                                            <TableCell align="left" sx={dataCellStyles}>
                                                <Tooltip title={displayTooltip} placement="top" arrow>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        whiteSpace: 'nowrap',
                                                        ...dataCellStyles
                                                    }}>
                                                        <Typography variant="body2" noWrap>
                                                            {displaySectorName}
                                                        </Typography>

                                                        {user.role !== 'ADMIN' && additionalSectorsCount > 0 && (
                                                            <Chip
                                                                label={`+${additionalSectorsCount}`}
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    fontSize: '0.65rem',
                                                                    fontWeight: 'bold',
                                                                    bgcolor: '#e0e0e0',
                                                                    color: '#424242',
                                                                    '& .MuiChip-label': {
                                                                        px: 1,
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell align="left">
                                                <Box display="flex" gap={1}>
                                                    {onEdit && (
                                                        <IconButton size="small" onClick={() => onEdit(user)}>
                                                            <EditIcon fontSize="small" color="info" />
                                                        </IconButton>
                                                    )}

                                                    {onDelete && (
                                                        <IconButton size="small" onClick={() => handleDeleteClick(user)}>
                                                            <DeleteIcon fontSize="small" color="error" />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                        )}
                        {emptyRows > 0 && sortedFilteredUsers.length > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={5} />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={sortedFilteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Linhas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />

            <DeleteConfirmationModal
                open={isDeleteModalOpen}
                handleClose={handleCloseDeleteModal}
                handleConfirm={handleConfirmDelete}
                userName={userToDelete ? userToDelete.name : ''}
            />
        </Paper>
    );
}

export default UserList;