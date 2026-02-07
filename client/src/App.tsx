import { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Events from './pages/Events';
import Favorites from './pages/Favorites';
import { LanguageProvider } from './i18n/LanguageContext';
import type { UserProfile } from './types';

export default function App() {
  const [page, setPage] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'profile' | 'chat' | 'events' | 'favorites'>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setPage('dashboard');
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setPage('landing');
      }
    } catch (err) {
      console.error('Error loading user', err);
    }
  };

  const handleRegister = async (data: any) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        // Uspješna registracija - odmah odvedi na login
        setPage('login');
        // Kratki timeout da se stranica promijeni prije alerta
        setTimeout(() => {
          alert('✅ Profil je uspješno kreiran! Sada se prijavi sa svojim podacima.');
        }, 100);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Greška pri registraciji');
        alert('❌ ' + (errorData.error || 'Greška pri registraciji'));
      }
    } catch (err: any) {
      setError(err.message || 'Greška pri registraciji');
      alert('❌ ' + (err.message || 'Greška pri registraciji'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const { token: newToken, user: userData } = await res.json();
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        setPage('dashboard');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'Greška pri prijavi');
      throw err; // Re-throw so Login.tsx can catch it
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPage('landing');
  };

  const handleNavigate = (newPage: 'landing' | 'login' | 'register' | 'dashboard' | 'profile' | 'chat' | 'events' | 'favorites') => {
    setPage(newPage);
    setError('');
  };

  const handleNavigateChat = (matchId: number) => {
    setSelectedMatchId(matchId);
    setPage('chat');
  };

  return (
    <LanguageProvider>
      {page === 'landing' && <Landing onNavigate={handleNavigate} />}
      {page === 'register' && <Register onNavigate={handleNavigate} onRegister={handleRegister} isLoading={isLoading} />}
      {page === 'login' && (
        <Login 
          onNavigate={handleNavigate} 
          onLogin={handleLogin} 
          isLoading={isLoading}
        />
      )}
      {page === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout}
          onNavigateProfile={() => handleNavigate('profile')}
          onNavigateEvents={() => handleNavigate('events')}
          onNavigateChat={handleNavigateChat}
          onNavigateChatList={() => { setSelectedMatchId(null); handleNavigate('chat'); }}
          onNavigateFavorites={() => handleNavigate('favorites')}
        />
      )}
      {page === 'profile' && user && (
        <Profile 
          user={user} 
          onLogout={handleLogout}
          onBack={() => handleNavigate('dashboard')}
          onNavigateDashboard={() => handleNavigate('dashboard')}
          onNavigateEvents={() => handleNavigate('events')}
          onNavigateChatList={() => { setSelectedMatchId(null); handleNavigate('chat'); }}
          onNavigateFavorites={() => handleNavigate('favorites')}
          onProfileUpdate={loadUser}
        />
      )}
      {page === 'chat' && user && (
        <Chat 
          user={user}
          onBack={() => handleNavigate('dashboard')}
          initialMatchId={selectedMatchId}
          onNavigateDashboard={() => handleNavigate('dashboard')}
          onNavigateEvents={() => handleNavigate('events')}
          onNavigateProfile={() => handleNavigate('profile')}
          onNavigateChat={handleNavigateChat}
          onNavigateFavorites={() => handleNavigate('favorites')}
        />
      )}
      {page === 'events' && user && (
        <Events
          user={user}
          onBack={() => handleNavigate('dashboard')}
          onNavigateDashboard={() => handleNavigate('dashboard')}
          onNavigateChatList={() => { setSelectedMatchId(null); handleNavigate('chat'); }}
          onNavigateProfile={() => handleNavigate('profile')}
          onNavigateChat={handleNavigateChat}
          onNavigateFavorites={() => handleNavigate('favorites')}
        />
      )}
      {page === 'favorites' && user && (
        <Favorites
          user={user}
          onNavigateDashboard={() => handleNavigate('dashboard')}
          onNavigateEvents={() => handleNavigate('events')}
          onNavigateChatList={() => { setSelectedMatchId(null); handleNavigate('chat'); }}
          onNavigateProfile={() => handleNavigate('profile')}
          onNavigateChat={handleNavigateChat}
        />
      )}
    </LanguageProvider>
  );
}
