import React, { useState, useEffect, useCallback } from 'react';
import {
    TextField, Button, MenuItem, Paper, FormControl, InputLabel, Select,
    OutlinedInput, Checkbox, Box, ListItemText, Typography, Avatar, IconButton,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import API from '../api';
import { toast } from 'react-toastify';

const BACKEND_URL = 'http://localhost:3001';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 1;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 350,
        },
    },
};


const validateName = (name) => {
    const trimmedName = name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 50) {
        return 'O nome deve conter de 3 a 50 caracteres.';
    }
    const validNameRegex = /^[a-zA-Z\s\u00C0-\u00FF'-]+$/;
    if (!validNameRegex.test(trimmedName)) {
        return 'Nome inválido. Use apenas letras, espaços, hífens e apóstrofos.';
    }
    const atLeastThreeLettersRegex = /[a-zA-Z\u00C0-\u00FF].*[a-zA-Z\u00C0-\u00FF].*[a-zA-Z\u00C0-\u00FF]/;
    if (!atLeastThreeLettersRegex.test(trimmedName)) {
        return 'O nome deve conter pelo menos 3 caracteres de letra.';
    }
    return '';
};

const validateEmail = (email) => {
    if (!email) {
        return 'O e-mail é obrigatório.';
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        return 'Formato de e-mail inválido.';
    }
    return '';
};

const validatePassword = (password, isEditing) => {
    if (!password && !isEditing) {
        return 'A senha é obrigatória na criação.';
    }
    if (!password && isEditing) {
        return ''; // Senha é opcional na edição
    }
    if (password.length < 8) {
        return `A ${isEditing ? 'nova ' : ''}senha deve ter pelo menos 8 caracteres.`;
    }
    const complexRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).+$/;
    if (!complexRegex.test(password)) {
        return `A ${isEditing ? 'nova ' : ''}senha deve conter letras e números.`;
    }
    return '';
};


const ConfirmCancelDialog = ({ open, onConfirm, onClose }) => (
    <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth 
        maxWidth="xs" 
    >
        <DialogTitle id="alert-dialog-title">{"Atenção!"}</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
            <DialogContentText id="alert-dialog-description">
                Tem certeza de que deseja cancelar? Quaisquer alterações feitas não serão salvas.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary" variant="text"> 
                Continuar Editando
            </Button>
            <Button onClick={onConfirm} color="error" variant="contained" autoFocus> 
                Confirmar Cancelamento
            </Button>
        </DialogActions>
    </Dialog>
);



