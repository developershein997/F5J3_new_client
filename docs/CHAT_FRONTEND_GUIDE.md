# Global Chat System - Frontend Integration Guide

## 📋 Overview

This guide provides detailed instructions for integrating the Global Chat System into your React frontend application. The system includes real-time messaging, user presence tracking, and a beautiful, responsive UI.

## 🎯 Features

- ✅ Real-time messaging with WebSocket
- ✅ User authentication integration
- ✅ Online user tracking
- ✅ Message history with pagination
- ✅ System notifications
- ✅ Responsive design
- ✅ Auto-scroll to latest messages
- ✅ Connection status indicators
- ✅ Error handling
- ✅ Loading states

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install laravel-echo pusher-js
```

### 2. Environment Variables

Create or update your `.env` file:

```env
REACT_APP_API_URL=http://your-laravel-api.com/api
REACT_APP_PUSHER_APP_KEY=your_pusher_key
REACT_APP_PUSHER_APP_CLUSTER=mt1
```

### 3. Copy Components

Copy the following files to your React project:

- `ChatProvider.jsx` - Context provider for chat state
- `ChatBox.jsx` - Main chat interface
- `ChatBox.css` - Styling for the chat components

### 4. Basic Integration

```jsx
import React from 'react';
import { ChatProvider } from './components/ChatProvider';
import { ChatBox } from './components/ChatBox';

function App() {
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));

  return (
    <div className="app">
      <ChatProvider 
        apiBaseUrl={process.env.REACT_APP_API_URL}
        token={token}
      >
        <ChatBox currentUser={currentUser} />
      </ChatProvider>
    </div>
  );
}
```

## 📦 Component Documentation

### ChatProvider

The main context provider that manages chat state and WebSocket connections.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apiBaseUrl` | string | Yes | Base URL for your Laravel API |
| `token` | string | Yes | Authentication token |
| `children` | ReactNode | Yes | Child components |

#### Usage

```jsx
import { ChatProvider, useChat } from './ChatProvider';

function ChatApp() {
  const token = localStorage.getItem('auth_token');
  
  return (
    <ChatProvider 
      apiBaseUrl="http://localhost:8000/api"
      token={token}
    >
      <ChatInterface />
    </ChatProvider>
  );
}

function ChatInterface() {
  const { 
    isConnected, 
    isJoined, 
    messages, 
    onlineUsers,
    joinChat, 
    sendMessage 
  } = useChat();
  
  // Your chat interface logic
}
```

#### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | boolean | WebSocket connection status |
| `isJoined` | boolean | Whether user has joined the chat |
| `messages` | array | Array of chat messages |
| `onlineUsers` | array | Array of online users |
| `roomInfo` | object | Chat room information |
| `loading` | boolean | Loading state |
| `error` | string | Error message |

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `joinChat()` | - | Join the global chat room |
| `leaveChat()` | - | Leave the global chat room |
| `sendMessage(message, type, metadata)` | message, type, metadata | Send a message |
| `loadMessages(page, limit, beforeId)` | page, limit, beforeId | Load message history |
| `loadOnlineUsers()` | - | Load online users list |
| `updateOnlineStatus()` | - | Update user's online status |

### ChatBox

The main chat interface component with a complete UI.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentUser` | object | Yes | Current authenticated user object |

#### Usage

```jsx
import { ChatBox } from './ChatBox';

