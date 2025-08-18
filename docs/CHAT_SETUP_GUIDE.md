# Global Chat System - Setup Guide (Updated)

## 🚀 Quick Setup with Laravel Reverb

This guide has been updated to use **Laravel Reverb** (the official Laravel WebSocket server) instead of the abandoned `beyondcode/laravel-websockets` package.

## ✅ What's Already Installed

- ✅ **Laravel Reverb** - Official Laravel WebSocket server
- ✅ **Pusher PHP Server** - For broadcasting
- ✅ **Database migrations** - Chat tables
- ✅ **API endpoints** - Chat functionality
- ✅ **React components** - Frontend chat interface

## 🔧 Configuration Steps

### 1. Environment Variables

Update your `.env` file:

```env
# Broadcasting Configuration
BROADCAST_DRIVER=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http

# For production, use:
# REVERB_SCHEME=https
# REVERB_HOST=your-domain.com
```

### 2. Publish Reverb Configuration

```bash
php artisan reverb:install
```

This will create:
- `config/reverb.php` - Reverb configuration
- `routes/reverb.php` - WebSocket routes

### 3. Update Broadcasting Configuration

Edit `config/broadcasting.php`:

```php
'reverb' => [
    'driver' => 'reverb',
    'app_id' => env('REVERB_APP_ID'),
    'app_key' => env('REVERB_APP_KEY'),
    'app_secret' => env('REVERB_APP_SECRET'),
    'host' => env('REVERB_HOST', '127.0.0.1'),
    'port' => env('REVERB_PORT', 8080),
    'scheme' => env('REVERB_SCHEME', 'http'),
    'options' => [
        'cluster' => env('REVERB_CLUSTER'),
        'encrypted' => true,
    ],
],
```

### 4. Update Frontend Configuration

In your React app, update the Echo configuration:

```javascript
// In ChatProvider.jsx
import Echo from 'laravel-echo';

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.REACT_APP_REVERB_APP_KEY,
    host: process.env.REACT_APP_REVERB_HOST || '127.0.0.1:8080',
    scheme: process.env.REACT_APP_REVERB_SCHEME || 'http',
    auth: {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    },
});
```

### 5. Environment Variables for React

```env
# React .env
REACT_APP_REVERB_APP_KEY=your_app_key
REACT_APP_REVERB_HOST=127.0.0.1:8080
REACT_APP_REVERB_SCHEME=http
```

## 🚀 Starting the WebSocket Server

### Development

```bash
# Start Reverb server
php artisan reverb:start

# Or with specific host/port
php artisan reverb:start --host=127.0.0.1 --port=8080
```

### Production

```bash
# Start as a daemon
php artisan reverb:start --daemon

# Or with supervisor (recommended)
```

## 📋 Supervisor Configuration (Production)

Create `/etc/supervisor/conf.d/reverb.conf`:

```ini
[program:reverb]
process_name=%(program_name)s
command=php /path/to/your/project/artisan reverb:start
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/reverb.log
```

Then run:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start reverb
```

## 🔄 Alternative: Using Pusher (Cloud Service)

If you prefer to use Pusher's cloud service instead of self-hosting:

### 1. Update Environment Variables

```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_app_key
PUSHER_APP_SECRET=your_pusher_app_secret
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1
```

### 2. Frontend Configuration

```javascript
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.REACT_APP_PUSHER_APP_KEY,
    cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
    forceTLS: true,
    auth: {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    },
});
```

## 🧪 Testing the Setup

### 1. Test WebSocket Connection

```bash
# Start Reverb server
php artisan reverb:start

# In another terminal, test the connection
curl http://127.0.0.1:8080/app/your_app_key
```

### 2. Test Broadcasting

```php
// In tinker or a test route
broadcast(new \App\Events\ChatMessageSent($message));
```

### 3. Test Frontend Connection

```javascript
// In browser console
window.Echo.channel('chat.1')
    .listen('.message.sent', (e) => {
        console.log('Message received:', e);
    });
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep 8080
   
   # Kill the process or use different port
   php artisan reverb:start --port=8081
   ```

2. **CORS Issues**
   ```php
   // In config/cors.php
   'allowed_origins' => ['http://localhost:3000', 'https://your-domain.com'],
   'allowed_methods' => ['*'],
   'allowed_headers' => ['*'],
   'supports_credentials' => true,
   ```

3. **Authentication Issues**
   ```bash
   # Clear cache
   php artisan config:clear
   php artisan cache:clear
   ```

## 📊 Monitoring

### Check Reverb Status

```bash
# Check if Reverb is running
ps aux | grep reverb

# Check logs
tail -f /var/log/reverb.log
```

### Health Check

```bash
# Test WebSocket endpoint
curl -I http://127.0.0.1:8080/app/your_app_key
```

## 🎯 Benefits of Laravel Reverb

- ✅ **Official Laravel package** - Better support and updates
- ✅ **No dependency conflicts** - Works with PHP 8.2+
- ✅ **Better performance** - Optimized for Laravel
- ✅ **Easy configuration** - Simple setup process
- ✅ **Production ready** - Can be deployed with supervisor
- ✅ **Free** - No external service costs

## 📚 Next Steps

1. **Test the setup** using the testing steps above
2. **Configure for production** using supervisor
3. **Set up SSL** for secure WebSocket connections
4. **Monitor performance** and adjust as needed

Your chat system is now ready to use with Laravel Reverb! 🎉
