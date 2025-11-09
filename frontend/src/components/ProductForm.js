// frontend/src/components/ProductForm.js (Refatorado para CRUD: Criação e Edição)

import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Paper } from '@mui/material';
import API from '../api';
import { toast } from 'react-toastify'; // Importa o toast

// 🚨 NOVO: Recebe currentProduct para Edição e onFinish 🚨
function ProductForm({ sectors, onFinish, currentProduct }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sectorId, setSectorId] = useState('');

  // ----------------------------------------------------
  // 1. EFEITO para preencher os dados de EDIÇÃO
  // ----------------------------------------------------
  useEffect(() => {
    if (currentProduct) {
        setName(currentProduct.name);
        // Garante que o preço seja tratado como string para o input TextField
        setPrice(String(currentProduct.price)); 
        setSectorId(currentProduct.sectorId || '');
    } else {
        // Limpa o estado no modo Criação
        setName(''); 
        setPrice(''); 
        setSectorId('');
    }
  }, [currentProduct]); 

  // ----------------------------------------------------
  // 2. FUNÇÃO de SUBMISSÃO (POST ou PUT)
  // ----------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEditing = !!currentProduct;
    
    // Validação básica
    if (!name || !price || !sectorId) {
        toast.error('Preencha todos os campos obrigatórios.');
        return;
    }
    
    // Prepara os dados:
    const dataToSend = { 
        name, 
        // Converte o preço para float antes de enviar para o backend
        price: parseFloat(price), 
        sectorId 
    }; 
    
    try {
        if (isEditing) {
            // Requisição PUT para Edição
            await API.put(`/products/${currentProduct.id}`, dataToSend);
            toast.success('Produto atualizado com sucesso!');
        } else {
            // Requisição POST para Criação
            await API.post('/products', dataToSend);
            toast.success('Produto criado com sucesso!');
        }
        
        // Chama onFinish (que recarrega a lista e/ou fecha a modal)
        onFinish(); 
        
        // Limpa os campos apenas se for Criação
        if (!isEditing) {
            setName(''); setPrice(''); setSectorId('');
        }

    } catch (error) {
        const defaultMessage = isEditing ? 'Erro ao atualizar produto.' : 'Erro ao criar produto.';
        const errorMessage = error.response?.data?.error || defaultMessage;
        toast.error(errorMessage);
    }
  };

  // ----------------------------------------------------
  // 3. RENDERIZAÇÃO
  // ----------------------------------------------------
  const submitButtonText = currentProduct ? 'Atualizar Produto' : 'Adicionar Produto';

  return (
    <Paper elevation={3} style={{ padding: '20px' }} data-testid="product-form">
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