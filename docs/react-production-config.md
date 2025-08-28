# React Frontend Configuration for Production

## 🚀 Production Environment Variables

Create `.env.production` in your React project:

```env
# Production Environment Variables
VITE_APP_NAME="GSC Slot"
VITE_API_BASE_URL=https://your-domain.com/api
VITE_REVERB_APP_KEY=your_app_key
VITE_REVERB_HOST=your-domain.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
VITE_REVERB_FORCE_TLS=true
```

## 🔧 Updated ChatProvider for Production

```javascript
// src/providers/ChatProvider.jsx
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Production Echo Configuration
const initializeEcho = (token) => {
    window.Pusher = Pusher;
    
    return new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        host: import.meta.env.VITE_REVERB_HOST,
        port: import.meta.env.VITE_REVERB_PORT,
        scheme: import.meta.env.VITE_REVERB_SCHEME,
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

// ... rest of your ChatProvider code
```

## 🏗️ Build Configuration

### Vite Configuration (`vite.config.js`)

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        sourcemap: false, // Disable in production
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    echo: ['laravel-echo', 'pusher-js'],
                },
            },
        },
    },
    server: {
        host: '0.0.0.0',
        port: 3000,
    },
    define: {
        'process.env.NODE_ENV': '"production"',
    },
});
```

### Package.json Scripts

```json
{
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview",
        "build:prod": "vite build --mode production"
    }
}
```

## 🚀 Deployment Steps

### 1. Build for Production

```bash
# In your React project directory
npm run build:prod
```

### 2. Upload to Server

```bash
# Upload the dist folder to your server
scp -r dist/* user@your-server:/var/www/html/react-app/
```

### 3. Nginx Configuration for React App

Create `/etc/nginx/sites-available/react-app`:

```nginx
server {
    listen 80;
    server_name app.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/app.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.your-domain.com/privkey.pem;
    
    root /var/www/html/react-app;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API Proxy to Laravel Backend
    location /api/ {
        proxy_pass https://your-domain.com/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Reverb WebSocket Proxy
    location /reverb {
        proxy_pass https://your-domain.com/reverb;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### 4. Enable Site and Restart Nginx

```bash
sudo ln -s /etc/nginx/sites-available/react-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔍 Testing Production Setup

### 1. Test API Connection

```javascript
// Test in browser console
fetch('https://your-domain.com/api/chat/global-info', {
    headers: {
        'Authorization': 'Bearer your-token',
        'Accept': 'application/json'
    }
}).then(response => response.json()).then(console.log);
```

### 2. Test WebSocket Connection

```javascript
// Test in browser console
const echo = new Echo({
    broadcaster: 'reverb',
    key: 'your_app_key',
    host: 'your-domain.com',
    port: 443,
    scheme: 'https',
    forceTLS: true
});

echo.private('chat.1')
    .listen('ChatMessageSent', (e) => {
        console.log('Message received:', e);
    });
```

### 3. Monitor Logs

```bash
# Check Reverb logs
sudo tail -f /var/www/gsc_slot/F5J3_new_client/storage/logs/reverb.log

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check Laravel logs
sudo tail -f /var/www/gsc_slot/F5J3_new_client/storage/logs/laravel.log
```

## 🛡️ Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **CORS Configuration**: Configure CORS properly in Laravel
3. **Rate Limiting**: Implement rate limiting for chat APIs
4. **Input Validation**: Validate all chat messages
5. **Authentication**: Ensure proper token validation
6. **Firewall**: Configure UFW firewall on Digital Ocean
