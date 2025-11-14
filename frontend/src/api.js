// frontend/src/api.js

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
        if (error.response && error.response.status === 401) {
            console.warn('Sessão expirada (401). Redirecionando para login...');
            
            onUnauthenticatedError(); 

            return new Promise(() => {}); 
        }
        return Promise.reject(error);
    }
);

export const logout = () => {
    localStorage.removeItem('loggedUser');

    delete api.defaults.headers.common['Authorization'];
};

export default api;