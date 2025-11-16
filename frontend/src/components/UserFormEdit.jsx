import React, { useState, useEffect } from 'react';
import {
    TextField, Button, MenuItem, Paper, FormControl, InputLabel, Select,
    OutlinedInput, Checkbox, Box, ListItemText, Typography, Avatar, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
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

function UserEditForm({ sectors, currentUser, onFinish }) {
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

    const roleOptions = [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'VENDEDOR', label: 'Vendedor' },
    ];

    useEffect(() => {
        if (currentUser) { 
            setName(currentUser.name);
            setEmail(currentUser.email);
            setPassword('');
            setRole(currentUser.role || '');

            setProfilePictureFile(null); 
            setMustRemoveCurrentPicture(false); 
            
            if (currentUser.profilePicture) {
                setFileName('Foto Atual');
            } else {
                setFileName('');
            }

            const currentSectorIds = currentUser.Sectors
                ? currentUser.Sectors.map(s => s.id)
                : [];
            setSectorIds(currentSectorIds);
        }
    }, [currentUser]);

    useEffect(() => {
        let objectUrl;
        let finalPreviewUrl = '';
        
        if (profilePictureFile) {
            objectUrl = URL.createObjectURL(profilePictureFile);
            finalPreviewUrl = objectUrl;
        } 
        else if (currentUser && currentUser.profilePicture && !mustRemoveCurrentPicture) {
            finalPreviewUrl = currentUser.profilePicture;
        }
        
        setPreviewUrl(finalPreviewUrl);

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [profilePictureFile, currentUser, mustRemoveCurrentPicture]);


    const clearForm = () => {
    };

    useEffect(() => {
        if (role.toUpperCase() === 'ADMIN') {
            setSectorIds([]);
        }
    }, [role]);

    const handleSectorChange = (event) => {
        const { target: { value } } = event;
        setSectorIds(value);
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

        if (currentUser && currentUser.profilePicture) {
            setMustRemoveCurrentPicture(true);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('name', name);
        formData.append('role', role);
        formData.append('password', password);

        sectorIds.forEach(id => formData.append('sectorIds[]', id));

        if (profilePictureFile) {
            formData.append('profilePicture', profilePictureFile);
        } else if (currentUser.profilePicture && mustRemoveCurrentPicture) {
            formData.append('profilePictureRemove', 'true');
        } 

        if (!name || !email || !role) {
            toast.error('Preencha todos os campos obrigatórios.');
            return;
        }

        if (role.toUpperCase() === 'VENDEDOR' && (!sectorIds || sectorIds.length === 0)) {
            toast.error('Vendedores devem ser associados a pelo menos um setor.');
            return;
        }

        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (!password) {
                formData.delete('password'); 
            }

            await API.put(`/users/${currentUser.id}`, formData, config);
            toast.success('Usuário atualizado com sucesso!');
            
            onFinish();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao atualizar usuário.');
        }
    };

    const submitButtonText = 'Salvar Edição';
    const passwordRequired = false;
    const isAdmin = role.toUpperCase() === 'ADMIN';
    const hasImage = !!previewUrl; 

    return (
        <Paper elevation={3} style={{ padding: '10px' }} data-testid="user-edit-form">
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
                            src={previewUrl.startsWith('/uploads') ? `${BACKEND_URL}${previewUrl}` : previewUrl}
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
                        id="profile-picture-upload-edit"
                        type="file"
                        onChange={handleFileChange}
                        key={currentUser ? currentUser.id : 'edit-user-upload'} 
                    />

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            Foto de Perfil (Opcional)
                        </Typography>
                        <label htmlFor="profile-picture-upload-edit">
                            <Button variant="outlined" component="span">
                                Selecionar Foto
                            </Button>
                        </label>
                    </Box>
                </Box>
                
                <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required fullWidth margin="normal" />
                <TextField label="Email" type="email" value={email} required fullWidth margin="normal" disabled/>

                <TextField
                    select
                    label="Role (Função)"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    fullWidth
                    margin="normal"
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
                    required={!isAdmin}
                    disabled={isAdmin}
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
                                    checked={sectorIds.indexOf(sector.id) > -1}
                                    size="small"
                                />
                                <ListItemText primary={sector.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label={"Nova Senha (Opcional)"}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={passwordRequired}
                    fullWidth
                    margin="normal"
                />

                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                    {submitButtonText}
                </Button>
            </form>
        </Paper>
    );
}

export default UserEditForm;
