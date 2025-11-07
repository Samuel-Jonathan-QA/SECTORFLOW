// frontend/src/api.js (CÓDIGO CORRIGIDO)

import axios from 'axios';

// Renomeado para 'api' (minúsculo) para convenção e para corrigir a referência no logout.
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // compatível com backend
});

// Interceptor de Requisição
api.interceptors.request.use((config) => {
  // 1. Busca o token diretamente da chave 'token' no Local Storage
  const token = localStorage.getItem('token');

  // 2. Se o token existir, anexa ao cabeçalho Authorization
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Exporta a função de logout
export const logout = () => {
  // Remove o token de autenticação do Local Storage (Chave: 'token')
  localStorage.removeItem('token');

  // Remove o objeto do usuário (Chave: 'user')
  localStorage.removeItem('user');

  // 🚨 CORREÇÃO 1: Usa a instância correta 'api' 🚨
  // Limpa o cabeçalho 'Authorization' da instância Axios.
  api.defaults.headers.common['Authorization'] = null;

  console.log("Usuário deslogado. Token removido.");
};

// Exporta a instância Axios
export default api;