import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    MenuItem,
    Paper,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Checkbox,
    Box,
    ListItemText,
    Typography,
    Avatar,
    IconButton
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

function UserForm({ sectors, onFinish }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [sectorIds, setSectorIds] = useState([]);
    const [role, setRole] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    const roleOptions = [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'VENDEDOR', label: 'Vendedor' },
    ];

    useEffect(() => {
        setName('');
        setEmail('');
        setPassword('');
        setSectorIds([]);
        setRole('');
        setProfilePictureFile(null);
        setFileName('');
        setPreviewUrl('');
    }, []);

    useEffect(() => {
        let objectUrl;
        
        if (profilePictureFile) {
            objectUrl = URL.createObjectURL(profilePictureFile);
            setPreviewUrl(objectUrl);
        } else {
            setPreviewUrl('');
        }
        
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [profilePictureFile]);

    const clearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRole('');
        setSectorIds([]);
        setProfilePictureFile(null);
        setFileName('');
        setPreviewUrl('');
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
        } else {
            setProfilePictureFile(null);
            setFileName('');
        }
    };

    const handleRemoveFile = () => {
        setProfilePictureFile(null); 
        setFileName('');
        setPreviewUrl(''); 
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('name', name);
        formData.append('email', email);
        formData.append('role', role);
        formData.append('password', password);

        sectorIds.forEach(id => formData.append('sectorIds[]', id));

        if (profilePictureFile) {
            formData.append('profilePicture', profilePictureFile);
        } 

        if (!name || !email || !role || !password) {
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

            await API.post('/users', formData, config);
            toast.success('Usuário criado com sucesso!');
            
            clearForm();
            onFinish();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao criar usuário.');
        }
    };

    const submitButtonText = 'Criar Usuário';
    const isAdmin = role.toUpperCase() === 'ADMIN';
    const hasImage = !!previewUrl; 

    return (
        <Paper elevation={3} style={{ padding: '10px' }} data-testid="user-form">
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
                        id="profile-picture-upload"
                        type="file"
                        onChange={handleFileChange}
                        key={'new-user-upload'}
                    />

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            Foto de Perfil (Opcional)
                        </Typography>
                        <label htmlFor="profile-picture-upload">
                            <Button variant="outlined" component="span">
                                Selecionar Foto
                            </Button>
                        </label>
                    </Box>
                </Box>

                <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required fullWidth margin="normal" />
                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth margin="normal" /> 

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
                    label="Senha"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

export default UserForm;