# Global Chat System API Documentation

## 📋 Overview

The Global Chat System provides real-time messaging capabilities for authenticated users in your gaming platform. This system includes WebSocket support for instant message delivery, user presence tracking, and message history management.

## 🔐 Authentication

All chat endpoints require authentication using Laravel Sanctum. Include the bearer token in the Authorization header:

```
Authorization: Bearer {your_token}
```

## 📡 API Endpoints

### 1. Get Global Chat Info

**Endpoint:** `GET /api/chat/global-info`

**Description:** Retrieves information about the global chat room and current online users.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Global chat info retrieved successfully",
  "data": {
    "room": {
      "id": 1,
      "name": "Global Chat",
      "description": "Global chat room for all players",
      "is_global": true
    },
    "online_users": [
      {
        "id": 1,
        "name": "John Doe",
        "phone": "1234567890",
        "last_seen": "2024-12-21T10:30:00.000000Z"
      }
    ],
    "online_count": 1
  }
}
```

### 2. Join Global Chat

**Endpoint:** `POST /api/chat/join`

**Description:** Allows a user to join the global chat room and start receiving messages.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined global chat",
  "data": {
    "room_id": 1,
    "joined_at": "2024-12-21T10:30:00.000000Z"
  }
}
```

### 3. Leave Global Chat

**Endpoint:** `POST /api/chat/leave`

**Description:** Allows a user to leave the global chat room.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully left global chat"
}
```

### 4. Send Message

**Endpoint:** `POST /api/chat/send-message`

**Description:** Sends a message to the global chat room.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Hello everyone!",
  "message_type": "text",
  "metadata": {
    "custom_field": "value"
  }
}
```

**Parameters:**
- `message` (required): The message text (max 1000 characters)
- `message_type` (optional): Type of message ("text", "image", "file") - defaults to "text"
- `metadata` (optional): Additional data for the message

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message_id": 123,
    "sent_at": "2024-12-21T10:30:00.000000Z"
  }
}
```

### 5. Get Messages

**Endpoint:** `GET /api/chat/messages`

**Description:** Retrieves message history with pagination support.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50, max: 100)
- `before_id` (optional): Get messages before this ID

**Example Request:**
```
GET /api/chat/messages?page=1&limit=20&before_id=100
```

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "id": 123,
        "user_id": 1,
        "user_name": "John Doe",
        "user_phone": "1234567890",
        "message": "Hello everyone!",
        "message_type": "text",
        "metadata": null,
        "is_edited": false,
        "is_deleted": false,
        "created_at": "2024-12-21T10:30:00.000000Z",
        "updated_at": "2024-12-21T10:30:00.000000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 20,
      "total": 100,
      "has_more": true
    }
  }
}
```

### 6. Get Online Users

**Endpoint:** `GET /api/chat/online-users`

**Description:** Retrieves a list of currently online users.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Online users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "phone": "1234567890",
        "last_seen": "2024-12-21T10:30:00.000000Z"
      }
    ],
    "count": 1
  }
}
```

### 7. Update Online Status

**Endpoint:** `POST /api/chat/update-status`

**Description:** Updates the user's online status and last seen timestamp.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Online status updated"
}
```

## 🔄 WebSocket Events

The chat system uses WebSocket events for real-time communication. Connect to the following channels:

### Channel: `chat.{room_id}`

**Events:**

1. **Message Sent** (`.message.sent`)
```json
{
  "id": 123,
  "user_id": 1,
  "user_name": "John Doe",
  "user_phone": "1234567890",
  "message": "Hello everyone!",
  "message_type": "text",
  "metadata": null,
  "is_edited": false,
  "is_deleted": false,
  "created_at": "2024-12-21T10:30:00.000000Z",
  "updated_at": "2024-12-21T10:30:00.000000Z"
}
```

2. **User Joined** (`.user.joined`)
```json
{
  "user_id": 1,
  "user_name": "John Doe",
  "user_phone": "1234567890",
  "action": "joined",
  "timestamp": "2024-12-21T10:30:00.000000Z"
}
```

3. **User Left** (`.user.left`)
```json
{
  "user_id": 1,
  "user_name": "John Doe",
  "user_phone": "1234567890",
  "action": "left",
  "timestamp": "2024-12-21T10:30:00.000000Z"
}
```

## 🚨 Error Responses

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Unauthenticated",
  "error": "Unauthenticated"
}
```

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation Error",
  "error": "The message field is required."
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Chat Error",
  "error": "Global chat room not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server Error",
  "error": "Failed to send message"
}
```

## 📝 Usage Examples

### JavaScript/React Example

```javascript
// Join chat
const joinChat = async () => {
  const response = await fetch('/api/chat/join', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return data;
};

// Send message
const sendMessage = async (message) => {
  const response = await fetch('/api/chat/send-message', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  return data;
};

// Get messages
const getMessages = async (page = 1, limit = 50) => {
  const response = await fetch(`/api/chat/messages?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};
```

### cURL Examples

```bash
# Join chat
curl -X POST http://your-domain.com/api/chat/join \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Send message
curl -X POST http://your-domain.com/api/chat/send-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello everyone!"}'

# Get messages
curl -X GET http://your-domain.com/api/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔒 Security Considerations

1. **Authentication**: All endpoints require valid Sanctum tokens
2. **Rate Limiting**: Consider implementing rate limiting for message sending
3. **Input Validation**: Messages are validated and sanitized
4. **XSS Protection**: Messages are properly escaped in the frontend
5. **CSRF Protection**: Laravel's built-in CSRF protection

## 📊 Rate Limits

- **Message Sending**: Consider implementing rate limiting (e.g., 10 messages per minute)
- **API Calls**: Standard Laravel rate limiting applies
- **WebSocket Connections**: No specific limits, but monitor for abuse

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify token is valid and not expired
   - Check Authorization header format
   - Ensure user is authenticated

2. **WebSocket Connection Issues**
   - Verify Pusher credentials
   - Check CORS configuration
   - Ensure SSL is enabled for production

3. **Message Not Sending**
   - Check if user has joined the chat
   - Verify message length (max 1000 characters)
   - Check server logs for errors

### Debug Mode

Enable debug mode in Laravel:
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

Check logs: `storage/logs/laravel.log`
