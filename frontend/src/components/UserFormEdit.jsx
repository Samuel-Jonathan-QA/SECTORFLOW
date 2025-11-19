// frontend/src/components/UserFormEdit.jsx

import React, { useState, useEffect } from 'react';
import {
    TextField, Button, MenuItem, Paper, FormControl, InputLabel, Select,
    OutlinedInput, Checkbox, Box, ListItemText, Typography, Avatar, IconButton, Modal
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
// ✅ NOVO: Importa ícones e componentes para a funcionalidade de senha
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment'; 
// Fim dos novos imports
import API from '../api';
import { toast } from 'react-toastify';
// ✅ IMPORTAR A FUNÇÃO DO APP.JS
import { updateLoggedUserGlobally } from '../App';

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
// ✅ VALIDAÇÕES PADRONIZADAS (Copiadas do UserFormCreate)

// Validação de Nome: Garante letras, espaços, apóstrofos e hífens, com pelo menos 3 letras.
const validateName = (name) => {
    const trimmedName = name.trim();
    
    // 🚩 CORREÇÃO: Usando o limite de 3 caracteres conforme o form de criação.
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

// Validação de Senha (Para Edição): Opcional, mas verifica complexidade se preenchida.
const validatePasswordOnEdit = (password) => {
    if (!password) {
        return ''; // Senha opcional na edição
    }
    if (password.length < 8) {
        return 'A nova senha deve ter pelo menos 8 caracteres.';
    }
    // Adiciona uma regra de complexidade simples (pelo menos 1 letra e 1 número)
    const complexRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).+$/;
    if (!complexRegex.test(password)) {
        return 'A nova senha deve conter letras e números.';
    }
    return '';
};

// ----------------------------------------------------

// ✅ Adicionado props isSelfEdit e onUserUpdate
function UserFormEdit({ sectors, currentUser, onFinish, isSelfEdit = false, onUserUpdate }) {
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
    // ⬅️ NOVO: Estado para controlar a visibilidade da senha
    const [showPassword, setShowPassword] = useState(false); 
    
    // ✅ ESTADOS DE ERRO PADRONIZADOS
    const [nameError, setNameError] = useState(''); 
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState(''); // Novo estado de erro para senha

    const roleOptions = [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'VENDEDOR', label: 'Vendedor' },
    ];

    // Carregamento de dados do usuário atual (Reset/Mount)
    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setEmail(currentUser.email || '');
            setPassword('');
            setRole(currentUser.role || '');
            
            // Limpa todos os erros ao carregar novo usuário
            setEmailError(''); 
            setNameError(''); 
            setPasswordError(''); 

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

    // Lógica de Preview de Imagem
    useEffect(() => {
        let objectUrl;
        let finalPreviewUrl = '';

        if (profilePictureFile) {
            objectUrl = URL.createObjectURL(profilePictureFile);
            finalPreviewUrl = objectUrl;
        }
        else if (currentUser && currentUser.profilePicture && !mustRemoveCurrentPicture) {
            // Se estiver editando um usuário existente e não removeu a foto, mostra a foto atual.
            finalPreviewUrl = currentUser.profilePicture;
        }

        setPreviewUrl(finalPreviewUrl);

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [profilePictureFile, currentUser, mustRemoveCurrentPicture]);


    // Efeito para limpar setores se for ADMIN
    useEffect(() => {
        if (role.toUpperCase() === 'ADMIN') {
            setSectorIds([]);
        }
    }, [role]);

    // ✅ Função para lidar com a mudança do nome e validar em tempo real
    const handleNameChange = (e) => {
        const newName = e.target.value;
        setName(newName);
        
        // Validação imediata para feedback visual
        const error = validateName(newName);
        setNameError(error);
    };

    // ✅ Função para lidar com a mudança do email e validar em tempo real
    const handleEmailChange = (e) => {
        // Converte o valor para minúsculo antes de armazenar
        const newEmail = e.target.value.toLowerCase();
        setEmail(newEmail);
        
        // Validação imediata para feedback visual
        const error = validateEmail(newEmail);
        setEmailError(error);
    };

    // ✅ Função para lidar com a mudança da senha e validar em tempo real
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        
        // Validação imediata para feedback visual (usa a validação de edição)
        const error = validatePasswordOnEdit(newPassword);
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

        // 1. Validação Final de Campos (Usando as funções padronizadas)
        const nameValidationError = validateName(name);
        const emailValidationError = validateEmail(email);
        const passwordValidationError = validatePasswordOnEdit(password); // Usa a validação opcional

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

        // A senha só é enviada se preenchida (validação na chamada PUT)
        if (password) {
            formData.append('password', password); 
        }

        const safeSectorIds = Array.isArray(sectorIds) ? sectorIds : [];
        safeSectorIds.forEach(id => formData.append('sectorIds[]', id));

        if (profilePictureFile) {
            formData.append('profilePicture', profilePictureFile);
        } else if (currentUser.profilePicture && mustRemoveCurrentPicture) {
            formData.append('profilePictureRemove', 'true');
        }

        // 2. Validação de Regra de Negócio
        const disableRoleAndSectors = isSelfEdit;

        if (!disableRoleAndSectors && role.toUpperCase() === 'VENDEDOR' && (!sectorIds || sectorIds.length === 0)) {
            toast.error('Vendedores devem ser associados a pelo menos um setor.');
            return;
        }

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            
            const response = await API.put(`/users/${currentUser.id}`, formData, config); 
            const updatedUserFromBackend = response.data;

            // Lógica de atualização global (Se o usuário editado for o usuário logado)
            const storedUser = JSON.parse(localStorage.getItem('loggedUser') || '{}');
            if (storedUser && String(storedUser.id) === String(updatedUserFromBackend.id)) {
                
                const newUserData = {
                    ...storedUser, 
                    ...updatedUserFromBackend, 
                    token: storedUser.token 
                };
                updateLoggedUserGlobally(newUserData);
            }

            // Disparar evento para atualizar listagens (Bug Fix 1)
            window.dispatchEvent(new Event('user-data-updated'));

            toast.success('Usuário atualizado com sucesso!');

            if (onFinish) onFinish();

        } catch (error) {
            console.error("Erro ao atualizar:", error);
            toast.error(error.response?.data?.error || 'Erro ao atualizar usuário.');
        }
    };

    const submitButtonText = isSelfEdit ? 'Salvar Alterações' : 'Salvar Edição';
    const isAdmin = role.toUpperCase() === 'ADMIN';

    // Condição para desativar Role e Setores no modo de auto-edição
    const disableRoleAndSectors = isSelfEdit;
    const hasImage = !!previewUrl;

    // ⬅️ NOVO: Funções para alternar a visibilidade da senha
    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        // O padding foi ajustado para melhor visualização em Modal
        <Paper elevation={3} style={{ padding: isSelfEdit ? '24px' : '10px' }} data-testid="user-edit-form">
            {isSelfEdit && (
                <Typography variant="h6" gutterBottom align="center" sx={{ mb: 2 }}>
                    Editar Meu Perfil
                </Typography>
            )}
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
                                {hasImage && isSelfEdit ? 'Trocar Foto' : 'Selecionar Foto'}
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
                    // Adicionando limite de 50 caracteres (Boa Prática de UX/QA)
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
                    required={!isAdmin && !disableRoleAndSectors} // Torna required se não for admin e não for auto-edição
                    disabled={disableRoleAndSectors || isAdmin} 
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

                            // Mantém a lógica de fallback para auto-edição
                            if (isSelfEdit && sectors.length === 0 && currentUser?.Sectors) {
                                return currentUser.Sectors.map(s => s.name).join(', ');
                            }
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
                    label={"Nova Senha (Opcional)"}
                    // ⬅️ MUDANÇA: Usa o estado para alternar o tipo
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange} // ✅ Usando a função padronizada
                    required={false}
                    fullWidth
                    margin="normal"
                    error={!!passwordError}
                    // ✅ Ajuste: Mostra a mensagem de ajuda ou o erro de validação
                    helperText={passwordError || 'Deixe em branco para manter a senha atual. Mínimo de 8 caracteres, com letras e números.'}
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
                        // ⬅️ NOVO: Usamos "new-password" para desativar o preenchimento automático
                        autocomplete: 'new-password',
                    }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: isSelfEdit ? 3 : 2 }}>

                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={onFinish} 
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
        </Paper>
    );
}

export default UserFormEdit;