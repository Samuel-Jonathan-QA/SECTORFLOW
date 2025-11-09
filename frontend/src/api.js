// frontend/src/api.js

import axios from 'axios';

const api = axios.create({
    // 🚨 Certifique-se de que a porta do backend está correta (3001) 🚨
    baseURL: 'http://localhost:3001/api', 
});

// Interceptor de Requisição para anexar o Token JWT
api.interceptors.request.use((config) => {
    // 1. Busca o valor da chave 'loggedUser' no Local Storage
    const loggedUserJSON = localStorage.getItem('loggedUser');
    
    let token = null;

    if (loggedUserJSON) {
        try {
            // 2. Tenta parsear o JSON para obter o objeto
            const loggedUser = JSON.parse(loggedUserJSON);
            
            // 3. Extrai o token do objeto
            token = loggedUser ? loggedUser.token : null; 
        } catch (e) {
            console.error("Erro ao parsear 'loggedUser' do Local Storage:", e);
            // Se o JSON estiver corrompido, o token permanece null
        }
    }

    // 4. Se o token existir, anexa ao cabeçalho Authorization
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Exporta a função de logout
export const logout = () => {
    // Remove o objeto completo do usuário
    localStorage.removeItem('loggedUser');

    // Limpa o header padrão (importante se você não recarregar a página)
    delete api.defaults.headers.common['Authorization'];
};

export default api;