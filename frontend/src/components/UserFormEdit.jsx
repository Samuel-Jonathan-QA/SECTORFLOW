import React, { useState, useEffect } from 'react';
import {
    TextField, Button, MenuItem, Paper, FormControl, InputLabel, Select,
    OutlinedInput, Checkbox, Box, ListItemText, Typography, Avatar, IconButton, Modal
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import API from '../api';
import { toast } from 'react-toastify';
// ✅ IMPORTAR A FUNÇÃO DO APP.JS (Verifique se o caminho '../App' está correto para sua pasta)
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
    // ✅ NOVO ESTADO: Para gerenciar o erro de validação do e-mail
    const [emailError, setEmailError] = useState('');

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
            setEmailError(''); // Limpa o erro ao carregar um novo usuário

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


    // A função clearForm não é usada aqui, mas manterei para não quebrar a estrutura.
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

        // --- VALIDAÇÕES (Mantidas) ---
        const invalidCharRegex = /[^a-zA-Z0-9@\.]/g;
        if (invalidCharRegex.test(email)) {
            setEmailError("Somente letras (a - z), números (0 - 9), arroba (@) e pontos (.) são permitidos");
            toast.error('Corrige o erro no campo de e-mail.');
            return;
        } else {
            setEmailError('');
        }

        if (!name || !email || !role) {
            if (!emailError) toast.error('Preencha todos os campos obrigatórios.');
            return;
        }

        if (!isSelfEdit && role.toUpperCase() === 'VENDEDOR' && (!sectorIds || sectorIds.length === 0)) {
            toast.error('Vendedores devem ser associados a pelo menos um setor.');
            return;
        }
        // -----------------------------

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('role', role);
        formData.append('password', password);

        const safeSectorIds = Array.isArray(sectorIds) ? sectorIds : [];
        safeSectorIds.forEach(id => formData.append('sectorIds[]', id));

        if (profilePictureFile) {
            formData.append('profilePicture', profilePictureFile);
        } else if (currentUser.profilePicture && mustRemoveCurrentPicture) {
            formData.append('profilePictureRemove', 'true');
        }

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (!password) formData.delete('password');

            // 1. Realiza o update no backend
            const response = await API.put(`/users/${currentUser.id}`, formData, config);
            const updatedUserFromBackend = response.data;

            // 2. CORREÇÃO DO BUG 2: Atualizar o estado global se for o PRÓPRIO usuário
            // Pegamos quem está logado no momento
            const storedUser = JSON.parse(localStorage.getItem('loggedUser') || '{}');

            // Se o ID do usuário editado for igual ao ID do usuário logado...
            if (storedUser && String(storedUser.id) === String(updatedUserFromBackend.id)) {
                console.log("Editando a si mesmo via Lista ou Header: Atualizando Global...");

                const newUserData = {
                    ...storedUser, // Mantém token e dados antigos
                    ...updatedUserFromBackend, // Sobrescreve com dados novos (nome, foto, etc)
                    token: storedUser.token // Garante que o token não suma
                };

                // Chama a função do App.js que atualiza o Header e o LocalStorage
                updateLoggedUserGlobally(newUserData);
            }

            // 3. CORREÇÃO DO BUG 1: Disparar evento para atualizar listagens
            // Isso grita para o navegador: "Ei, atualizei um usuário!"
            window.dispatchEvent(new Event('user-data-updated'));

            toast.success('Usuário atualizado com sucesso!');

            // Se foi passado onFinish (fechar modal), chama ele
            if (onFinish) onFinish();

        } catch (error) {
            console.error("Erro ao atualizar:", error);
            toast.error(error.response?.data?.error || 'Erro ao atualizar usuário.');
        }
    };

    const submitButtonText = isSelfEdit ? 'Salvar Alterações' : 'Salvar Edição';
    const passwordRequired = false;
    const isAdmin = role.toUpperCase() === 'ADMIN';

    // Condição para desativar Role e Setores no modo de auto-edição
    const disableRoleAndSectors = isSelfEdit;
    const hasImage = !!previewUrl;

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
                    {/* ... Lógica do Avatar ... (mantida inalterada) */}
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

                <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required fullWidth margin="normal" />
                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    // Permite a inserção, a validação é feita no submit
                    onChange={(e) => {
                        setEmail(e.target.value);
                        // Limpa o erro ao começar a digitar
                        if (emailError) setEmailError('');
                    }}
                    required
                    fullWidth
                    margin="normal"
                    // Controla a exibição do erro
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
                    required={!isAdmin}
                    disabled={disableRoleAndSectors}
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

                {/* ✅ NOVO: Box para agrupar os botões de Ação (Salvar e Cancelar) */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: isSelfEdit ? 3 : 2 }}>

                    {/* Botão Cancelar */}
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={onFinish} // Função que fecha o formulário/modal
                    >
                        Cancelar
                    </Button>

                    {/* Botão de Submissão */}
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