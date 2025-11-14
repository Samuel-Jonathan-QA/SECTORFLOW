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
    ListItemText 
} from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify';

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
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [sectorIds, setSectorIds] = useState([]); 
    const [role, setRole] = useState('');
    
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

    const clearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRole('');
        setSectorIds([]);
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


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isEditing = !!currentUser;
        const dataToSend = { name, email, role, sectorIds };

        if (role.toUpperCase() === 'ADMIN') {
            dataToSend.sectorIds = [];
        }
        
        if (!name || !email || !role) {
            toast.error('Preencha todos os campos obrigatórios.');
            return; 
        }

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
                clearForm();
            }
            onFinish();
        } catch (error) {
            const defaultMessage = isEditing ? 'Erro ao atualizar usuário.' : 'Erro ao criar usuário.';
            toast.error(error.response?.data?.error || defaultMessage); 
        }
    };

    const submitButtonText = currentUser ? 'Salvar Edição' : 'Criar Usuário';
    const passwordRequired = !currentUser;

    const isAdmin = role.toUpperCase() === 'ADMIN';

    return (
        <Paper elevation={3} style={{ padding: '10px' }} data-testid="user-form">
            <form onSubmit={handleSubmit}>
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