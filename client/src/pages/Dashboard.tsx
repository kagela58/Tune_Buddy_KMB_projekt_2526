import { useState, useEffect } from 'react';
import { User, MapPin, Music, X, Send, MessageCircle, Filter, ChevronDown, Menu } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import LanguageSelector from '../i18n/LanguageSelector';
import { useNotifications } from '../hooks/useNotifications';
import NotificationBell from '../components/NotificationBell';
import SideMenu from '../components/SideMenu';
import { getImageUrl } from '../utils/helpers';

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

interface DashboardProps {
  user: any;
  onLogout: () => void;
  onNavigateProfile: () => void;
  onNavigateEvents: () => void;
  onNavigateChat: (matchId: number) => void;
  onNavigateChatList: () => void;
  onNavigateFavorites: () => void;
}

export default function Dashboard({ user, onLogout, onNavigateProfile, onNavigateEvents, onNavigateChat, onNavigateChatList, onNavigateFavorites }: DashboardProps) {
  const { lang } = useLanguage();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [showInfoModal, setShowInfoModal] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  
  // Use shared notifications hook
  const { showNotifications, setShowNotifications, unreadMessages, totalUnread, notificationRef } = useNotifications();

  // Filter states
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 50]);
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

    // Filter by age range
    filtered = filtered.filter(m => {
      if (!m.age) return true;
      return m.age >= ageRange[0] && m.age <= ageRange[1];
    });

    // Filter by minimum score
    filtered = filtered.filter(m => m.score >= minScore);

    setFilteredMatches(filtered);
  }, [matches, selectedCity, selectedGender, ageRange, minScore]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (err) {
      console.error('Error loading matches', err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedCity('all');
    setSelectedGender('all');
    setAgeRange([18, 50]);
    setMinScore(0);
  };

  const activeFiltersCount = [
    selectedCity !== 'all',
    selectedGender !== 'all',
    ageRange[0] !== 18 || ageRange[1] !== 50,
    minScore > 0
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SideMenu
        showSideMenu={showSideMenu}
        setShowSideMenu={setShowSideMenu}
        currentPage="dashboard"
        lang={lang}
        onNavigateDashboard={() => {}}
        onNavigateEvents={onNavigateEvents}
        onNavigateFavorites={onNavigateFavorites}
        onNavigateChatList={onNavigateChatList}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-lg bg-slate-950/70 border-b border-slate-800">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowSideMenu(true)}
              className="p-2 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-lagoon to-coral text-lg sm:text-xl font-black shadow-lg">TB</span>
            <div>
              <p className="text-base sm:text-lg font-bold">TuneBuddy</p>
              <p className="text-xs text-slate-400 hidden sm:block">{t('hello', lang)}, {user?.firstName}!</p>
            </div>
          </div>
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
        {/* Title & Filter Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
              {lang === 'hr' ? '🎵 Tvoji Matchevi' : '🎵 Your Matches'}
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              {lang === 'hr' 
                ? 'Ljudi koji dijele tvoj glazbeni ukus' 
                : 'People who share your music taste'}
            </p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn gap-2 ${showFilters ? 'bg-lagoon text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Filter size={18} />
            {lang === 'hr' ? 'Filteri' : 'Filters'}
            {activeFiltersCount > 0 && (
              <span className="bg-coral text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card p-6 mb-8 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  <MapPin size={14} className="inline mr-1" />
                  {lang === 'hr' ? 'Grad' : 'City'}
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-lagoon focus:outline-none"
                >
                  <option value="all">{lang === 'hr' ? 'Svi gradovi' : 'All cities'}</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  {lang === 'hr' ? 'Spol' : 'Gender'}
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-lagoon focus:outline-none"
                >
                  <option value="all">{lang === 'hr' ? 'Svi' : 'All'}</option>
                  <option value="male">{lang === 'hr' ? 'Muško' : 'Male'}</option>
                  <option value="female">{lang === 'hr' ? 'Žensko' : 'Female'}</option>
                </select>
              </div>

              {/* Age Range Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  {lang === 'hr' ? 'Dob' : 'Age'}: {ageRange[0]} - {ageRange[1]}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={ageRange[0]}
                    onChange={(e) => setAgeRange([Math.min(Number(e.target.value), ageRange[1]), ageRange[1]])}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-white focus:border-lagoon focus:outline-none text-center"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={ageRange[1]}
                    onChange={(e) => setAgeRange([ageRange[0], Math.max(Number(e.target.value), ageRange[0])])}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-white focus:border-lagoon focus:outline-none text-center"
                  />
                </div>
              </div>

              {/* Match Score Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  {lang === 'hr' ? 'Min. kompatibilnost' : 'Min. compatibility'}: {minScore}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lagoon"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Reset Filters */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="text-sm text-coral hover:text-coral/80 transition"
                >
                  {lang === 'hr' ? '✕ Resetiraj filtere' : '✕ Reset filters'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Matches Count */}
        <div className="mb-6">
          <span className="text-sm text-slate-500">
            {lang === 'hr' ? 'Prikazujem' : 'Showing'} {filteredMatches.length} {lang === 'hr' ? 'matcheva' : 'matches'}
            {activeFiltersCount > 0 && (
              <span className="text-lagoon ml-1">
                ({lang === 'hr' ? 'filtrirano' : 'filtered'})
              </span>
            )}
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lagoon mx-auto mb-4"></div>
            <p className="text-slate-400">{lang === 'hr' ? 'Učitavam...' : 'Loading...'}</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😢</div>
            <p className="text-slate-400 text-lg">{t('noMatches', lang)}</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="mt-4 text-lagoon hover:text-lagoon/80"
              >
                {lang === 'hr' ? 'Probaj resetirati filtere' : 'Try resetting filters'}
              </button>
            )}
          </div>
        ) : (
          /* Matches Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredMatches.map(match => (
              <div
                key={match.id}
                className="card p-4 sm:p-6 hover:border-lagoon/40 transition-all duration-300"
              >
                {/* Match Header */}
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="relative">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-slate-700">
                      {match.profileImage ? (
                        <img src={getImageUrl(match.profileImage)} alt={match.name} className="w-full h-full object-cover" />
                      ) : (
                        <GenderAvatar gender={match.gender} size={32} />
                      )}
                    </div>
                    {match.sameCity && (
                      <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg">
                        📍
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-white truncate">{match.name}</h3>
                        {match.gender && (
                          <span className={`text-sm flex-shrink-0 ${match.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                            {match.gender === 'male' ? '♂' : '♀'}
                          </span>
                        )}
                      </div>
                      <span className="text-base sm:text-lg font-bold text-lagoon flex-shrink-0">{match.score}%</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-1 flex-wrap">
                      {match.age && <span>{match.age} {lang === 'hr' ? 'god' : 'y/o'}</span>}
                      {match.age && match.location && <span>•</span>}
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {match.location || (lang === 'hr' ? 'Nepoznata lokacija' : 'Unknown location')}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {match.bio && (
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">{match.bio}</p>
                )}

                {/* Shared Genres */}
                {match.sharedGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {match.sharedGenres.slice(0, 4).map(genre => (
                      <span
                        key={genre}
                        className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700"
                      >
                        {genre}
                      </span>
                    ))}
                    {match.sharedGenres.length > 4 && (
                      <span className="text-xs text-slate-500">+{match.sharedGenres.length - 4}</span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInfoModal(match)}
                    className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition font-medium"
                  >
                    {t('info', lang)}
                  </button>
                  <button
                    onClick={() => onNavigateChat(match.id)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full p-6 relative bg-slate-900 border border-slate-700 rounded-2xl shadow-xl">
            <button
              onClick={() => setShowInfoModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-lagoon">
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
                  {showInfoModal.age && <span>{showInfoModal.age} {lang === 'hr' ? 'god' : 'y/o'}</span>}
                  {showInfoModal.age && showInfoModal.location && <span>•</span>}
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {showInfoModal.location || (lang === 'hr' ? 'Nepoznata lokacija' : 'Unknown location')}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-lagoon">{showInfoModal.score}%</span>
                  <span className="text-xs text-slate-500">{t('matchScore', lang)}</span>
                </div>
              </div>
            </div>

            {/* Opis */}
            {showInfoModal.bio && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">{lang === 'hr' ? 'Opis' : 'Description'}</h3>
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
                onNavigateChat(showInfoModal.id);
                setShowInfoModal(null);
              }}
              className="w-full btn bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold justify-center gap-2"
            >
              <Send size={18} />
              Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
