import React, { useState, useEffect } from 'react';
import { ChatProvider } from './ChatProvider';
import { ChatBox } from './ChatBox';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Example login function
  const handleLogin = async (phone, password) => {
    try {
      const response = await fetch('http://your-laravel-api.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.data.token);
        setCurrentUser(data.data.user);
        setIsLoggedIn(true);
        localStorage.setItem('chat_token', data.data.token);
        localStorage.setItem('chat_user', JSON.stringify(data.data.user));
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  // Check for existing token on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('chat_token');
    const savedUser = localStorage.getItem('chat_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_user');
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Global Chat System</h1>
        <div className="user-info">
          <span>Welcome, {currentUser?.user_name}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        <ChatProvider 
          apiBaseUrl="http://your-laravel-api.com/api"
          token={token}
        >
          <ChatBox currentUser={currentUser} />
        </ChatProvider>
      </main>
    </div>
  );
}

// Login Form Component
function LoginForm({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onLogin(phone, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login to Global Chat</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
