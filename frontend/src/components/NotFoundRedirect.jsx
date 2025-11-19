// frontend/src/components/NotFoundRedirect.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NotFoundRedirect({ loggedUser }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (loggedUser) {
            navigate('/dashboard', { replace: true }); 
        } else {
            navigate('/', { replace: true });
        }
    }, [loggedUser, navigate]);

    return <></>; 
}

export default NotFoundRedirect;