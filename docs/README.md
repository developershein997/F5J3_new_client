# Global Chat System Documentation

## 📚 Documentation Index

Welcome to the comprehensive documentation for the Global Chat System. This system provides real-time messaging capabilities for your gaming platform with Laravel backend and React frontend.

## 🚀 Quick Start

### Backend (Laravel)
```bash
# Install dependencies
composer require laravel/reverb pusher/pusher-php-server
   php artisan reverb:start
      php artisan reverb:start --host=127.0.0.1 --port=8081
# Run migrations
php artisan migrate

# Run seeders
php artisan db:seed --class=GlobalChatRoomSeeder

# Install Reverb configuration
php artisan reverb:install

# Configure environment variables
BROADCAST_DRIVER=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
```

### Frontend (React)
```bash
# Install dependencies
npm install laravel-echo pusher-js

# Copy components
cp -r react-chat-components/ src/components/

# Configure environment variables
REACT_APP_API_URL=http://your-laravel-api.com/api
REACT_APP_REVERB_APP_KEY=your_reverb_key
REACT_APP_REVERB_HOST=127.0.0.1:8080
REACT_APP_REVERB_SCHEME=http
```

## 📖 Documentation Sections

### 1. [API Documentation](CHAT_API_DOCUMENTATION.md)
Complete API reference for all chat endpoints including:
- Authentication requirements
- Request/response formats
- WebSocket events
- Error handling
- Usage examples
- Security considerations

### 2. [Frontend Integration Guide](CHAT_FRONTEND_GUIDE.md)
Comprehensive guide for integrating React components:
- Component documentation
- Props and methods
- Customization options
- Advanced usage patterns
- Mobile responsiveness
- Testing strategies

### 3. [Database Schema Documentation](CHAT_DATABASE_SCHEMA.md)
Detailed database structure and relationships:
- Table schemas and relationships
- Indexes and performance optimization
- Common queries and maintenance
- Security considerations
- Future enhancement possibilities

### 4. [Deployment Guide](CHAT_DEPLOYMENT_GUIDE.md)
Production deployment instructions:
- Server setup and configuration
- SSL certificate setup
- Nginx configuration
- Monitoring and logging
- Security hardening
- Scaling considerations

## 🎯 Features Overview

### ✅ Implemented Features
- **Real-time messaging** with WebSocket support
- **User authentication** with Laravel Sanctum
- **Online user tracking** and presence indicators
- **Message history** with pagination
- **System notifications** (join/leave messages)
- **Responsive design** for all devices
- **Auto-scroll** to latest messages
- **Connection status** indicators
- **Error handling** and loading states
- **Message types** (text, image, file, system)

### 🔮 Future Enhancements
- Private messaging between users
- File and image sharing
- Message reactions and emojis
- User typing indicators
- Message search functionality
- Message editing and deletion
- User profiles and avatars
- Multiple chat rooms
- Message moderation tools
- Message encryption

## 🛠️ Technical Stack

### Backend
- **Framework**: Laravel 10+
- **Database**: MySQL/PostgreSQL
- **WebSocket**: Laravel Reverb (Official)
- **Authentication**: Laravel Sanctum
- **Caching**: Redis
- **Queue**: Laravel Queue with Redis

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **WebSocket Client**: Laravel Echo + Pusher.js
- **State Management**: React Context API
- **Styling**: CSS3 with responsive design

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chat/global-info` | Get chat room info and online users |
| `POST` | `/api/chat/join` | Join the global chat room |
| `POST` | `/api/chat/leave` | Leave the global chat room |
| `POST` | `/api/chat/send-message` | Send a message |
| `GET` | `/api/chat/messages` | Get message history |
| `GET` | `/api/chat/online-users` | Get online users list |
| `POST` | `/api/chat/update-status` | Update online status |

## 🔄 WebSocket Events

| Event | Channel | Description |
|-------|---------|-------------|
| `.message.sent` | `chat.{room_id}` | New message received |
| `.user.joined` | `chat.{room_id}` | User joined the chat |
| `.user.left` | `chat.{room_id}` | User left the chat |

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `chat_rooms` | Chat room information |
| `chat_messages` | Message storage |
| `chat_participants` | User participation tracking |

## 🚀 Getting Started

### Prerequisites
- Laravel 10+ application
- React 18+ frontend
- MySQL/PostgreSQL database
- Pusher account
- SSL certificate (for production)

### Installation Steps

1. **Backend Setup**
   ```bash
   # Install dependencies
   composer require pusher/pusher-php-server
   
   # Run migrations
   php artisan migrate
   
   # Run seeders
   php artisan db:seed --class=GlobalChatRoomSeeder
   ```

2. **Frontend Setup**
   ```bash
   # Install dependencies
   npm install laravel-echo pusher-js
   
   # Copy components to your project
   cp -r react-chat-components/ src/components/
   ```

3. **Configuration**
   - Set up Pusher credentials
   - Configure CORS settings
   - Update environment variables

4. **Testing**
   - Test API endpoints with Postman
   - Verify WebSocket connections
   - Test frontend integration

## 🔧 Configuration

### Environment Variables

#### Laravel (.env)
```env
BROADCAST_DRIVER=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
```

#### React (.env)
```env
REACT_APP_API_URL=http://your-laravel-api.com/api
REACT_APP_REVERB_APP_KEY=your_reverb_key
REACT_APP_REVERB_HOST=127.0.0.1:8080
REACT_APP_REVERB_SCHEME=http
```

### CORS Configuration
```php
// config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'https://your-domain.com'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
```

## 🧪 Testing

### API Testing
```bash
# Test with Postman or curl
curl -X POST http://your-domain.com/api/chat/join \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### WebSocket Testing
```javascript
// Browser console
window.Echo.channel('chat.1')
  .listen('.message.sent', (e) => {
    console.log('New message:', e);
  });
```

## 🔒 Security

### Authentication
- All endpoints require valid Sanctum tokens
- CORS properly configured
- Input validation and sanitization

### Data Protection
- Messages are validated before storage
- Soft deletes for message integrity
- Foreign key constraints for data integrity

## 📊 Performance

### Optimization Features
- Database indexes for efficient queries
- Pagination for message history
- Caching for frequently accessed data
- Gzip compression for static assets

### Monitoring
- Application logs for debugging
- Database query monitoring
- WebSocket connection tracking
- System resource monitoring

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check Pusher credentials
   - Verify SSL certificate
   - Check CORS configuration

2. **Authentication Errors**
   - Verify token validity
   - Check Sanctum configuration
   - Ensure proper headers

3. **Messages Not Loading**
   - Check database connection
   - Verify user has joined chat
   - Check for errors in logs

### Debug Mode
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

## 📞 Support

### Getting Help
1. Check the troubleshooting section
2. Review application logs
3. Test API endpoints individually
4. Verify all environment variables
5. Check browser console for frontend errors

### Log Locations
- Laravel logs: `storage/logs/laravel.log`
- Nginx logs: `/var/log/nginx/`
- Queue logs: `/var/log/chat-queue.log`

## 📄 License

This chat system is built for your gaming platform. Customize as needed for your specific requirements.

## 🔄 Version History

- **v1.0.0** - Initial release with basic chat functionality
- **v1.1.0** - Added online user tracking
- **v1.2.0** - Enhanced UI and mobile responsiveness
- **v1.3.0** - Added message pagination and system messages

---

**Need help?** Check the individual documentation sections above for detailed information about each aspect of the system.
