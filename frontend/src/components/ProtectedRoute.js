// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, loggedUser }) => {
    if (!loggedUser) {
        return <Navigate to="/" replace />; 
    }

    return children;
};

export default ProtectedRoute;