// frontend/src/components/ProductForm.js

import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Paper } from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify'; 

function ProductForm({ sectors, onFinish, currentProduct }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    // 💡 NOVO ESTADO: Adicionado para a descrição 💡
    const [description, setDescription] = useState('');
    const [sectorId, setSectorId] = useState('');

    useEffect(() => {
        if (currentProduct) {
            setName(currentProduct.name);
            setPrice(String(currentProduct.price));
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
    }, [currentProduct]); 

    // 2. FUNÇÃO de SUBMISSÃO (POST ou PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEditing = !!currentProduct;
        
        if (!name || !price || !sectorId || quantity === '') {
            toast.error('Preencha os campos obrigatórios (Nome, Preço, Quantidade e Setor).');
            return;
        }
        
        const dataToSend = { 
            name, 
            price: parseFloat(price), 
            quantity: parseInt(quantity, 10),
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
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    fullWidth 
                    margin="normal" 
                />
                <TextField 
                    label="Preço" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                    type="number" 
                    fullWidth 
                    margin="normal" 
                />
                <TextField 
                    label="Quantidade em Estoque" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    required 
                    type="number" 
                    fullWidth 
                    margin="normal" 
                    inputProps={{ min: "0" }}
                />
                <TextField 
                    label="Descrição (Opcional)" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    fullWidth 
                    margin="normal" 
                    multiline 
                    rows={3}
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
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                    {submitButtonText}
                </Button>
            </form>
        </Paper>
    );
}

export default ProductForm;