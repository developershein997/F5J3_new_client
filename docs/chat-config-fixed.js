// Chat System Configuration - FIXED for Production
export const chatConfig = {
  // WebSocket Configuration (Laravel Reverb)
  pusher: {
    key: import.meta.env?.VITE_REVERB_APP_KEY || '6n2pvucu7ibmzdn9jmpr',
    cluster: 'mt1', // Required by Pusher.js, but not used with Reverb
    host: import.meta.env?.VITE_REVERB_HOST || 'delightmyanmar99.pro',
    port: import.meta.env?.VITE_REVERB_PORT || '443',
    scheme: import.meta.env?.VITE_REVERB_SCHEME || 'https',
    forceTLS: import.meta.env?.VITE_REVERB_FORCE_TLS === 'true' || true,
    encrypted: import.meta.env?.VITE_REVERB_FORCE_TLS === 'true' || true,
    wsHost: import.meta.env?.VITE_REVERB_HOST || 'delightmyanmar99.pro',
    wsPort: import.meta.env?.VITE_REVERB_PORT || '443',
    wssPort: import.meta.env?.VITE_REVERB_PORT || '443',
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    // Add these for better Reverb compatibility
    broadcaster: 'reverb',
    authEndpoint: '/broadcasting/auth',
  },

  // Chat Settings
  chat: {
    // Message settings
    maxMessageLength: 1000,
    maxMessagesPerPage: 50,
    autoScrollDelay: 100,
    
    // Connection settings
    reconnectAttempts: 5,
    reconnectDelay: 3000,
    heartbeatInterval: 30000, // 30 seconds
    
    // UI settings
    showOnlineUsers: true,
    showTimestamps: true,
    showUserAvatars: false,
    enableEmojis: true,
    enableFileUpload: false,
    
    // Animation settings
    messageAnimationDuration: 300,
    typingIndicatorDelay: 1000,
  },

  // API Endpoints
  endpoints: {
    globalInfo: '/api/chat/global-info',
    join: '/api/chat/join',
    leave: '/api/chat/leave',
    sendMessage: '/api/chat/send-message',
    messages: '/api/chat/messages',
    onlineUsers: '/api/chat/online-users',
    updateStatus: '/api/chat/update-status',
  },

  // UI Theme Colors (matching your existing theme)
  theme: {
    primary: '#12486b',
    secondary: '#0d3a5a',
    background: '#181c2f',
    surface: '#23243a',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    accent: '#f59e0b',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },

  // Localization
  messages: {
    joinChat: 'Join Chat',
    leaveChat: 'Leave Chat',
    sendMessage: 'Send Message',
    typing: 'typing...',
    online: 'online',
    offline: 'offline',
    connectionError: 'Connection error. Trying to reconnect...',
    messageSent: 'Message sent',
    messageError: 'Failed to send message',
    joinError: 'Failed to join chat',
    leaveError: 'Failed to leave chat',
    noMessages: 'No messages yet. Start the conversation!',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
};

// Helper functions
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatMessageDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  } else {
    return date.toLocaleDateString();
  }
};

export const truncateMessage = (message, maxLength = 100) => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};

export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message must be a string' };
  }

  if (message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (message.length > chatConfig.chat.maxMessageLength) {
    return { 
      valid: false, 
      error: `Message too long. Maximum ${chatConfig.chat.maxMessageLength} characters allowed.` 
    };
  }

  return { valid: true };
};

export default chatConfig;
