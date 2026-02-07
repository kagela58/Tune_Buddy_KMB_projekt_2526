import { useState, useEffect, useRef } from 'react';
import { Menu, Send, User, X, MapPin, Music, Users, Filter, ChevronDown, ArrowLeft, Trash2, MoreVertical } from 'lucide-react';
import { t } from '../i18n/translations';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from '../i18n/LanguageSelector';
import { useNotifications } from '../hooks/useNotifications';
import NotificationBell from '../components/NotificationBell';
import SideMenu from '../components/SideMenu';
import { getImageUrl } from '../utils/helpers';

// Gender-specific avatar component
// Gender-specific avatar component - realistic person silhouettes
const GenderAvatar = ({ gender, size = 32 }: { gender?: string; size?: number }) => {
  if (gender === 'female') {
    // Woman with long hair silhouette
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-pink-400">
        {/* Head */}
        <circle cx="12" cy="6" r="4" />
        {/* Long hair */}
        <path d="M6 6c0-3 2.5-5 6-5s6 2 6 5c0 2-1 4-1 6 0 1 0.5 2 0.5 3h-11c0-1 0.5-2 0.5-3 0-2-1-4-1-6z" opacity="0.7" />
        {/* Body/dress */}
        <path d="M8 13h8c1 0 2 1 2.5 3l1.5 6H4l1.5-6c0.5-2 1.5-3 2.5-3z" />
        {/* Neck */}
        <rect x="10" y="10" width="4" height="3" rx="1" />
      </svg>
    );
  } else if (gender === 'male') {
    // Man with short hair silhouette
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
        {/* Head */}
        <circle cx="12" cy="6" r="4" />
        {/* Short hair */}
        <path d="M8 4c0-2 1.8-3 4-3s4 1 4 3c0 1-0.5 2-0.5 2h-7s-0.5-1-0.5-2z" opacity="0.8" />
        {/* Body/torso */}
        <path d="M7 13h10c1.5 0 2.5 1.5 3 4l1 5H3l1-5c0.5-2.5 1.5-4 3-4z" />
        {/* Neck */}
        <rect x="10" y="10" width="4" height="3" rx="1" />
      </svg>
    );
  }
  // Default - neutral person icon
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-slate-400">
      <circle cx="12" cy="6" r="4" />
      <path d="M7 13h10c1.5 0 2.5 1.5 3 4l1 5H3l1-5c0.5-2.5 1.5-4 3-4z" />
      <rect x="10" y="10" width="4" height="3" rx="1" />
    </svg>
  );
};

interface ChatProps {
  user: any;
  onBack: () => void;
  initialMatchId?: number | null;
  onNavigateDashboard: () => void;
  onNavigateEvents: () => void;
  onNavigateProfile: () => void;
  onNavigateChat: (matchId: number) => void;
  onNavigateFavorites: () => void;
}

interface Match {
  id: number;
  name: string;
  location: string;
  profileImage: string | null;
  genres: string[];
  artists: string[];
  score: number;
  sharedGenres: string[];
  sharedArtists: string[];
  sameCity?: boolean;
  bio?: string;
  age?: number;
  gender?: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  createdAt: string;
}

