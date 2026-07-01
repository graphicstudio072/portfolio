import React, { useState, useEffect } from 'react';
import Portfolio from './components/Portfolio';
import Login from './components/Login';
import Admin from './components/Admin';

function App() {
  const [currentView, setCurrentView] = useState('portfolio'); // 'portfolio', 'login', 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAdminUsername(data.username);
        } else {
          setIsAuthenticated(false);
          setAdminUsername('');
        }
      }
    } catch (error) {
      console.error('Error verifying authentication:', error);
    } finally {
      setAuthChecking(false);
    }
  };

  const handleLoginSuccess = (username) => {
    setIsAuthenticated(true);
    setAdminUsername(username);
    setCurrentView('admin');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsAuthenticated(false);
      setAdminUsername('');
      setCurrentView('portfolio');
    }
  };

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setCurrentView('admin');
    } else {
      setCurrentView('login');
    }
  };

  if (authChecking) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#09080e', color: '#fff', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#9b51e0', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 15px' }}></div>
          <p style={{ fontSize: '0.9rem', color: '#9ca3af', letterSpacing: '0.05em' }}>Loading studio workspace...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {currentView === 'portfolio' && (
        <Portfolio 
          onAdminClick={handleAdminClick} 
          isAuthenticated={isAuthenticated} 
          adminUsername={adminUsername}
        />
      )}
      {currentView === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onBack={() => setCurrentView('portfolio')} 
        />
      )}
      {currentView === 'admin' && (
        <Admin 
          username={adminUsername} 
          onLogout={handleLogout} 
        />
      )}
    </>
  );
}

export default App;