function App() {
  const currentUser = {
    id: 1,
    user_name: "John Doe",
    phone: "1234567890"
  };

  return (
    <ChatBox currentUser={currentUser} />
  );
}
```

## 🎨 Customization

### Styling

The chat components use CSS classes that can be customized:

```css
/* Custom chat box styling */
.chat-box {
  /* Your custom styles */
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Custom message styling */
.message.own .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Custom header styling */
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Theme Customization

Create a custom theme by overriding CSS variables:

```css
:root {
  --chat-primary-color: #667eea;
  --chat-secondary-color: #764ba2;
  --chat-background: #f8fafc;
  --chat-text-color: #374151;
  --chat-border-color: #e1e5e9;
}
```

## 🔧 Advanced Usage

### Custom Message Types

```jsx
// Send different message types
const sendTextMessage = () => {
  sendMessage("Hello everyone!", "text");
};

const sendImageMessage = () => {
  sendMessage("Image URL", "image", {
    url: "https://example.com/image.jpg",
    caption: "Check out this image!"
  });
};

const sendFileMessage = () => {
  sendMessage("File attachment", "file", {
    filename: "document.pdf",
    size: "1.2MB",
    url: "https://example.com/document.pdf"
  });
};
```

### Custom Event Handling

```jsx
import { useChat } from './ChatProvider';

function CustomChatInterface() {
  const { 
    isConnected, 
    messages, 
    onlineUsers,
    joinChat, 
    sendMessage 
  } = useChat();

  // Custom message handling
  const handleSendMessage = async (messageText) => {
    try {
      await sendMessage(messageText);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Custom join handling
  const handleJoinChat = async () => {
    try {
      await joinChat();
      console.log('Joined chat successfully');
    } catch (error) {
      console.error('Failed to join chat:', error);
    }
  };

  return (
    <div>
      {/* Your custom chat interface */}
    </div>
  );
}
```

### Real-time Updates

```jsx
import { useEffect } from 'react';
import { useChat } from './ChatProvider';

function ChatWithNotifications() {
  const { messages, onlineUsers } = useChat();

  // Listen for new messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[0];
      console.log('New message:', latestMessage);
      
      // Show notification
      if (latestMessage.user_id !== currentUser.id) {
        showNotification(`New message from ${latestMessage.user_name}`);
      }
    }
  }, [messages]);

  // Listen for online users changes
  useEffect(() => {
    console.log('Online users updated:', onlineUsers);
  }, [onlineUsers]);

  return (
    <div>
      {/* Your chat interface */}
    </div>
  );
}
```

## 📱 Mobile Responsiveness

The chat components are fully responsive and work on all device sizes:

```css
/* Mobile-specific styles */
@media (max-width: 480px) {
  .chat-box {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }
  
  .online-users-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    border-radius: 0;
  }
}
```

## 🔄 WebSocket Integration

### Manual WebSocket Connection

```jsx
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configure Echo
window.Pusher = Pusher;

const echo = new Echo({
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

// Listen to chat events
echo.channel('chat.1')
  .listen('.message.sent', (e) => {
    console.log('New message:', e);
  })
  .listen('.user.joined', (e) => {
    console.log('User joined:', e);
  })
  .listen('.user.left', (e) => {
    console.log('User left:', e);
  });
```

## 🧪 Testing

### Unit Testing

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatProvider, ChatBox } from './ChatComponents';

test('Chat component renders correctly', () => {
  const mockUser = {
    id: 1,
    user_name: 'Test User',
    phone: '1234567890'
  };

  render(
    <ChatProvider apiBaseUrl="http://test.com/api" token="test-token">
      <ChatBox currentUser={mockUser} />
    </ChatProvider>
  );

  expect(screen.getByText('Global Chat')).toBeInTheDocument();
});

test('Send message functionality', async () => {
  // Your test implementation
});
```

### Integration Testing

```jsx
test('Chat integration with API', async () => {
  // Mock API responses
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { messages: [] }
      })
    })
  );

  // Test chat functionality
});
```

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   ```javascript
   // Check if Echo is properly configured
   console.log('Echo instance:', window.Echo);
   
   // Verify Pusher credentials
   console.log('Pusher key:', process.env.REACT_APP_PUSHER_APP_KEY);
   ```

2. **Authentication Errors**
   ```javascript
   // Verify token is valid
   console.log('Token:', token);
   
   // Check API URL
   console.log('API URL:', process.env.REACT_APP_API_URL);
   ```

3. **Messages Not Loading**
   ```javascript
   // Check if user has joined chat
   console.log('Is joined:', isJoined);
   
   // Check for errors
   console.log('Error:', error);
   ```

### Debug Mode

Enable debug logging:

```javascript
// In your ChatProvider
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Chat state:', state);
  console.log('WebSocket connection:', isConnected);
}
```

## 📚 Examples

### Complete Integration Example

```jsx
import React, { useState, useEffect } from 'react';
import { ChatProvider, ChatBox } from './ChatComponents';

function App() {
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for existing authentication
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.data.token);
        setCurrentUser(data.data.user);
        setIsLoggedIn(true);
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header>
        <h1>Gaming Platform</h1>
        <span>Welcome, {currentUser?.user_name}</span>
      </header>

      <main>
        <ChatProvider 
          apiBaseUrl={process.env.REACT_APP_API_URL}
          token={token}
        >
          <ChatBox currentUser={currentUser} />
        </ChatProvider>
      </main>
    </div>
  );
}

export default App;
```

## 📞 Support

For issues or questions:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Test API endpoints individually
4. Check WebSocket connection status
5. Review the Laravel logs for backend issues

## 📄 License

This chat system is built for your gaming platform. Customize as needed for your specific requirements.
