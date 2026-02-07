import { useState, useEffect } from 'react';
import { Menu, ExternalLink, User, Trash2, Heart, ArrowLeft } from 'lucide-react';
import { EventItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import LanguageSelector from '../i18n/LanguageSelector';
import { useNotifications } from '../hooks/useNotifications';
import NotificationBell from '../components/NotificationBell';
import SideMenu from '../components/SideMenu';
import { getImageUrl, formatDate } from '../utils/helpers';

// Helper function to get correct ticket URL based on source
const getTicketUrl = (source: string | null | undefined, originalUrl: string | null | undefined): string => {
  if (!originalUrl) return '';
  
  const domainMap: { [key: string]: string } = {
    'entrio.hr': 'https://entrio.hr',
    'adriaticket.hr': 'https://www.adriaticket.com',
    'adriaticket.com': 'https://www.adriaticket.com',
    'eventim.hr': 'https://www.eventim.hr'
  };
  
  if (source && domainMap[source]) {
    return domainMap[source];
  }
  
  if (originalUrl.includes('adriaticket')) {
    return 'https://www.adriaticket.com';
  } else if (originalUrl.includes('entrio')) {
    return 'https://entrio.hr';
  } else if (originalUrl.includes('eventim')) {
    return 'https://www.eventim.hr';
  }
  
  return originalUrl;
};

interface FavoritesProps {
  user: any;
  onNavigateDashboard: () => void;
  onNavigateEvents: () => void;
  onNavigateChatList: () => void;
  onNavigateProfile: () => void;
  onNavigateChat: (matchId: number) => void;
}

export default function Favorites({ user, onNavigateDashboard, onNavigateEvents, onNavigateChatList, onNavigateProfile, onNavigateChat }: FavoritesProps) {
  const { lang } = useLanguage();
  const [favorites, setFavorites] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSideMenu, setShowSideMenu] = useState(false);
  
  // Use shared notifications hook
  const { showNotifications, setShowNotifications, unreadMessages, totalUnread, notificationRef } = useNotifications();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error('Error fetching favorites', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (eventId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/wishlist/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      console.error('Error removing from favorites', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SideMenu
        showSideMenu={showSideMenu}
        setShowSideMenu={setShowSideMenu}
        currentPage="favorites"
        lang={lang}
        onNavigateDashboard={onNavigateDashboard}
        onNavigateEvents={onNavigateEvents}
        onNavigateFavorites={() => {}}
        onNavigateChatList={onNavigateChatList}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-lg bg-slate-950/70 border-b border-slate-800">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Back Arrow */}
            <button
              onClick={onNavigateDashboard}
              className="p-2 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white"
              title={lang === 'hr' ? 'Natrag' : 'Back'}
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={() => setShowSideMenu(true)}
              className="p-2 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-lagoon to-coral text-lg sm:text-xl font-black shadow-lg">TB</span>
            <p className="text-base sm:text-lg font-bold hidden sm:block">TuneBuddy</p>
          </div>
          <h1 className="text-lg sm:text-xl font-bold mobile-hide-title">❤️ {lang === 'hr' ? 'Omiljeni' : 'Favorites'}</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector />
            
            <NotificationBell
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              unreadMessages={unreadMessages}
              totalUnread={totalUnread}
              notificationRef={notificationRef}
              onNavigateChat={onNavigateChat}
              lang={lang}
              getImageUrl={getImageUrl}
            />
            
            <button
              onClick={onNavigateProfile}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-800 border-2 border-lagoon hover:border-coral transition flex items-center justify-center overflow-hidden"
              title={t('profile', lang)}
            >
              {user?.profileImage ? (
                <img src={getImageUrl(user.profileImage)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-lagoon border-t-transparent"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto mb-4 text-slate-600" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {lang === 'hr' ? 'Nemaš omiljenih događaja' : 'No favorite events'}
            </h2>
            <p className="text-slate-400 mb-6">
              {lang === 'hr' 
                ? 'Označi događaje srcem da ih spremiš ovdje' 
                : 'Mark events with a heart to save them here'}
            </p>
            <button
              onClick={onNavigateEvents}
              className="btn bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold"
            >
              {lang === 'hr' ? 'Pregledaj događaje' : 'Browse events'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(event => (
              <div key={event.id} className="card p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white line-clamp-2">{event.title}</h3>
                  <button
                    onClick={() => removeFromFavorites(event.id)}
                    className="p-2 text-coral hover:text-red-400 transition flex-shrink-0"
                    title={lang === 'hr' ? 'Ukloni iz omiljenih' : 'Remove from favorites'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="text-sm text-slate-400 space-y-1">
                  <p>📅 {formatDate(event.date, lang)}</p>
                  <p>📍 {event.location}</p>
                  {event.artists && <p>🎤 {event.artists}</p>}
                  {event.genre && <p>🎵 {event.genre}</p>}
                </div>
                
                {event.ticketUrl && (
                  <a
                    href={getTicketUrl(event.source, event.ticketUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn w-full justify-center bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold text-sm py-2"
                  >
                    {lang === 'hr' ? 'Kupi kartu' : 'Buy ticket'} <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