function UserForm({ sectors, currentUser, onFinish, isSelfEdit = false, onUserUpdate }) {
    const isEditing = !!currentUser;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [sectorIds, setSectorIds] = useState([]);
    const [role, setRole] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [mustRemoveCurrentPicture, setMustRemoveCurrentPicture] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] = useState(false);

    const roleOptions = [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'VENDEDOR', label: 'Vendedor' },
    ];

    const clearForm = useCallback(() => {
        setName('');
        setEmail('');
        setPassword('');
        setSectorIds([]);
        setRole('');
        setProfilePictureFile(null);
        setFileName('');
        setPreviewUrl('');
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setMustRemoveCurrentPicture(false);
    }, []);

    useEffect(() => {
        if (isEditing) {
            setName(currentUser.name || '');
            setEmail(currentUser.email || '');
            setPassword(''); 
            setRole(currentUser.role || '');

            setProfilePictureFile(null);
            setMustRemoveCurrentPicture(false);
            setFileName(currentUser.profilePicture ? 'Foto Atual' : '');

            const currentSectorIds = currentUser.Sectors
                ? currentUser.Sectors.map(s => s.id)
                : [];
            setSectorIds(currentSectorIds);
        } else {
            clearForm(); 
        }
    }, [isEditing, currentUser, clearForm]);


    useEffect(() => {
        let objectUrl;
        let finalPreviewUrl = '';

        if (profilePictureFile) {
            objectUrl = URL.createObjectURL(profilePictureFile);
            finalPreviewUrl = objectUrl;
        }
        else if (isEditing && currentUser && currentUser.profilePicture && !mustRemoveCurrentPicture) {
            finalPreviewUrl = currentUser.profilePicture.startsWith(BACKEND_URL) 
                ? currentUser.profilePicture 
                : `${BACKEND_URL}${currentUser.profilePicture}`;
        }

        setPreviewUrl(finalPreviewUrl);

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [profilePictureFile, currentUser, mustRemoveCurrentPicture, isEditing]);

    useEffect(() => {
        if (role.toUpperCase() === 'ADMIN') {
            setSectorIds([]);
        }
    }, [role]);


    const handleNameChange = (e) => {
        const newName = e.target.value;
        setName(newName);
        setNameError(validateName(newName));
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value.toLowerCase();
        setEmail(newEmail);
        setEmailError(validateEmail(newEmail));
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordError(validatePassword(newPassword, isEditing));
    };


    const handleSectorChange = (event) => {
        const { target: { value } } = event;
        const newSectorIds = Array.isArray(value)
            ? value.map(id => (typeof id === 'string' ? parseInt(id, 10) : id))
            : value;
        setSectorIds(newSectorIds);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            setFileName(file.name);
            setMustRemoveCurrentPicture(false); 
        } else {
            setProfilePictureFile(null);
            setFileName('');
        }
    };

    const handleRemoveFile = () => {
        setProfilePictureFile(null);
        setFileName('');
        setPreviewUrl('');

        if (isEditing && currentUser && currentUser.profilePicture) {
            setMustRemoveCurrentPicture(true); 
        }
    };

    const handleCancelClick = () => {
        setIsCancelConfirmationOpen(true);
    };

    const handleCancelConfirm = () => {
        setIsCancelConfirmationOpen(false);
        if (onFinish) onFinish(); 
    };

    const handleCancelClose = () => {
        setIsCancelConfirmationOpen(false);
    };


    // --- Handler de Submissão ---

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nameValidationError = validateName(name);
        const emailValidationError = validateEmail(email);
        const passwordValidationError = validatePassword(password, isEditing);

        setNameError(nameValidationError);
        setEmailError(emailValidationError);
        setPasswordError(passwordValidationError);

        if (nameValidationError || emailValidationError || passwordValidationError) {
            toast.error('Corrija os erros nos campos antes de prosseguir.');
            return;
        }

        const trimmedName = name.trim();
        const formData = new FormData();

        formData.append('name', trimmedName);
        formData.append('email', email);
        formData.append('role', role);

        if (password) {
            formData.append('password', password); 
        } else if (!isEditing) {
            toast.error('A senha é obrigatória na criação de um novo usuário.');
            return;
        }

        const safeSectorIds = Array.isArray(sectorIds) ? sectorIds : [];
        const isAdmin = role.toUpperCase() === 'ADMIN';

        if (!isAdmin && !isSelfEdit) { 
            safeSectorIds.forEach(id => formData.append('sectorIds[]', id));
        }


        if (profilePictureFile) {
            formData.append('profilePicture', profilePictureFile); 
        } else if (isEditing && currentUser.profilePicture && mustRemoveCurrentPicture) {
            formData.append('profilePictureRemove', 'true'); 
        }

        if (!isSelfEdit && role.toUpperCase() === 'VENDEDOR' && safeSectorIds.length === 0) {
            toast.error('Vendedores devem ser associados a pelo menos um setor.');
            return;
        }

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            let response;

            if (isEditing) {
                response = await API.put(`/users/${currentUser.id}`, formData, config);
            } else {
                response = await API.post('/users', formData, config);
            }

            const updatedUserFromBackend = response.data;

            if (isEditing && isSelfEdit) {
                const updatePayload = {
                    name: updatedUserFromBackend.name,
                    email: updatedUserFromBackend.email,
                    profilePicture: updatedUserFromBackend.profilePicture, 
                };
                
                if (onUserUpdate) {
                    onUserUpdate(updatePayload); 
                }
                
            } else {
                if (onUserUpdate) {
                    onUserUpdate(updatedUserFromBackend);
                }
                
                if (!isEditing) clearForm();
            }

        } catch (error) {
            const backendError = error.response?.data?.error || (isEditing ? 'Erro ao atualizar usuário.' : 'Erro ao criar usuário.');
            toast.error(backendError);

            if (backendError.toLowerCase().includes('email')) {
                setEmailError(backendError);
            } else if (backendError.toLowerCase().includes('nome')) {
                setNameError(backendError);
            } else if (backendError.toLowerCase().includes('senha')) {
                setPasswordError(backendError);
            }
        }
    };

    const submitButtonText = isEditing ? (isSelfEdit ? 'Salvar Alterações' : 'Salvar Edição') : 'Criar Usuário';
    const isAdmin = role.toUpperCase() === 'ADMIN';


    const disableRoleAndSectors = isSelfEdit; 

    const hasImage = !!previewUrl;

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <Box data-testid={isEditing ? "user-edit-form" : "user-form-create"}>
            <ConfirmCancelDialog
                open={isCancelConfirmationOpen}
                onConfirm={handleCancelConfirm}
                onClose={handleCancelClose}
            />

            <form onSubmit={handleSubmit}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 3,
                        mt: 1
                    }}
                >
                    <Box
                        sx={{
                            display: 'inline-block',
                            position: 'relative',
                            mb: 1,
                            borderRadius: '50%',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={() => hasImage && setIsHovered(true)}
                        onMouseLeave={() => hasImage && setIsHovered(false)}
                    >
                        <Avatar
                            src={previewUrl.startsWith('blob:') || previewUrl.startsWith(BACKEND_URL) ? previewUrl : `${BACKEND_URL}${previewUrl}`}
                            alt="Foto de Perfil"
                            sx={{
                                width: 80,
                                height: 80,
                                border: hasImage ? '1px solid #ccc' : '1px solid #666',
                                bgcolor: hasImage ? 'transparent' : 'grey.300',
                                color: hasImage ? 'inherit' : 'grey.600',
                            }}
                        >
                            {!hasImage && <PersonIcon sx={{ fontSize: 50 }} />}
                        </Avatar>

                        {hasImage && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                    opacity: isHovered ? 1 : 0,
                                    transition: 'opacity 0.3s ease',
                                    cursor: 'pointer',
                                }}
                                onClick={handleRemoveFile}
                            >
                                <DeleteIcon sx={{ color: 'white', fontSize: 30 }} />
                            </Box>
                        )}
                    </Box>

                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="profile-picture-upload"
                        type="file"
                        onChange={handleFileChange}
                        key={isEditing ? currentUser.id : 'new-user-upload'} 
                    />

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            Foto de Perfil (Opcional)
                        </Typography>
                        <label htmlFor="profile-picture-upload">
                            <Button variant="outlined" component="span">
                                {isEditing && hasImage ? 'Trocar Foto' : 'Selecionar Foto'}
                            </Button>
                        </label>
                    </Box>
                </Box>

                <TextField
                    label="Nome"
                    value={name}
                    onChange={handleNameChange}
                    required
                    fullWidth
                    margin="normal"
                    error={!!nameError}
                    helperText={nameError}
                    inputProps={{ maxLength: 50 }}
                />

                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    fullWidth
                    margin="normal"
                    error={!!emailError}
                    helperText={emailError}
                    inputProps={{
                        autocomplete: isEditing ? 'off' : 'email',
                    }}
                />

                <TextField
                    select
                    label="Role (Função)"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    fullWidth
                    margin="normal"
                    disabled={disableRoleAndSectors} 
                >
                    {roleOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <FormControl
                    fullWidth
                    margin="normal"
                    required={!isAdmin && !disableRoleAndSectors && role.toUpperCase() === 'VENDEDOR'} 
                    disabled={disableRoleAndSectors || isAdmin} 
                    error={!isAdmin && role.toUpperCase() === 'VENDEDOR' && sectorIds.length === 0 && !disableRoleAndSectors}
                >
                    <InputLabel id="sector-select-label">Setores</InputLabel>
                    <Select
                        labelId="sector-select-label"
                        multiple
                        value={sectorIds}
                        onChange={handleSectorChange}
                        input={<OutlinedInput id="select-multiple-chip" label="Setores" />}
                        renderValue={(selectedIds) => {
                            const selectedNames = sectors
                                .filter(sector => selectedIds.includes(sector.id))
                                .map(sector => sector.name);
                            return selectedNames.join(', ');
                        }}
                        MenuProps={MenuProps}
                    >
                        {sectors.map(sector => (
                            <MenuItem
                                key={sector.id}
                                value={sector.id}
                                dense
                            >
                                <Checkbox
                                    checked={sectorIds.includes(sector.id)}
                                    size="small"
                                />
                                <ListItemText primary={sector.name} />
                            </MenuItem>
                        ))}
                    </Select>
                    {!isAdmin && role.toUpperCase() === 'VENDEDOR' && sectorIds.length === 0 && !disableRoleAndSectors && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            Vendedores devem ser associados a pelo menos um setor.
                        </Typography>
                    )}
                </FormControl>

                <TextField
                    label={isEditing ? "Nova Senha (Opcional)" : "Senha"}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    required={!isEditing}
                    fullWidth
                    margin="normal"
                    error={!!passwordError}
                    helperText={passwordError || (isEditing ? 'Deixe em branco para manter a senha atual. Mínimo de 8 caracteres, com letras e números.' : 'Mínimo de 8 caracteres, com letras e números.')}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    inputProps={{
                        autocomplete: 'new-password',
                    }}
                />

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent:  'space-between',
                        gap: 2,
                        p: 2, 
                        mt: 2, 
                        position: 'sticky',
                        bottom: 0,
                        zIndex: 10, 
                        backgroundColor: '#fff', 
                    }}
                >
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancelClick} 
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        {submitButtonText}
                    </Button>
                </Box>
            </form>
        </Box>
    );
}

export default UserForm;