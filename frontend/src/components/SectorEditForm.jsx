import React, { useState, useEffect } from 'react';
import { 
    TextField, Button, Paper, Typography, Box, Checkbox, 
    FormControlLabel, FormGroup, CircularProgress, 
    Alert, AlertTitle, IconButton
} from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify'; 
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';

function SectorEditForm({ onFinish, currentSector, existingSectors = [], allVendors = [] }) {
    const [name, setName] = useState(currentSector.name);
    const [error, setError] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    
    const [linkedVendorIds, setLinkedVendorIds] = useState([]);

    const [isInfoVisible, setIsInfoVisible] = useState(false);

    const pulseKeyframes = `
        @keyframes pulseEffect {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;

    useEffect(() => {
        setName(currentSector.name);
        
        if (currentSector.Vendors) {
             const currentLinkedIds = currentSector.Vendors.map(v => v.id);
             setLinkedVendorIds(currentLinkedIds);
        } else {
             setLinkedVendorIds([]);
        }

        setError(''); 
        setIsInfoVisible(false); // Resetar ao carregar novo setor
    }, [currentSector]); 
    
    const validateInput = (inputName) => {
        const cleanName = inputName.trim();
        if (cleanName.length < 3 || cleanName.length > 50) return 'O nome deve ter entre 3 e 50 caracteres.';
        const validCharsRegex = /^[a-zA-Z0-9\u00C0-\u00FF\s\-'',]*$/; 
        if (!validCharsRegex.test(cleanName)) return 'O nome contém caracteres inválidos.';
        const hasLetters = /[a-zA-Z\u00C0-\u00FF]/.test(cleanName);
        if (!hasLetters) return 'O nome deve conter letras descritivas.';

        const isDuplicate = existingSectors.some(sector => {
            if (sector.id === currentSector.id) return false;
            return sector.name.trim().toLowerCase() === cleanName.toLowerCase();
        });

        if (isDuplicate) {
            return 'Já existe outro setor com este nome.';
        }

        return null;
    };

    const handleVendorToggle = (vendorId) => {
        setLinkedVendorIds(prevIds => {
            if (prevIds.includes(vendorId)) {
                return prevIds.filter(id => id !== vendorId);
            } else {
                return [...prevIds, vendorId];
            }
        });
    };

    // Função para mostrar/esconder o Alert local
    const handleInfoToggle = () => {
        setIsInfoVisible(prev => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateInput(name);
        if (validationError) {
            setError(validationError);
            toast.warning(validationError); 
            return;
        }
        
        setIsLoading(true);
        setError('');

        const dataToSend = { 
            name: name.trim(),
            vendorIds: linkedVendorIds
        };

        try {
            await API.put(`/sectors/${currentSector.id}`, dataToSend);
            toast.success('Setor e vínculos atualizados com sucesso!');
            onFinish(); 
        } catch (error) {
            const defaultMessage = 'Erro ao atualizar setor e seus vínculos.';
            const errorMessage = error.response?.data?.error || defaultMessage;
            
            if (errorMessage.toLowerCase().includes('já existe')) {
                 setError('Este nome já está em uso.');
            }
            
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setName(e.target.value);
        if (error) setError('');
    };

    return (
        <Paper style={{ padding: '10px 0 0 0' }} data-testid="sector-edit-form">
            <style>{pulseKeyframes}</style> {/* Injeta o CSS da animação */}
            <form onSubmit={handleSubmit}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Edite o nome e gerencie os usuários VENDEDOR associados a este setor.
                </Typography>
                
                <TextField 
                    label="Nome do Setor" 
                    value={name} 
                    onChange={handleChange} 
                    required 
                    fullWidth 
                    margin="normal" 
                    error={!!error} 
                    helperText={error} 
                    inputProps={{ maxLength: 50 }}
                    sx={{ mb: 3 }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            mr: 1,
                        }}
                    >
                         <GroupIcon color="primary" fontSize="small"/> Vendedores Associados
                    </Typography>
                    
                    <IconButton 
                        onClick={handleInfoToggle} 
                        color="warning" 
                        size="small" 
                        title="Aviso de desenvolvimento (QA Karine)"
                        sx={{
                            animation: 'pulseEffect 1.5s infinite', 
                            transition: 'transform 0.3s ease-in-out',
                        }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Box>
                
                {isInfoVisible && (
                    <Alert 
                        severity="info" 
                        onClose={() => setIsInfoVisible(false)} 
                        sx={{ mb: 2 }}
                    >
                        <AlertTitle>Aviso para a QA - Karine Silva</AlertTitle>
                        O vínculo de usuários ao setor está em <strong>desenvolvimento</strong>. Esta interface é provisória.
                    </Alert>
                )}
                
                <Box sx={{ maxHeight: 200, overflowY: 'auto', p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                    <FormGroup>
                        {allVendors.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Nenhum usuário VENDEDOR encontrado.
                            </Typography>
                        ) : (
                            allVendors.map((vendor) => (
                                <FormControlLabel
                                    key={vendor.id}
                                    control={
                                        <Checkbox
                                            checked={linkedVendorIds.includes(vendor.id)}
                                            onChange={() => handleVendorToggle(vendor.id)}
                                            name={vendor.name}
                                        />
                                    }
                                    label={`${vendor.name} (${vendor.email})`}
                                />
                            ))
                        )}
                    </FormGroup>
                </Box>

                <Box display="flex" justifyContent="space-between" gap={2} sx={{ mt: 3, p: 1 }}>
                    <Button 
                        variant="outlined"
                        onClick={onFinish}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Salvar Alterações'}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
}

export default SectorEditForm;