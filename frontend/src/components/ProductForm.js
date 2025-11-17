import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Paper } from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify'; 

// Constantes para os limites máximos (em formato numérico)
const MAX_PRICE = 999999999.99;
const MAX_QUANTITY = 999999999; 

// Constantes de Limite de Caracteres
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 150; 
const MIN_DESC_LENGTH = 3;
const MAX_DESC_LENGTH = 500; 

// Formatação para as mensagens de aviso
const formatNumber = (num) => num.toLocaleString('pt-BR', { maximumFractionDigits: 2 });


function ProductForm({ sectors, onFinish, currentProduct }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');
    const [sectorId, setSectorId] = useState('');

    const [nameError, setNameError] = useState(false);
    const [descError, setDescError] = useState(false);

    useEffect(() => {
        if (currentProduct) {
            setName(currentProduct.name);
            setPrice(currentProduct.price.toFixed(2).replace('.', ','));
            setQuantity(String(currentProduct.quantity || 0)); 
            setDescription(currentProduct.description || '');
            setSectorId(currentProduct.sectorId || '');
        } else {
            setName(''); 
            setPrice(''); 
            setQuantity('');
            setDescription('');
            setSectorId('');
        }
        setNameError(false);
        setDescError(false);
    }, [currentProduct]); 

    // HANDLER: Validação de Nome
    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        
        const trimmedValue = value.trim();
        
        // Verifica MAX no onChange (para limitar a entrada)
        if (trimmedValue.length > MAX_NAME_LENGTH) {
            setNameError(true);
            toast.warn(`Nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres.`);
        } else if (trimmedValue.length > 0 && trimmedValue.length < MIN_NAME_LENGTH) {
            setNameError(false);
        } else {
            setNameError(false);
        }
    };

    // HANDLER: Validação de Descrição
    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setDescription(value);
        
        // Verifica MAX no onChange (para limitar a entrada)
        if (value.length > MAX_DESC_LENGTH) {
            setDescError(true);
            toast.warn(`Descrição deve ter no máximo ${MAX_DESC_LENGTH} caracteres.`); // Mensagem atualizada
        } else {
            setDescError(false);
        }
    };

    // HANDLER: Validação e Máscara de Preço
    const handlePriceChange = (e) => {
        let rawValue = e.target.value.replace(/\D/g, ''); 
        
        if (rawValue === '') {
            setPrice('');
            return;
        }

        let numValue = parseFloat(rawValue) / 100; 
        
        if (numValue < 0) { numValue = 0; }
        
        if (numValue > MAX_PRICE) {
            numValue = MAX_PRICE;
            toast.warn(`O Preço máximo permitido é R$ ${formatNumber(MAX_PRICE)}. Corrigido.`);
        }
        
        let maskedValue = numValue.toLocaleString('pt-BR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
        
        setPrice(maskedValue);
    };

    // HANDLER: Validação de Quantidade (Apenas números)
    const handleQuantityChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');

        if (value === '') {
            setQuantity('');
            return;
        }

        let numValue = parseInt(value, 10);

        if (numValue < 0) { numValue = 0; }

        if (numValue > MAX_QUANTITY) {
            numValue = MAX_QUANTITY;
            toast.warn(`A Quantidade máxima permitida é ${formatNumber(MAX_QUANTITY)}. Corrigido.`);
        }
        
        setQuantity(String(numValue));
    };

    // FUNÇÃO de SUBMISSÃO (POST ou PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEditing = !!currentProduct;
        
        // Checagem de Validação do Formulário
        const trimmedName = name.trim();
        const descriptionLength = description.length;
        
        if (!trimmedName || !price || !sectorId || quantity === '') {
            toast.error('Preencha os campos obrigatórios (Nome, Preço, Quantidade e Setor).');
            return;
        }

        if (trimmedName.length < MIN_NAME_LENGTH || trimmedName.length > MAX_NAME_LENGTH) {
            setNameError(true);
            toast.error(`Nome deve ter entre ${MIN_NAME_LENGTH} e ${MAX_NAME_LENGTH} caracteres.`);
            return;
        }
        
        if (descriptionLength > 0 && descriptionLength < MIN_DESC_LENGTH) {
            setDescError(true);
            toast.error(`A Descrição deve ter no mínimo ${MIN_DESC_LENGTH} caracteres (se preenchida).`);
            return;
        }

        if (descriptionLength > MAX_DESC_LENGTH) {
             setDescError(true);
             toast.error(`A Descrição deve ter no máximo ${MAX_DESC_LENGTH} caracteres.`);
             return;
        }
        // Fim da Checagem de Validação
        
        // Prepara dados para API
        const priceForApi = parseFloat(price.replace(/\./g, '').replace(',', '.'));
        
        const finalPrice = Math.min(Math.max(priceForApi, 0), MAX_PRICE);
        const finalQuantity = Math.min(Math.max(parseInt(quantity, 10), 0), MAX_QUANTITY);
        
        const dataToSend = { 
            name: trimmedName,
            price: finalPrice, 
            quantity: finalQuantity, 
            sectorId,
            description
        }; 
        
        try {
            if (isEditing) {
                await API.put(`/products/${currentProduct.id}`, dataToSend);
                toast.success('Produto atualizado com sucesso!');
            } else {
                await API.post('/products', dataToSend);
                toast.success('Produto criado com sucesso!');
            }
            
            onFinish(); 
            
            if (!isEditing) {
                setName(''); 
                setPrice(''); 
                setQuantity('');
                setDescription(''); 
                setSectorId('');
            }

        } catch (error) {
            const defaultMessage = isEditing ? 'Erro ao atualizar produto.' : 'Erro ao criar produto.';
            const errorMessage = error.response?.data?.error || defaultMessage;
            toast.error(errorMessage);
        }
    };

    const submitButtonText = currentProduct ? 'Atualizar Produto' : 'Adicionar Produto';

    return (
        <Paper elevation={3} style={{ padding: '10px' }} data-testid="product-form">
            <form onSubmit={handleSubmit}>
                <TextField 
                    label="Nome" 
                    value={name} 
                    onChange={handleNameChange}
                    required 
                    fullWidth 
                    margin="normal" 
                    inputProps={{ maxLength: MAX_NAME_LENGTH }}
                    error={nameError} // Mantém o destaque visual de erro
                    // helperText removido
                />
                <TextField 
                    label="Preço (R$)" 
                    value={price} 
                    onChange={handlePriceChange} 
                    required 
                    type="text" 
                    fullWidth 
                    margin="normal" 
                    placeholder="0,00"
                />
                <TextField 
                    label="Quantidade em Estoque" 
                    value={quantity} 
                    onChange={handleQuantityChange} 
                    required 
                    type="text" 
                    fullWidth 
                    margin="normal" 
                />
                <TextField 
                    label="Descrição (Opcional)" 
                    value={description} 
                    onChange={handleDescriptionChange}
                    fullWidth 
                    margin="normal" 
                    multiline 
                    rows={3}
                    inputProps={{ maxLength: MAX_DESC_LENGTH }}
                    error={descError} // Mantém o destaque visual de erro
                    // helperText removido
                />
                <TextField 
                    select 
                    label="Setor" 
                    value={sectorId} 
                    onChange={(e) => setSectorId(e.target.value)} 
                    required 
                    fullWidth 
                    margin="normal"
                >
                    {sectors.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </TextField>
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={nameError || descError}>
                    {submitButtonText}
                </Button>
            </form>
        </Paper>
    );
}

export default ProductForm;