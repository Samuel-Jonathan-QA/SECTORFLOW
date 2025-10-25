import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001/api', // compatível com backend
});

// Interceptor de Requisição
API.interceptors.request.use((config) => {
  // 1. Busca o token no Local Storage
  const user = JSON.parse(localStorage.getItem('loggedUser'));

  // 2. Se o token existir, anexa ao cabeçalho Authorization
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;