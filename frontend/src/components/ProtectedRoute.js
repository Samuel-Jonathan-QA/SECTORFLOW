import React from 'react';
import { Navigate } from 'react-router-dom';

// ✅ Novo prop: allowedRoles
const ProtectedRoute = ({ children, loggedUser, allowedRoles }) => {
    // 1. Checagem de Autenticação
    if (!loggedUser) {
        // Se não estiver logado, redireciona para Login
        return <Navigate to="/" replace />; 
    }

    // 2. Checagem de Autorização
    // Se a rota exige roles específicas E a role do usuário NÃO está na lista, redireciona.
    if (allowedRoles && !allowedRoles.includes(loggedUser.role)) {
        // Redireciona para o Dashboard (evita a mensagem de acesso negado)
        return <Navigate to="/dashboard" replace />;
    }

    // Se passou na autenticação e autorização, renderiza o conteúdo
    return children;
};

export default ProtectedRoute;