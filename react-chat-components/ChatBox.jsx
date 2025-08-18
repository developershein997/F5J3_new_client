import React, { useState, useEffect, useRef } from 'react';
import { useChat } from './ChatProvider';
import './ChatBox.css';

export function ChatBox({ currentUser }) {
  const {
    isConnected,
    isJoined,
    messages,
    onlineUsers,
    roomInfo,
    loading,
    error,
    joinChat,
    leaveChat,
    sendMessage,
    loadMessages,
    loadOnlineUsers,
    getGlobalChatInfo
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await getGlobalChatInfo();
        await joinChat();
        await loadMessages();
        await loadOnlineUsers();
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };

    if (isConnected && !isJoined) {
      initializeChat();
    }
  }, [isConnected]);

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isTyping) return;

    setIsTyping(true);
    
    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if message is from current user
  const isOwnMessage = (message) => {
    return message.user_id === currentUser?.id;
  };

  // Check if message is system message
  const isSystemMessage = (message) => {
    return message.message_type === 'system';
  };

  if (!isConnected) {
    return (
      <div className="chat-box">
        <div className="chat-header">
          <h3>Global Chat</h3>
          <div className="connection-status offline">Disconnected</div>
        </div>
        <div className="chat-body">
          <div className="connection-message">
            Connecting to chat server...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-box">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="header-left">
          <h3>{roomInfo?.name || 'Global Chat'}</h3>
          <div className={`connection-status ${isConnected ? 'online' : 'offline'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <div className="header-right">
          <button
            className="online-users-toggle"
            onClick={() => setShowOnlineUsers(!showOnlineUsers)}
          >
            👥 {onlineUsers.length}
          </button>
          {isJoined && (
            <button className="leave-chat-btn" onClick={leaveChat}>
              Leave
            </button>
          )}
        </div>
      </div>

      {/* Online Users Sidebar */}
      {showOnlineUsers && (
        <div className="online-users-sidebar">
          <h4>Online Users ({onlineUsers.length})</h4>
          <div className="users-list">
            {onlineUsers.map((user) => (
              <div key={user.id} className="user-item">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-status online">Online</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat-body">
        {loading && messages.length === 0 ? (
          <div className="loading-messages">
            <div className="spinner"></div>
            Loading messages...
          </div>
        ) : error ? (
          <div className="error-message">
            Error: {error}
          </div>
        ) : (
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="no-messages">
                No messages yet. Be the first to say something!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${isOwnMessage(message) ? 'own' : ''} ${isSystemMessage(message) ? 'system' : ''}`}
                >
                  {!isSystemMessage(message) && (
                    <div className="message-header">
                      <span className="user-name">{message.user_name}</span>
                      <span className="message-time">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  )}
                  <div className="message-content">
                    {isSystemMessage(message) ? (
                      <div className="system-message">
                        {message.message}
                      </div>
                    ) : (
                      <div className="message-text">
                        {message.message}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      {isJoined && (
        <form className="chat-input" onSubmit={handleSendMessage}>
          <div className="input-container">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isTyping}
              rows={1}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isTyping}
              className="send-button"
            >
              {isTyping ? (
                <div className="spinner small"></div>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Join Chat Prompt */}
      {!isJoined && isConnected && (
        <div className="join-chat-prompt">
          <p>Join the global chat to start messaging!</p>
          <button onClick={joinChat} disabled={loading}>
            {loading ? 'Joining...' : 'Join Chat'}
          </button>
        </div>
      )}
    </div>
  );
}
