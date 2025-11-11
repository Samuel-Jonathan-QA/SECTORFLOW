// frontend/src/api.js

import axios from 'axios';

const api = axios.create({
    // 🚨 Certifique-se de que a porta do backend está correta (3001) 🚨
    baseURL: 'http://localhost:3001/api', 
});

// ------------------------------------------------------------------
// VARIÁVEL E FUNÇÃO PARA INJETAR O LOGOUT DO COMPONENTE PRINCIPAL
// ------------------------------------------------------------------
// Variável para armazenar a função de logout/navegação (será injetada de App.js)
let onUnauthenticatedError = () => {};

/**
 * Permite que o componente App.js injete a lógica de logout e navegação.
 * @param {Function} handler - Função que limpa o estado e redireciona para o login.
 */
export const setLogoutHandler = (handler) => {
    onUnauthenticatedError = handler;
};

// ------------------------------------------------------------------
// INTERCEPTOR DE REQUISIÇÃO (EXISTENTE)
// ------------------------------------------------------------------
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


// ------------------------------------------------------------------
// 🚨 INTERCEPTOR DE RESPOSTA (NOVO: LÓGICA DE JWT EXPIRED/401) 🚨
// ------------------------------------------------------------------
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Checa se o erro é 401 (Unauthorized), que indica token inválido/expirado
        if (error.response && error.response.status === 401) {
            console.warn('Sessão expirada (401). Redirecionando para login...');
            
            // 🚨 Chama a função de logout e redirecionamento injetada 🚨
            onUnauthenticatedError(); 

            // Retorna um Promise que não resolve/rejeita para parar a propagação do erro
            // nos componentes que fizeram a chamada original.
            return new Promise(() => {}); 
        }

        return Promise.reject(error);
    }
);


// Exporta a função de logout (mantida)
export const logout = () => {
    // Remove o objeto completo do usuário
    localStorage.removeItem('loggedUser');

    // Limpa o header padrão (importante se você não recarregar a página)
    delete api.defaults.headers.common['Authorization'];
};

export default api;