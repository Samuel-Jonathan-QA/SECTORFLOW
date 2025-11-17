// frontend/src/components/NotFoundRedirect.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NotFoundRedirect({ loggedUser }) {
    const navigate = useNavigate();

    useEffect(() => {
        // Redireciona imediatamente após a montagem do componente
        if (loggedUser) {
            // Usuário logado: vai para a dashboard
            navigate('/dashboard', { replace: true }); 
        } else {
            // Usuário deslogado: vai para o login (rota raiz)
            navigate('/', { replace: true });
        }
    }, [loggedUser, navigate]);

    // Retorna nulo ou um indicador de carregamento, pois o usuário será redirecionado
    return <></>; 
}

export default NotFoundRedirect;