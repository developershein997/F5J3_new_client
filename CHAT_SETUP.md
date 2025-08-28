# Global Chat System Setup Guide

## 🚀 Overview

This is a complete real-time chat system built with Laravel (backend) and React (frontend) that allows authenticated players to chat in a global chat room.

## 📋 Prerequisites

- Laravel 10+ with Sanctum authentication
- React 18+ with Vite
- Pusher account for WebSocket functionality
- MySQL/PostgreSQL database

## 🛠️ Backend Setup (Laravel)

### 1. Install Dependencies

```bash
composer require pusher/pusher-php-server
composer require beyondcode/laravel-websockets
```

### 2. Run Migrations

```bash
php artisan migrate
```

### 3. Run Seeders

```bash
php artisan db:seed --class=GlobalChatRoomSeeder
```

### 4. Configure Broadcasting

Update `config/broadcasting.php`:

```php
'default' => env('BROADCAST_DRIVER', 'pusher'),

'connections' => [
    'pusher' => [
        'driver' => 'pusher',
        'key' => env('PUSHER_APP_KEY'),
        'secret' => env('PUSHER_APP_SECRET'),
        'app_id' => env('PUSHER_APP_ID'),
        'options' => [
            'cluster' => env('PUSHER_APP_CLUSTER'),
            'encrypted' => true,
        ],
    ],
],
```

### 5. Environment Variables

Add to your `.env` file:

```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=mt1
```

### 6. Update User Model

Add the `ChatParticipant` relationship to your `User` model:

```php
public function chatParticipants()
{
    return $this->hasMany(ChatParticipant::class);
}
```

## 🎨 Frontend Setup (React)

### 1. Install Dependencies

```bash
npm install laravel-echo pusher-js
```

### 2. Environment Variables

Create `.env` file in your React project:

```env
REACT_APP_API_URL=http://your-laravel-api.com/api
REACT_APP_PUSHER_APP_KEY=your_pusher_key
REACT_APP_PUSHER_APP_CLUSTER=mt1
```

### 3. Copy Components

Copy the React components from the `react-chat-components/` folder to your React project:

- `ChatProvider.jsx`
- `ChatBox.jsx`
- `ChatBox.css`
- `App.jsx` (example usage)

### 4. Update API URL

In your `App.jsx`, update the API URL to match your Laravel backend:

```jsx
<ChatProvider 
  apiBaseUrl="http://your-laravel-api.com/api"
  token={token}
>
  <ChatBox currentUser={currentUser} />
</ChatProvider>
```

## 🔧 Configuration

### 1. CORS Configuration

Update `config/cors.php` in Laravel:

```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://your-react-domain.com'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 2. Sanctum Configuration

Update `config/sanctum.php`:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

## 🚀 Usage

### 1. Start Laravel Server

```bash
php artisan serve
```

### 2. Start React Development Server

```bash
npm run dev
```

### 3. Access the Chat

Navigate to your React app and log in with valid credentials. The chat system will automatically:

- Connect to WebSocket
- Join the global chat room
- Load message history
- Show online users
- Enable real-time messaging

## 📱 Features

### ✅ Implemented Features

- **Real-time messaging** with WebSocket
- **User authentication** with Laravel Sanctum
- **Online user tracking**
- **Message history** with pagination
- **System messages** (join/leave notifications)
- **Responsive design**
- **Auto-scroll** to latest messages
- **Connection status** indicators
- **Error handling**
- **Loading states**

### 🔮 Future Enhancements

- Private messaging
- File/image sharing
- Message reactions
- User typing indicators
- Message search
- Message editing/deletion
- User profiles
- Chat rooms management
- Message moderation

## 🧪 Testing

### API Testing with Postman

1. **Login**: `POST /api/auth/login`
2. **Join Chat**: `POST /api/chat/join`
3. **Send Message**: `POST /api/chat/send-message`
4. **Get Messages**: `GET /api/chat/messages`
5. **Get Online Users**: `GET /api/chat/online-users`
6. **Leave Chat**: `POST /api/chat/leave`

### WebSocket Testing

Use the browser console to test WebSocket connections:

```javascript
// Check if Echo is connected
console.log(window.Echo);

// Listen to chat events
window.Echo.channel('chat.1')
  .listen('.message.sent', (e) => {
    console.log('New message:', e);
  });
```

## 🔒 Security Considerations

1. **Authentication**: All chat endpoints require valid Sanctum tokens
2. **Input Validation**: Messages are validated and sanitized
3. **Rate Limiting**: Consider implementing rate limiting for message sending
4. **XSS Protection**: Messages are properly escaped in the frontend
5. **CSRF Protection**: Laravel's built-in CSRF protection

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check Pusher credentials
   - Verify CORS configuration
   - Ensure SSL is enabled for production

2. **Authentication Errors**
   - Verify Sanctum configuration
   - Check token expiration
   - Ensure proper headers are sent

3. **Messages Not Appearing**
   - Check database connections
   - Verify event broadcasting
   - Check browser console for errors

### Debug Mode

Enable debug mode in Laravel:

```env
APP_DEBUG=true
LOG_LEVEL=debug
```

Check logs: `storage/logs/laravel.log`

## 📞 Support

For issues or questions:

1. Check the Laravel logs
2. Verify all environment variables
3. Test API endpoints individually
4. Check browser console for frontend errors
5. Ensure all dependencies are installed

## 📄 License

This chat system is built for your gaming platform. Customize as needed for your specific requirements.
