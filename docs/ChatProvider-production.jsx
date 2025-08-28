// Production ChatProvider Configuration
// Replace your existing ChatProvider with this

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Production Echo Configuration
const initializeEcho = (token) => {
    window.Pusher = Pusher;
    
    return new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        host: import.meta.env.VITE_REVERB_HOST, // delightmyanmar99.pro
        port: import.meta.env.VITE_REVERB_PORT, // 443
        scheme: import.meta.env.VITE_REVERB_SCHEME, // https
        forceTLS: import.meta.env.VITE_REVERB_FORCE_TLS === 'true',
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        enableLogging: false, // Disable in production
    });
};

// Rest of your ChatProvider code remains the same...
