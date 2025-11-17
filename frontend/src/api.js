import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api', 
});

let onUnauthenticatedError = () => {};

/**
 * @param {Function} handler 
 */
export const setLogoutHandler = (handler) => {
    onUnauthenticatedError = handler;
};

// ✅ FUNÇÃO DE LOGOUT REVISADA
export const logout = () => {
    localStorage.removeItem('loggedUser');
    // Adiciona uma limpeza genérica, caso o token seja guardado separadamente em algum momento.
    localStorage.removeItem('token'); 
};

api.interceptors.request.use((config) => {
    const loggedUserJSON = localStorage.getItem('loggedUser');
    
    let token = null;

    if (loggedUserJSON) {
        try {
            const loggedUser = JSON.parse(loggedUserJSON);
            
            token = loggedUser ? loggedUser.token : null; 
        } catch (e) {
            console.error("Erro ao parsear 'loggedUser' do Local Storage:", e);
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});


api.interceptors.response.use(
    (response) => response,
    (error) => {
        // ✅ Ação 401: Chamando a função de logout do App.js
        if (error.response && error.response.status === 401) {
            console.warn('Sessão expirada (401). Forçando o logout...');
            onUnauthenticatedError(); // Chama performAppLogout()
        }
        
        // Retorna a promessa rejeitada para o bloco catch do componente
        return Promise.reject(error);
    }
);

export default api;