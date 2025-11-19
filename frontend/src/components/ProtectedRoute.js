import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, loggedUser, allowedRoles }) => {
    if (!loggedUser) {
        return <Navigate to="/" replace />; 
    }

    if (allowedRoles && !allowedRoles.includes(loggedUser.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;