// frontend/src/components/UserFormCreate.jsx

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

// ----------------------------------------------------
// ✅ VALIDAÇÕES PADRONIZADAS (Usadas nos dois forms)

// Validação de Nome: Garante letras, espaços, apóstrofos e hífens, com pelo menos 3 letras.
const validateName = (name) => {
    const trimmedName = name.trim();
    
    // 🚩 AJUSTE 1: Lógica de validação de comprimento (min: 3, max: 50)
    if (trimmedName.length < 3 || trimmedName.length > 50) {
        return 'O nome deve conter de 3 a 50 caracteres.';
    }

    // Regex: Permite Letras (com acentos), espaços (\s), apóstrofo ('), hífen (-)
    const validNameRegex = /^[a-zA-Z\s\u00C0-\u00FF'-]+$/;
    
    if (!validNameRegex.test(trimmedName)) {
        return 'Nome inválido. Use apenas letras, espaços, hífens e apóstrofos. Não é permitido o uso de números ou caracteres especiais.';
    }
    
    // Garante que haja pelo menos 3 caracteres de letra para evitar entradas como '---' ou 'a b'
    const atLeastThreeLettersRegex = /[a-zA-Z\u00C0-\u00FF].*[a-zA-Z\u00C0-\u00FF].*[a-zA-Z\u00C0-\u00FF]/;
    
    if (!atLeastThreeLettersRegex.test(trimmedName)) {
        return 'O nome deve conter pelo menos 3 caracteres de letra.';
    }
    
    return ''; // Retorna string vazia se for válido
};

// Validação de E-mail: Verifica o formato básico de e-mail.
const validateEmail = (email) => {
    if (!email) {
        return 'O e-mail é obrigatório.';
    }
    // Regex simples para formato (algo@algo.algo)
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        return 'Formato de e-mail inválido.';
    }
    return '';
};

// Validação de Senha (Para criação): Garante complexidade mínima.
const validatePassword = (password) => {
    if (!password) {
        return 'A senha é obrigatória na criação.';
    }
    if (password.length < 8) {
        return 'A senha deve ter pelo menos 8 caracteres.';
    }
    // Adiciona uma regra de complexidade simples (pelo menos 1 letra e 1 número)
    const complexRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).+$/;
    if (!complexRegex.test(password)) {
        return 'A senha deve conter letras e números.';
    }
    return '';
};

// ----------------------------------------------------


function UserFormCreate({ sectors, onFinish }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [sectorIds, setSectorIds] = useState([]);
    const [role, setRole] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 
    
    // ✅ ESTADOS DE ERRO PADRONIZADOS
    const [nameError, setNameError] = useState(''); 
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const roleOptions = [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'VENDEDOR', label: 'Vendedor' },
    ];

    // ✅ REFACTOR: Centralizar a lógica de limpeza do formulário
    const clearForm = () => {
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
    };

    // Efeito para limpar o formulário na montagem (usando a função centralizada)
    useEffect(() => {
        clearForm();
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

    
    // Efeito para limpar setores se for ADMIN
    useEffect(() => {
        if (role.toUpperCase() === 'ADMIN') {
            setSectorIds([]);
        }
    }, [role]);
    
    
    // ✅ NOVO: Função para lidar com a mudança do nome e validar em tempo real
    const handleNameChange = (e) => {
        const newName = e.target.value;
        setName(newName);
        
        // Validação imediata para feedback visual
        // O Máximo de 50 caracteres é garantido pelo inputProps no TextField
        const error = validateName(newName);
        setNameError(error);
    };

    // ✅ NOVO: Função para lidar com a mudança do email e validar em tempo real
    const handleEmailChange = (e) => {
        // Converte o valor para minúsculo antes de armazenar
        const newEmail = e.target.value.toLowerCase();
        setEmail(newEmail);
        
        // Validação imediata para feedback visual
        const error = validateEmail(newEmail);
        setEmailError(error);
    };

    // ✅ NOVO: Função para lidar com a mudança da senha e validar em tempo real
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        
        // Validação imediata para feedback visual
        const error = validatePassword(newPassword);
        setPasswordError(error);
    };


    const handleSectorChange = (event) => {
        const { target: { value } } = event;
        // Padronizando a conversão para número
        const newSectorIds = Array.isArray(value)
            ? value.map(id => {
                if (typeof id === 'string') {
                    return parseInt(id, 10);
                }
                return id;
            })
            : value;

        setSectorIds(newSectorIds);
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

        // 1. Validação Final de Campos (Usando as funções padronizadas)
        const nameValidationError = validateName(name);
        const emailValidationError = validateEmail(email);
        const passwordValidationError = validatePassword(password);

        if (nameValidationError) setNameError(nameValidationError);
        if (emailValidationError) setEmailError(emailValidationError);
        if (passwordValidationError) setPasswordError(passwordValidationError);

        if (nameValidationError || emailValidationError || passwordValidationError) {
             toast.error('Corrige os erros nos campos antes de prosseguir.');
             return;
        }

        const trimmedName = name.trim();
        const formData = new FormData();

        formData.append('name', trimmedName);
        formData.append('email', email);
        formData.append('role', role);
        formData.append('password', password); 

        const safeSectorIds = Array.isArray(sectorIds) ? sectorIds : [];
        safeSectorIds.forEach(id => formData.append('sectorIds[]', id));


        if (profilePictureFile) {
            formData.append('profilePicture', profilePictureFile);
        } 

        // 2. Validação de Regra de Negócio
        if (role.toUpperCase() === 'VENDEDOR' && (!Array.isArray(sectorIds) || sectorIds.length === 0)) {
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

    // ⬅️ NOVO: Funções para alternar a visibilidade da senha
    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };


    return (
        <Paper elevation={3} style={{ padding: '10px' }} data-testid="user-form-create">
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

                <TextField 
                    label="Nome" 
                    value={name} 
                    onChange={handleNameChange} // ✅ Usando a função padronizada
                    required 
                    fullWidth 
                    margin="normal" 
                    error={!!nameError} 
                    helperText={nameError} 
                    // 🚩 AJUSTE: Adiciona o limite de 50 caracteres no campo de entrada (HTML)
                    inputProps={{ maxLength: 50 }} 
                />
                
                <TextField 
                    label="Email" 
                    type="email" 
                    value={email} 
                    onChange={handleEmailChange} // ✅ Usando a função padronizada
                    required 
                    fullWidth 
                    margin="normal" 
                    error={!!emailError}
                    helperText={emailError}
                    // ⬅️ NOVO: Desativa o autocompletar para o e-mail
                    inputProps={{
                        autocomplete: 'off',
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
                                    checked={sectorIds.includes(sector.id)} 
                                    size="small"
                                />
                                <ListItemText primary={sector.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Senha"
                    // MUDANÇA: Usa o estado para alternar o tipo
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange} // ✅ Usando a função padronizada
                    required
                    fullWidth
                    margin="normal"
                    error={!!passwordError}
                    // ✅ Ajuste no helper text
                    helperText={passwordError || 'Mínimo de 8 caracteres, com letras e números.'}
                    // ⬅️ NOVO: Adiciona o botão de mostrar/ocultar senha e desativa o autocompletar
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
                        // ⬅️ NOVO: Usamos "new-password" que é mais eficaz para desativar senhas salvas
                        autocomplete: 'new-password',
                    }}
                />

                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} >
                    {submitButtonText}
                </Button>
            </form>
        </Paper>
    );
}

export default UserFormCreate;