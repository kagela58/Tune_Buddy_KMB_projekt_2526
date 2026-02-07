import { useState, useEffect } from 'react';
import { Menu, Search, MapPin, Heart, ExternalLink, Filter, ChevronDown, User, ArrowLeft } from 'lucide-react';
import { EventItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import LanguageSelector from '../i18n/LanguageSelector';
import { useNotifications } from '../hooks/useNotifications';
import NotificationBell from '../components/NotificationBell';
import SideMenu from '../components/SideMenu';
import { getImageUrl, croatianCities, genreOptions } from '../utils/helpers';

const ticketSources = [
  { id: 'entrio', name: 'Entrio.hr', domain: 'entrio.hr' },
  { id: 'adriaticket', name: 'Adriaticket', domain: 'adriaticket.com' },
  { id: 'eventim', name: 'Eventim', domain: 'eventim.hr' }
];

// Helper function to get correct ticket URL based on source
const getTicketUrl = (source: string | null | undefined, originalUrl: string | null | undefined): string => {
  if (!originalUrl) return '';
  
  // Map source domains to correct URLs
  const domainMap: { [key: string]: string } = {
    'entrio.hr': 'https://entrio.hr',
    'adriaticket.hr': 'https://www.adriaticket.com',
    'adriaticket.com': 'https://www.adriaticket.com',
    'eventim.hr': 'https://www.eventim.hr'
  };
  
  if (source && domainMap[source]) {
    return domainMap[source];
  }
  
  // Try to detect from URL
  if (originalUrl.includes('adriaticket')) {
    return 'https://www.adriaticket.com';
  } else if (originalUrl.includes('entrio')) {
    return 'https://entrio.hr';
  } else if (originalUrl.includes('eventim')) {
    return 'https://www.eventim.hr';
  }
  
  return originalUrl;
};

interface EventsProps {
  user: any;
  onBack: () => void;
  onNavigateDashboard: () => void;
  onNavigateChatList: () => void;
  onNavigateProfile: () => void;
  onNavigateChat: (matchId: number) => void;
  onNavigateFavorites: () => void;
}

export default function Events({ user, onBack, onNavigateDashboard, onNavigateChatList, onNavigateProfile, onNavigateChat, onNavigateFavorites }: EventsProps) {
  const { lang } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<EventItem[]>([]);
  const [cityQuery, setCityQuery] = useState(user?.location || 'Zagreb');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  
  // Date filters
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // Genre filter
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  
  // Use shared notifications hook
  const { showNotifications, setShowNotifications, unreadMessages, totalUnread, notificationRef } = useNotifications();

  // Fetch wishlist on mount to persist heart state
  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchRecommendedEvents();
  }, [cityQuery, selectedSources, selectedDay, selectedMonth, selectedYear, selectedGenre]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const wishlistIds = new Set<number>(data.map((e: any) => e.id));
        setWishlist(wishlistIds);
      }
    } catch (err) {
      console.error('Error fetching wishlist', err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `/api/events?location=${encodeURIComponent(cityQuery)}`;
      
      if (selectedSources.length > 0) {
        url += `&sources=${selectedSources.join(',')}`;
      }
      
      // Add date filters
      if (selectedDay !== null) {
        url += `&day=${selectedDay}`;
      }
      if (selectedMonth !== null) {
        url += `&month=${selectedMonth}`;
      }
      if (selectedYear !== null) {
        url += `&year=${selectedYear}`;
      }
      
      // Add genre filter
      if (selectedGenre) {
        url += `&genre=${encodeURIComponent(selectedGenre)}`;
      }
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  const fetchRecommendedEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events/recommended', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendedEvents(data.slice(0, 6));
      }
    } catch (err) {
      console.error('Error fetching recommended events', err);
    }
  };

  const handleWishlist = async (eventId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (wishlist.has(eventId)) {
        await fetch(`/api/wishlist/${eventId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        wishlist.delete(eventId);
      } else {
        await fetch(`/api/wishlist/${eventId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'interested' })
        });
        wishlist.add(eventId);
      }
      setWishlist(new Set(wishlist));
    } catch (err) {
      console.error('Error updating wishlist', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SideMenu
        showSideMenu={showSideMenu}
        setShowSideMenu={setShowSideMenu}
        currentPage="events"
        lang={lang}
        onNavigateDashboard={onNavigateDashboard}
        onNavigateEvents={() => {}}
        onNavigateFavorites={onNavigateFavorites}
        onNavigateChatList={onNavigateChatList}
      />

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
          <h1 className="text-lg sm:text-xl font-bold mobile-hide-title">🎪 {lang === 'hr' ? 'Događaji' : 'Events'}</h1>
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

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-10">
        {/* Recommended Events Section */}
        {recommendedEvents.length > 0 && (
          <section className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">✨ {t('recommendedForYou', lang)}</h2>
              <button
                onClick={() => setShowRecommended(!showRecommended)}
                className="text-sm text-lagoon hover:text-lagoon/80"
              >
                {showRecommended ? t('hide', lang) : t('showAll', lang)}
              </button>
            </div>
            {showRecommended && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {recommendedEvents.map(event => (
                  <div key={event.id} className="rounded-xl border-2 border-slate-800 bg-slate-900 p-3 sm:p-4 hover:border-lagoon/40 transition">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <h3 className="font-bold text-base sm:text-lg text-slate-100 flex-1">{event.title}</h3>
                      <button
                        onClick={() => handleWishlist(event.id)}
                        className={`flex-shrink-0 ${wishlist.has(event.id) ? 'text-red-400' : 'text-slate-600 hover:text-red-400'}`}
                      >
                        <Heart size={20} fill={wishlist.has(event.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">🎵 {event.genre}</p>
                    <p className="text-sm text-slate-300 mb-2">{event.artists}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                      <MapPin size={14} />
                      {event.location}
                    </div>
                    {event.ticketUrl && (
                      <a
                        href={getTicketUrl(event.source, event.ticketUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-lagoon hover:underline"
                      >
                        {t('buyTicket', lang)} <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!showRecommended && (
              <p className="text-slate-400 text-sm">{lang === 'hr' ? 'Klikni "Prikaži sve" za personalizirane preporuke' : 'Click "Show all" for personalized recommendations'}</p>
            )}
          </section>
        )}

        <section className="card p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">🎪 {t('eventsNearby', lang)}</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn border border-slate-700 bg-slate-900 hover:border-slate-500 gap-2"
              >
                <Filter size={18} />
                {t('filters', lang)}
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filter Section */}
            {showFilters && (
              <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/50 space-y-4">
                {/* City Filter */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">{t('selectCity', lang)}</label>
                  <div className="flex gap-2 flex-wrap">
                    {croatianCities.map(city => (
                      <button
                        key={city}
                        onClick={() => setCityQuery(city)}
                        className={`rounded-full px-3 py-1.5 text-sm transition ${
                          cityQuery === city
                            ? 'bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold'
                            : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Genre Filter */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">{lang === 'hr' ? 'Filtriraj po žanru' : 'Filter by genre'}</label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedGenre('')}
                      className={`rounded-full px-3 py-1.5 text-sm transition ${
                        selectedGenre === ''
                          ? 'bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold'
                          : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {t('all', lang)}
                    </button>
                    {genreOptions.map(genre => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`rounded-full px-3 py-1.5 text-sm transition ${
                          selectedGenre === genre
                            ? 'bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold'
                            : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        🎵 {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source Filter */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">{t('filterBySource', lang)}</label>
                  <div className="flex gap-2 flex-wrap">
                    {ticketSources.map(source => (
                      <button
                        key={source.id}
                        onClick={() => toggleSource(source.domain)}
                        className={`rounded-full px-3 py-1.5 text-sm transition flex items-center gap-1 ${
                          selectedSources.includes(source.domain)
                            ? 'bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold'
                            : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        🎫 {source.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">{t('filterByDate', lang)}</label>
                  <div className="flex gap-3 flex-wrap items-center">
                    {/* Day */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">{t('day', lang)}</span>
                      <select
                        value={selectedDay ?? ''}
                        onChange={(e) => setSelectedDay(e.target.value ? parseInt(e.target.value) : null)}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-lagoon/60 focus:outline-none min-w-[80px]"
                      >
                        <option value="">{t('all', lang)}</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>

                    {/* Month */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">{t('month', lang)}</span>
                      <select
                        value={selectedMonth ?? ''}
                        onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-lagoon/60 focus:outline-none min-w-[120px]"
                      >
                        <option value="">{t('all', lang)}</option>
                        <option value="1">{t('january', lang)}</option>
                        <option value="2">{t('february', lang)}</option>
                        <option value="3">{t('march', lang)}</option>
                        <option value="4">{t('april', lang)}</option>
                        <option value="5">{t('may', lang)}</option>
                        <option value="6">{t('june', lang)}</option>
                        <option value="7">{t('july', lang)}</option>
                        <option value="8">{t('august', lang)}</option>
                        <option value="9">{t('september', lang)}</option>
                        <option value="10">{t('october', lang)}</option>
                        <option value="11">{t('november', lang)}</option>
                        <option value="12">{t('december', lang)}</option>
                      </select>
                    </div>

                    {/* Year */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">{t('year', lang)}</span>
                      <select
                        value={selectedYear ?? ''}
                        onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-lagoon/60 focus:outline-none min-w-[100px]"
                      >
                        <option value="">{t('all', lang)}</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                    </div>

                    {/* Clear all filters button */}
                    {(selectedSources.length > 0 || selectedDay !== null || selectedMonth !== null || selectedYear !== null || selectedGenre !== '') && (
                      <button
                        onClick={() => {
                          setSelectedSources([]);
                          setSelectedDay(null);
                          setSelectedMonth(null);
                          setSelectedYear(null);
                          setSelectedGenre('');
                        }}
                        className="rounded-full px-3 py-2 text-sm border border-red-500/40 text-red-300 hover:bg-red-500/10 transition self-end"
                      >
                        {t('clearFilters', lang)}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Search */}
            <div className="flex gap-3 max-w-md">
              <div className="relative flex-1">
                <MapPin className="pointer-events-none absolute left-3 top-2.5 text-slate-500" size={20} />
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
                  value={cityQuery}
                  onChange={e => setCityQuery(e.target.value)}
                  placeholder="npr. Zagreb"
                />
              </div>
              <button
                onClick={fetchEvents}
                disabled={loading}
                className="btn border border-slate-700 bg-slate-900 hover:border-slate-500"
              >
                <Search size={20} />
              </button>
            </div>

            {/* Active Filters Display */}
            {selectedSources.length > 0 && (
              <div className="text-sm text-slate-400">
                {t('showingEventsFrom', lang)}: {selectedSources.map(s => ticketSources.find(ts => ts.domain === s)?.name).join(', ')}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {events.length === 0 ? (
              <p className="col-span-full text-slate-400 text-center py-8">{t('noEventsAvailable', lang)} {cityQuery}{selectedSources.length > 0 ? (lang === 'hr' ? ' s odabranim filterima' : ' with selected filters') : ''}</p>
            ) : (
              events.map(event => (
                <div key={event.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                      <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin size={16} />
                        {event.location} • {new Date(event.date).toLocaleDateString('hr-HR')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleWishlist(event.id)}
                      className={`flex-shrink-0 p-2 rounded-full transition ${
                        wishlist.has(event.id)
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-slate-800 text-slate-400 hover:text-red-300'
                      }`}
                    >
                      <Heart size={20} fill={wishlist.has(event.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-slate-300">{event.artists}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300">
                        🎵 {event.genre}
                      </span>
                      {event.source && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-lagoon/30 bg-lagoon/10 px-2 py-1 text-xs text-lagoon">
                          🎫 {event.source}
                        </span>
                      )}
                    </div>
                  </div>

                  {event.ticketUrl && (
                    <a
                      href={getTicketUrl(event.source, event.ticketUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn w-full bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold justify-center gap-2"
                    >
                      {t('buyTicketOn', lang)} {event.source?.replace('.hr', '').replace('.com', '') || 'web'}
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
