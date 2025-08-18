import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Chat Context
const ChatContext = createContext();

// Initial state
const initialState = {
  isConnected: false,
  isJoined: false,
  messages: [],
  onlineUsers: [],
  currentUser: null,
  roomInfo: null,
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    has_more: false
  }
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_JOINED: 'SET_JOINED',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_ONLINE_USERS: 'SET_ONLINE_USERS',
  SET_ROOM_INFO: 'SET_ROOM_INFO',
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  UPDATE_PAGINATION: 'UPDATE_PAGINATION',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES'
};

// Reducer
function chatReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_CONNECTED:
      return { ...state, isConnected: action.payload };
    
    case ACTIONS.SET_JOINED:
      return { ...state, isJoined: action.payload };
    
    case ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload, loading: false };
    
    case ACTIONS.ADD_MESSAGE:
      return { 
        ...state, 
        messages: [action.payload, ...state.messages]
      };
    
    case ACTIONS.SET_ONLINE_USERS:
      return { ...state, onlineUsers: action.payload };
    
    case ACTIONS.SET_ROOM_INFO:
      return { ...state, roomInfo: action.payload };
    
    case ACTIONS.SET_CURRENT_USER:
      return { ...state, currentUser: action.payload };
    
    case ACTIONS.UPDATE_PAGINATION:
      return { ...state, pagination: action.payload };
    
    case ACTIONS.CLEAR_MESSAGES:
      return { ...state, messages: [] };
    
    default:
      return state;
  }
}

// Chat Provider Component
export function ChatProvider({ children, apiBaseUrl, token }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [echo, setEcho] = useState(null);

  // Initialize Echo (WebSocket connection)
  useEffect(() => {
    if (token && apiBaseUrl) {
      // Configure Pusher
      window.Pusher = Pusher;
      
      const echoInstance = new Echo({
        broadcaster: 'pusher',
        key: process.env.REACT_APP_PUSHER_APP_KEY || 'your-pusher-key',
        cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER || 'mt1',
        forceTLS: true,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      });

      setEcho(echoInstance);
      dispatch({ type: ACTIONS.SET_CONNECTED, payload: true });

      return () => {
        if (echoInstance) {
          echoInstance.disconnect();
        }
      };
    }
  }, [token, apiBaseUrl]);

  // API functions
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Chat functions
  const joinChat = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await apiCall('/chat/join', {
        method: 'POST',
      });

      dispatch({ type: ACTIONS.SET_JOINED, payload: true });
      
      // Listen to chat channel
      if (echo) {
        echo.channel(`chat.${response.data.room_id}`)
          .listen('.message.sent', (e) => {
            dispatch({ type: ACTIONS.ADD_MESSAGE, payload: e });
          })
          .listen('.user.joined', (e) => {
            // Handle user joined
            console.log('User joined:', e);
          })
          .listen('.user.left', (e) => {
            // Handle user left
            console.log('User left:', e);
          });
      }

      return response;
    } catch (error) {
      console.error('Error joining chat:', error);
      throw error;
    }
  };

  const leaveChat = async () => {
    try {
      await apiCall('/chat/leave', {
        method: 'POST',
      });

      dispatch({ type: ACTIONS.SET_JOINED, payload: false });
      
      // Stop listening to chat channel
      if (echo) {
        echo.leaveChannel(`chat.${state.roomInfo?.id}`);
      }
    } catch (error) {
      console.error('Error leaving chat:', error);
      throw error;
    }
  };

  const sendMessage = async (message, messageType = 'text', metadata = null) => {
    try {
      const response = await apiCall('/chat/send-message', {
        method: 'POST',
        body: JSON.stringify({
          message,
          message_type: messageType,
          metadata
        }),
      });

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const loadMessages = async (page = 1, limit = 50, beforeId = null) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (beforeId) {
        params.append('before_id', beforeId.toString());
      }

      const response = await apiCall(`/chat/messages?${params}`);
      
      if (page === 1) {
        dispatch({ type: ACTIONS.SET_MESSAGES, payload: response.data.messages });
      } else {
        dispatch({ 
          type: ACTIONS.SET_MESSAGES, 
          payload: [...state.messages, ...response.data.messages] 
        });
      }

      dispatch({ 
        type: ACTIONS.UPDATE_PAGINATION, 
        payload: response.data.pagination 
      });

      return response;
    } catch (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
  };

  const loadOnlineUsers = async () => {
    try {
      const response = await apiCall('/chat/online-users');
      dispatch({ type: ACTIONS.SET_ONLINE_USERS, payload: response.data.users });
      return response;
    } catch (error) {
      console.error('Error loading online users:', error);
      throw error;
    }
  };

  const updateOnlineStatus = async () => {
    try {
      await apiCall('/chat/update-status', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const getGlobalChatInfo = async () => {
    try {
      const response = await apiCall('/chat/global-info');
      dispatch({ type: ACTIONS.SET_ROOM_INFO, payload: response.data.room });
      dispatch({ type: ACTIONS.SET_ONLINE_USERS, payload: response.data.online_users });
      return response;
    } catch (error) {
      console.error('Error getting chat info:', error);
      throw error;
    }
  };

  // Auto-update online status
  useEffect(() => {
    if (state.isJoined) {
      const interval = setInterval(updateOnlineStatus, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [state.isJoined]);

  const value = {
    ...state,
    joinChat,
    leaveChat,
    sendMessage,
    loadMessages,
    loadOnlineUsers,
    updateOnlineStatus,
    getGlobalChatInfo,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook to use chat context
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
