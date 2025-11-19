// frontend/src/components/ProductForm.js

import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Paper, Typography, Box } from '@mui/material'; // ✅ Adicionado Box e Typography
import API from '../api';
import { toast } from 'react-toastify'; 

// Constantes para os limites máximos (em formato numérico)
const MAX_PRICE = 999999999.99;
const MAX_QUANTITY = 999999999; 

// Constantes de Limite de Caracteres
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 150; 
const MIN_DESC_LENGTH = 3;
const MAX_DESC_LENGTH = 500; // O limite máximo para o contador

// NOVO: Regex para validação de conteúdo
// Permite letras (acentuadas), números, espaços, hífens, apóstrofos e vírgulas.
const VALID_NAME_CONTENT_REGEX = /^[a-zA-Z0-9\u00C0-\u00FF\s\-'',]*$/; 
// Regex mais permissiva para descrição (permite pontuação comum)
const VALID_DESC_CONTENT_REGEX = /^[a-zA-Z0-9\u00C0-\u00FF\s\.\,\!\?\-'"\(\)]*$/; 
// Garante que o nome ou descrição tenha pelo menos uma letra
const HAS_LETTERS_REGEX = /[a-zA-Z\u00C0-\u00FF]/;

// Formatação para as mensagens de aviso
const formatNumber = (num) => num.toLocaleString('pt-BR', { maximumFractionDigits: 2 });


function ProductForm({ sectors, onFinish, currentProduct }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');
    const [sectorId, setSectorId] = useState('');

    const [nameError, setNameError] = useState(''); // Alterado para string para guardar a mensagem
    const [descError, setDescError] = useState(''); // Alterado para string para guardar a mensagem

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
        setNameError('');
        setDescError('');
    }, [currentProduct]); 

    // ✅ NOVO: Função centralizada de validação de Nome e Descrição
    const runValidationChecks = (nameValue, descValue) => {
        const trimmedName = nameValue.trim();
        const descriptionLength = descValue.length;

        // 1. Validação de Nome (Tamanho e Conteúdo)
        if (!trimmedName || trimmedName.length < MIN_NAME_LENGTH || trimmedName.length > MAX_NAME_LENGTH) {
            return {
                name: `Nome deve ter entre ${MIN_NAME_LENGTH} e ${MAX_NAME_LENGTH} caracteres.`,
                description: ''
            };
        }

        if (!VALID_NAME_CONTENT_REGEX.test(trimmedName)) {
            return {
                name: 'Nome contém caracteres inválidos. Use apenas letras, números, espaços, hífens (-) ou vírgulas (,).',
                description: ''
            };
        }
        
        if (!HAS_LETTERS_REGEX.test(trimmedName)) {
            return {
                name: 'O Nome deve conter letras descritivas (não use apenas números ou símbolos).',
                description: ''
            };
        }

        // 2. Validação de Descrição (Tamanho e Conteúdo, se preenchida)
        if (descriptionLength > 0) {
             if (descriptionLength < MIN_DESC_LENGTH || descriptionLength > MAX_DESC_LENGTH) {
                 return {
                     name: '',
                     description: `A Descrição deve ter entre ${MIN_DESC_LENGTH} e ${MAX_DESC_LENGTH} caracteres.`
                 };
             }
             
             if (!VALID_DESC_CONTENT_REGEX.test(descValue)) {
                 return {
                     name: '',
                     description: 'Descrição contém caracteres inválidos ou incomuns. Permita-se apenas letras, números e pontuação comum (.,!?-").'
                 };
             }
        }
        
        return { name: '', description: '' }; // Sem erros
    };
    
    // HANDLER: Validação de Nome (Limpa o erro ao digitar)
    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        setNameError(''); // Limpa o erro ao digitar
    };

    // HANDLER: Validação de Descrição (Limpa o erro ao digitar)
    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        // O inputProps={{ maxLength: MAX_DESC_LENGTH }} já limita a entrada
        setDescription(value);
        setDescError(''); // Limpa o erro ao digitar
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
        
        // 1. Checagem de campos obrigatórios (além de Nome e Setor, que são checados em 2)
        if (!price || !sectorId || quantity === '') {
            toast.error('Preencha os campos obrigatórios (Nome, Preço, Quantidade e Setor).');
            return;
        }

        // 2. Validação de Conteúdo e Tamanho (Nome, Descrição)
        const validationErrors = runValidationChecks(name, description);
        
        if (validationErrors.name || validationErrors.description) {
            setNameError(validationErrors.name);
            setDescError(validationErrors.description);

            if (validationErrors.name) toast.error(validationErrors.name);
            if (validationErrors.description) toast.error(validationErrors.description);
            return;
        }
        
        // Prepara dados para API
        const trimmedName = name.trim();
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

    // ⬅️ NOVO: Lógica do Helper Text
    const descriptionHelperText = descError // Se houver erro de validação, mostra o erro
        ? descError
        : `${description.length} / ${MAX_DESC_LENGTH} caracteres`; // Senão, mostra o contador

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
                    error={!!nameError} // Usa !! para converter a string de erro em booleano
                    helperText={nameError} // Mostra a mensagem de erro
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
                    error={!!descError} 
                    // ⬅️ ATUALIZAÇÃO: Usa a variável que contém a mensagem de erro OU o contador
                    helperText={descriptionHelperText} 
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
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={!!nameError || !!descError}>
                    {submitButtonText}
                </Button>
            </form>
        </Paper>
    );
}

export default ProductForm;