export default function Chat({ user, onBack, initialMatchId, onNavigateDashboard, onNavigateEvents, onNavigateProfile, onNavigateChat, onNavigateFavorites }: ChatProps) {
  const { lang } = useLanguage();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState<Match | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);

  // Use shared notifications hook
  const { showNotifications, setShowNotifications, unreadMessages, totalUnread, notificationRef } = useNotifications();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [minScore, setMinScore] = useState<number>(0);

  // Get unique cities from matches
  const cities = [...new Set(matches.map(m => m.location).filter(Boolean))];

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    let filtered = matches;

    // Filter by city
    if (selectedCity !== 'all') {
      filtered = filtered.filter(m => m.location === selectedCity);
    }

    // Filter by gender
    if (selectedGender !== 'all') {
      filtered = filtered.filter(m => m.gender === selectedGender);
    }

    // Filter by age range - only if user changed from default
    if (ageRange[0] !== 18 || ageRange[1] !== 60) {
      filtered = filtered.filter(m => {
        if (!m.age) return true;
        return m.age >= ageRange[0] && m.age <= ageRange[1];
      });
    }

    // Filter by minimum score - only if user set a minimum
    if (minScore > 0) {
      filtered = filtered.filter(m => m.score >= minScore);
    }

    setFilteredMatches(filtered);
  }, [matches, selectedCity, selectedGender, ageRange, minScore]);

  const resetFilters = () => {
    setSelectedCity('all');
    setSelectedGender('all');
    setAgeRange([18, 60]);
    setMinScore(0);
  };

  const activeFiltersCount = [
    selectedCity !== 'all',
    selectedGender !== 'all',
    ageRange[0] !== 18 || ageRange[1] !== 60,
    minScore > 0
  ].filter(Boolean).length;

  useEffect(() => {
    if (selectedMatch) {
      loadMessages();
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedMatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMatches = async (keepSelectedMatchId?: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
        
        // If we need to keep a specific match selected (e.g., after sending a message)
        if (keepSelectedMatchId) {
          const matchToKeep = data.find((m: Match) => m.id === keepSelectedMatchId);
          if (matchToKeep) {
            setSelectedMatch(matchToKeep);
          }
        }
        // If initialMatchId is provided, select that match
        else if (initialMatchId && data.length > 0) {
          const initialMatch = data.find((m: Match) => m.id === initialMatchId);
          if (initialMatch) {
            setSelectedMatch(initialMatch);
          } else if (data.length > 0) {
            setSelectedMatch(data[0]);
          }
        } else if (data.length > 0 && !selectedMatch) {
          setSelectedMatch(data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading matches', err);
    }
  };

  const loadMessages = async () => {
    if (!selectedMatch) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/${selectedMatch.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error loading messages', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch || loading) return;

    setLoading(true);
    const currentMatchId = selectedMatch.id; // Save the current match ID
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/chat/${selectedMatch.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      setNewMessage('');
      loadMessages();
      // Refresh matches to update order (active chats first), keep current match selected
      loadMatches(currentMatchId);
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/message/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
    } catch (err) {
      console.error('Error deleting message', err);
    }
    setDeletingMessageId(null);
  };

  const handleDeleteChat = async () => {
    if (!selectedMatch) return;
    const confirmMsg = lang === 'hr' 
      ? 'Jesi li siguran/na da želiš obrisati cijeli razgovor? Ova radnja je nepovratna.'
      : 'Are you sure you want to delete this entire conversation? This action cannot be undone.';
    
    if (!confirm(confirmMsg)) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/${selectedMatch.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages([]);
        setShowChatMenu(false);
      }
    } catch (err) {
      console.error('Error deleting chat', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Side Menu Overlay */}
      {/* Side Menu */}
      <SideMenu
        showSideMenu={showSideMenu}
        setShowSideMenu={setShowSideMenu}
        currentPage="chat"
        lang={lang}
        onNavigateDashboard={onNavigateDashboard}
        onNavigateEvents={onNavigateEvents}
        onNavigateFavorites={onNavigateFavorites}
        onNavigateChatList={() => setShowSideMenu(false)}
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
          <h1 className="text-lg sm:text-xl font-bold mobile-hide-title">{t('chatTitle', lang)}</h1>
          
          {/* Language Selector, Notifications and Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector />
            
            {/* Notifications Bell */}
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

      <main className="mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4 h-[calc(100vh-70px)] sm:h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-full">
          {/* Matches Sidebar - Hidden on mobile when chat is open */}
          <div className={`card p-4 flex flex-col h-full overflow-hidden ${selectedMatch ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-lagoon" />
                {t('yourMatches', lang)}
              </h2>
              <span className="text-xs bg-lagoon/20 text-lagoon px-2 py-1 rounded-full">
                {filteredMatches.length}
              </span>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full mb-3 py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 text-sm ${
                showFilters ? 'bg-lagoon text-slate-900 font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Filter size={14} />
              {lang === 'hr' ? 'Filteri' : 'Filters'}
              {activeFiltersCount > 0 && (
                <span className="bg-coral text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mb-4 space-y-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                {/* City Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    <MapPin size={12} className="inline mr-1" />
                    {lang === 'hr' ? 'Grad' : 'City'}
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-lagoon focus:outline-none"
                  >
                    <option value="all">{lang === 'hr' ? 'Svi gradovi' : 'All cities'}</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {lang === 'hr' ? 'Spol' : 'Gender'}
                  </label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-lagoon focus:outline-none"
                  >
                    <option value="all">{lang === 'hr' ? 'Svi' : 'All'}</option>
                    <option value="male">{lang === 'hr' ? 'Muško' : 'Male'}</option>
                    <option value="female">{lang === 'hr' ? 'Žensko' : 'Female'}</option>
                  </select>
                </div>

                {/* Age Range Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {lang === 'hr' ? 'Dob' : 'Age'}: {ageRange[0]} - {ageRange[1]}
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={ageRange[0]}
                      onChange={(e) => setAgeRange([Math.min(Number(e.target.value), ageRange[1]), ageRange[1]])}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white focus:border-lagoon focus:outline-none text-center"
                    />
                    <span className="text-slate-500 text-sm">-</span>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={ageRange[1]}
                      onChange={(e) => setAgeRange([ageRange[0], Math.max(Number(e.target.value), ageRange[0])])}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white focus:border-lagoon focus:outline-none text-center"
                    />
                  </div>
                </div>

                {/* Match Score Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {lang === 'hr' ? 'Min. kompatibilnost' : 'Min. compatibility'}: {minScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lagoon"
                  />
                </div>

                {/* Reset Button */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="w-full py-2 text-xs text-coral hover:text-coral/80 transition"
                  >
                    {lang === 'hr' ? 'Resetiraj filtere' : 'Reset filters'}
                  </button>
                )}
              </div>
            )}

            {/* Matches List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredMatches.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">{t('noMatches', lang)}</p>
              ) : (
                filteredMatches.map(match => (
                  <div
                    key={match.id}
                    className={`rounded-xl p-3 transition border-2 ${
                      selectedMatch?.id === match.id
                        ? 'bg-lagoon/10 border-lagoon'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Match Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                          {match.profileImage ? (
                            <img src={getImageUrl(match.profileImage)} alt={match.name} className="w-full h-full object-cover" />
                          ) : (
                            <GenderAvatar gender={match.gender} size={28} />
                          )}
                        </div>
                        {match.sameCity && (
                          <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                            📍
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <h3 className="font-bold text-white truncate">{match.name}</h3>
                            {match.gender && (
                              <span className="text-sm text-white">
                                {match.gender === 'male' ? '♂' : '♀'}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-lagoon">{match.score}%</span>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          {match.age && <span>{match.age} {t('age', lang)}</span>}
                          {match.age && match.location && <span>•</span>}
                          <span className="truncate">{match.location || t('unknownLocation', lang)}</span>
                        </p>
                        {match.sameCity && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-400 mt-1">
                            {t('sameCityBadge', lang)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Match Bio */}
                    {match.bio && (
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{match.bio}</p>
                    )}

                    {/* Shared Genres */}
                    {match.sharedGenres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {match.sharedGenres.slice(0, 3).map(genre => (
                          <span
                            key={genre}
                            className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full"
                          >
                            {genre}
                          </span>
                        ))}
                        {match.sharedGenres.length > 3 && (
                          <span className="text-[10px] text-slate-500">+{match.sharedGenres.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowInfoModal(match)}
                        className="flex-1 text-xs py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                      >
                        {t('info', lang)}
                      </button>
                      <button
                        onClick={() => setSelectedMatch(match)}
                        className="flex-1 text-xs py-2 rounded-lg bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold hover:opacity-90 transition"
                      >
                        {t('chat', lang)}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedMatch ? (
            <div className={`card flex flex-col h-full overflow-hidden ${selectedMatch ? 'flex' : 'hidden md:flex'}`}>
              {/* Chat Header */}
              <div className="border-b border-slate-800 p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Back button - only visible on mobile */}
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="relative">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                      {selectedMatch.profileImage ? (
                        <img src={getImageUrl(selectedMatch.profileImage)} alt={selectedMatch.name} className="w-full h-full object-cover" />
                      ) : (
                        <GenderAvatar gender={selectedMatch.gender} size={24} />
                      )}
                    </div>
                    {selectedMatch.sameCity && (
                      <span className="absolute -bottom-1 -right-1 text-xs">📍</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-white text-sm sm:text-base">{selectedMatch.name}</p>
                      {selectedMatch.gender && (
                        <span className={`text-sm ${selectedMatch.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                          {selectedMatch.gender === 'male' ? '♂' : '♀'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin size={12} />
                      {selectedMatch.location}
                      {selectedMatch.sameCity && (
                        <span className="text-green-400 ml-1">{t('yourCity', lang)}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-lagoon">{selectedMatch.score}%</p>
                    <p className="text-[10px] text-slate-500 uppercase">{t('matchScore', lang)}</p>
                  </div>
                  
                  {/* Chat menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowChatMenu(!showChatMenu)}
                      className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800"
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    {showChatMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowChatMenu(false)} />
                        <div className="absolute right-0 top-full mt-1 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 min-w-[180px]">
                          <button
                            onClick={handleDeleteChat}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            {lang === 'hr' ? 'Obriši razgovor' : 'Delete conversation'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 py-10">
                    <div className="text-4xl mb-2">👋</div>
                    <p>{t('startConversation', lang)}</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div className={`flex items-end gap-1 max-w-[80%] ${msg.senderId === user.id ? 'flex-row-reverse' : ''}`}>
                        <div
                          className={`rounded-2xl px-4 py-2 break-words ${
                            msg.senderId === user.id
                              ? 'bg-gradient-to-r from-lagoon to-coral text-slate-900'
                              : 'bg-slate-800 text-slate-100'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.senderId === user.id ? 'text-slate-700' : 'text-slate-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString(lang === 'hr' ? 'hr-HR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        
                        {/* Delete button - only for own messages */}
                        {msg.senderId === user.id && (
                          <div className="relative">
                            {deletingMessageId === msg.id ? (
                              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition text-xs"
                                  title={lang === 'hr' ? 'Potvrdi' : 'Confirm'}
                                >
                                  <Trash2 size={14} />
                                </button>
                                <button
                                  onClick={() => setDeletingMessageId(null)}
                                  className="p-1.5 text-slate-400 hover:bg-slate-700 rounded transition text-xs"
                                  title={lang === 'hr' ? 'Odustani' : 'Cancel'}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingMessageId(msg.id)}
                                className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title={lang === 'hr' ? 'Obriši poruku' : 'Delete message'}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="border-t border-slate-800 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={t('writeMessage', lang)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="btn bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card hidden md:flex items-center justify-center">
              <p className="text-slate-400">{t('selectMatch', lang)}</p>
            </div>
          )}
        </div>
      </main>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowInfoModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                  {showInfoModal.profileImage ? (
                    <img src={getImageUrl(showInfoModal.profileImage)} alt={showInfoModal.name} className="w-full h-full object-cover" />
                  ) : (
                    <GenderAvatar gender={showInfoModal.gender} size={40} />
                  )}
                </div>
                {showInfoModal.sameCity && (
                  <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-sm rounded-full w-7 h-7 flex items-center justify-center">
                    📍
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">{showInfoModal.name}</h2>
                  {showInfoModal.gender && (
                    <span className={`text-lg ${showInfoModal.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                      {showInfoModal.gender === 'male' ? '♂' : '♀'}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 flex items-center gap-2">
                  {showInfoModal.age && <span>{showInfoModal.age} {t('age', lang)}</span>}
                  {showInfoModal.age && showInfoModal.location && <span>•</span>}
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {showInfoModal.location || t('unknownLocation', lang)}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-lagoon">{showInfoModal.score}%</span>
                  <span className="text-xs text-slate-500">{t('matchScore', lang)}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {showInfoModal.bio && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">{t('bio', lang)}</h3>
                <p className="text-slate-200">{showInfoModal.bio}</p>
              </div>
            )}

            {/* Shared Genres */}
            {showInfoModal.sharedGenres.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                  <Music size={14} />
                  {t('sharedGenres', lang)}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {showInfoModal.sharedGenres.map(genre => (
                    <span
                      key={genre}
                      className="text-sm bg-lagoon/20 text-lagoon px-3 py-1 rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Shared Artists */}
            {showInfoModal.sharedArtists.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">{t('sharedArtists', lang)}</h3>
                <div className="flex flex-wrap gap-2">
                  {showInfoModal.sharedArtists.map(artist => (
                    <span
                      key={artist}
                      className="text-sm bg-coral/20 text-coral px-3 py-1 rounded-full"
                    >
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => {
                setSelectedMatch(showInfoModal);
                setShowInfoModal(null);
              }}
              className="w-full btn bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold justify-center gap-2"
            >
              <Send size={18} />
              {t('chat', lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
