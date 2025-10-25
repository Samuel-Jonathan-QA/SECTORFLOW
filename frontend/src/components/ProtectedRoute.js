// frontend/src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

// Componente que exige que o usuário esteja logado
const ProtectedRoute = ({ children, loggedUser }) => {
    // Se o usuário NÃO estiver logado, redireciona para a página inicial
    if (!loggedUser) {
        // Redireciona o usuário para a rota de login
        return <Navigate to="/" replace />; 
    }

    // Se o usuário estiver logado, renderiza o componente filho (a página)
    return children;
};

export default ProtectedRoute;