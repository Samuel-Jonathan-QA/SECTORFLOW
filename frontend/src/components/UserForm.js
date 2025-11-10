import React, { useState, useEffect } from 'react';
// Imports do Material-UI
import { 
    TextField, 
    Button, 
    MenuItem, 
    Paper, 
    // 🚨 RE-ADICIONADO: Componentes de Select Customizado 🚨
    FormControl, 
    InputLabel, 
    Select, 
    OutlinedInput,
    // 🚨 ADICIONADO: Componentes de Checkbox/Label 🚨
    Checkbox, 
    FormControlLabel,
    Box,
    ListItemText // Útil para o label do MenuItem
} from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify';

// Estilo para o Menu do Multi-Select
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

function UserForm({ sectors, currentUser, onFinish }) { 
    // ... (Estados e roleOptions permanecem os mesmos)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [sectorIds, setSectorIds] = useState([]); // ARRAY de IDs
    const [role, setRole] = useState('');
    
    const roleOptions = [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'VENDEDOR', label: 'Vendedor' },
    ];
    // ... (Efeito para preencher dados de edição permanece o mesmo)
    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
            setPassword(''); 
            setRole(currentUser.role || '');

            const currentSectorIds = currentUser.Sectors 
                ? currentUser.Sectors.map(s => s.id) 
                : [];
            setSectorIds(currentSectorIds);
        } else {
            setName('');
            setEmail('');
            setPassword('');
            setSectorIds([]); 
            setRole('');
        }
    }, [currentUser]); 
    
    // ----------------------------------------------------
    // 3. FUNÇÃO para lidar com a seleção MÚLTIPLA
    // ----------------------------------------------------
    const handleSectorChange = (event) => {
        const { target: { value } } = event;
        // O valor é sempre tratado como um array pelo Select múltiplo
        setSectorIds(value);
    };


    // ----------------------------------------------------
    // 4. FUNÇÃO de SUBMISSÃO (POST ou PUT)
    // ----------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isEditing = !!currentUser;
        const dataToSend = { name, email, role, sectorIds };
        
        if (!name || !email || !role) {
            toast.error('Preencha todos os campos obrigatórios.');
            return; 
        }

        // Validação Front-End: Vendedor precisa de setor (sua lógica robusta)
        if (role.toUpperCase() === 'VENDEDOR' && (!sectorIds || sectorIds.length === 0)) {
            toast.error('Vendedores devem ser associados a pelo menos um setor.');
            return;
        }
        
        if (password) {
            dataToSend.password = password;
        }

        if (!isEditing && !password) {
            toast.error('A senha é obrigatória para criar um novo usuário.');
            return;
        }

        try {
            if (isEditing) {
                delete dataToSend.email; 
                await API.put(`/users/${currentUser.id}`, dataToSend);
                toast.success('Usuário atualizado com sucesso!');
            } else {
                await API.post('/users', dataToSend);
                toast.success('Usuário criado com sucesso!');
            }
            onFinish();
        } catch (error) {
            const defaultMessage = isEditing ? 'Erro ao atualizar usuário.' : 'Erro ao criar usuário.';
            toast.error(error.response?.data?.error || defaultMessage);
        }
    };

    const submitButtonText = currentUser ? 'Salvar Edição' : 'Criar Usuário';
    const passwordRequired = !currentUser;

    return (
        <Paper elevation={3} style={{ padding: '10px' }} data-testid="user-form">
            <form onSubmit={handleSubmit}>
                {/* Campos de Nome e Email (Mantidos) */}
                <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required fullWidth margin="normal" />
                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth margin="normal" />

                {/* Campo de Seleção de Role (Mantido) */}
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

                {/* 🚨 NOVO: CAMPO DE SELEÇÃO MÚLTIPLA CUSTOMIZADO COM CHECKBOXES 🚨 */}
                <FormControl fullWidth margin="normal" required>
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
                                    // Opcional: Usar size="small" para o Checkbox também
                                    size="small" 
                                />
                                <ListItemText primary={sector.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* FIM DO CAMPO CUSTOMIZADO */}

                {/* Campo de Senha (Mantido) */}
                <TextField 
                    label={currentUser ? "Nova Senha (Opcional)" : "Senha"} 
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

export default UserForm;