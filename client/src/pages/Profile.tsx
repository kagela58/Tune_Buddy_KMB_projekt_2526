import { useState, useEffect, useRef } from 'react';
import { Menu, Trash2, LogOut, Upload, MapPin, Music, User, Edit3, ArrowLeft } from 'lucide-react';
import { Genre } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import LanguageSelector from '../i18n/LanguageSelector';
import SideMenu from '../components/SideMenu';
import { getImageUrl, croatianCities, genreOptions } from '../utils/helpers';

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

interface ProfileProps {
  user: any;
  onLogout: () => void;
  onBack: () => void;
  onNavigateDashboard?: () => void;
  onNavigateEvents?: () => void;
  onNavigateChatList?: () => void;
  onNavigateFavorites?: () => void;
  onProfileUpdate?: () => void;
}

export default function Profile({ user, onLogout, onBack, onNavigateDashboard, onNavigateEvents, onNavigateChatList, onNavigateFavorites, onProfileUpdate }: ProfileProps) {
  const { lang } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(user?.profileImage || '');
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [artists, setArtists] = useState('');
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || '',
    location: user?.location || ''
  });

  // Keep original values for cancel
  const [originalData, setOriginalData] = useState({ ...formData });
  const [originalImage, setOriginalImage] = useState(imageUrl);
  const [originalGenres, setOriginalGenres] = useState<Genre[]>([]);
  const [originalArtists, setOriginalArtists] = useState('');

  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const profile = await res.json();
        console.log('Loaded profile:', profile);
        console.log('Profile image URL:', profile.profileImage);
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          bio: profile.bio || '',
          age: profile.age?.toString() || '',
          gender: profile.gender || '',
          location: profile.location || ''
        });
        setImageUrl(profile.profileImage || '');
        setOriginalData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          bio: profile.bio || '',
          age: profile.age?.toString() || '',
          gender: profile.gender || '',
          location: profile.location || ''
        });
        setOriginalImage(profile.profileImage || '');
      }
    } catch (err) {
      console.error('Error loading profile', err);
    }
  };

  const loadPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/preferences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const prefs = await res.json();
        const genres = prefs.genres || [];
        const artistsStr = (prefs.artists || []).join(', ');
        setSelectedGenres(genres);
        setArtists(artistsStr);
        setOriginalGenres(genres);
        setOriginalArtists(artistsStr);
      }
    } catch (err) {
      console.error('Error loading preferences', err);
    }
  };

  const handleStartEditing = () => {
    setOriginalData({ ...formData });
    setOriginalImage(imageUrl);
    setOriginalGenres([...selectedGenres]);
    setOriginalArtists(artists);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setFormData({ ...originalData });
    setImageUrl(originalImage);
    setSelectedGenres([...originalGenres]);
    setArtists(originalArtists);
    setIsEditing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'hr' ? 'Molimo odaberite sliku (jpeg, png, gif, webp)' : 'Please select an image (jpeg, png, gif, webp)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'hr' ? 'Slika je prevelika. Maksimalna veličina je 5MB.' : 'Image is too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.imageUrl);
      } else {
        alert(lang === 'hr' ? 'Greška pri uploadu slike' : 'Error uploading image');
      }
    } catch (err) {
      console.error('Error uploading file', err);
      alert(lang === 'hr' ? 'Greška pri uploadu slike' : 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (selectedGenres.length < 2) {
      alert(lang === 'hr' ? 'Molimo odaberi barem 2 žanra!' : 'Please select at least 2 genres!');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          location: formData.location || null,
          profileImage: imageUrl
        })
      });

      await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          genres: selectedGenres, 
          artists: artists.split(',').map(a => a.trim()).filter(Boolean)
        })
      });

      setOriginalData({ ...formData });
      setOriginalImage(imageUrl);
      setOriginalGenres([...selectedGenres]);
      setOriginalArtists(artists);
      setIsEditing(false);
      
      // Refresh user data in parent component
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
      alert(lang === 'hr' ? 'Profil je ažuriran!' : 'Profile updated!');
    } catch (err) {
      console.error('Error saving profile', err);
      alert(lang === 'hr' ? 'Greška pri spremanju profila' : 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      onLogout();
    } catch (err) {
      console.error('Error deleting account', err);
      alert(lang === 'hr' ? 'Greška pri brisanju profila' : 'Error deleting profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre: Genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // ===================== VIEW MODE =====================
  if (!isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        {/* Side Menu */}
        <SideMenu
          showSideMenu={showSideMenu}
          setShowSideMenu={setShowSideMenu}
          currentPage="profile"
          lang={lang}
          onNavigateDashboard={onNavigateDashboard || onBack}
          onNavigateEvents={onNavigateEvents}
          onNavigateFavorites={onNavigateFavorites}
          onNavigateChatList={onNavigateChatList}
          onLogout={onLogout}
        />

        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur-lg bg-slate-950/70 border-b border-slate-800">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Back Arrow */}
              <button
                onClick={onNavigateDashboard || onBack}
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
            <h1 className="text-lg sm:text-xl font-bold mobile-hide-title">{t('myProfile', lang)}</h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector />
              <div
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-800 border-2 border-coral flex items-center justify-center overflow-hidden"
                title={t('profile', lang)}
              >
                {imageUrl ? (
                  <img src={getImageUrl(imageUrl)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <GenderAvatar gender={formData.gender} size={20} />
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-10">
          <div className="card p-4 sm:p-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                {imageUrl ? (
                  <img src={getImageUrl(imageUrl)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <GenderAvatar gender={formData.gender} size={64} />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold mb-1">
                  {formData.firstName} {formData.lastName}
                  {formData.gender && (
                    <span className={`ml-2 ${formData.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                      {formData.gender === 'male' ? '♂' : '♀'}
                    </span>
                  )}
                </h2>
                {formData.location && (
                  <p className="text-slate-400 flex items-center gap-1 mb-2">
                    <MapPin size={16} /> {formData.location}
                  </p>
                )}
                {formData.age && (
                  <p className="text-slate-400 mb-3">{formData.age} {lang === 'hr' ? 'godina' : 'years old'}</p>
                )}
                <button
                  onClick={handleStartEditing}
                  className="btn bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold gap-2"
                >
                  <Edit3 size={18} />
                  {t('editProfile', lang)}
                </button>
              </div>
            </div>

            {/* Bio */}
            {formData.bio && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-300 mb-2">{lang === 'hr' ? 'O meni' : 'About me'}</h3>
                <p className="text-slate-400">{formData.bio}</p>
              </div>
            )}

            {/* Genres */}
            {selectedGenres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-300 mb-2">{t('favoriteGenres', lang)}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGenres.map(g => (
                    <span key={g} className="rounded-full border border-lagoon bg-lagoon/15 text-lagoon px-3 py-1 text-sm">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Artists */}
            {artists && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-300 mb-2">{t('favoriteArtists', lang)}</h3>
                <p className="text-slate-400">{artists}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-6 border-t border-slate-800 flex flex-wrap gap-3">
              <button
                onClick={onLogout}
                className="btn border border-slate-600 text-slate-300 hover:bg-slate-800 gap-2"
              >
                <LogOut size={18} />
                {t('logout', lang)}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={loading}
                className="btn border border-red-500/40 text-red-200 hover:bg-red-500/10 gap-2"
              >
                <Trash2 size={18} />
                {t('deleteProfile', lang)}
              </button>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-2">
                  {lang === 'hr' ? 'Obriši profil' : 'Delete profile'}
                </h3>
                <p className="text-slate-400 mb-6">
                  {lang === 'hr' 
                    ? 'Jeste li sigurni da želite obrisati svoj profil? Ova radnja je nepovratna i svi vaši podaci će biti trajno izbrisani.' 
                    : 'Are you sure you want to delete your profile? This action cannot be undone and all your data will be permanently deleted.'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 btn border border-slate-600 text-slate-300 hover:bg-slate-800 justify-center"
                  >
                    {t('cancel', lang)}
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="flex-1 btn bg-red-600 hover:bg-red-700 text-white justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    {lang === 'hr' ? 'Da, obriši' : 'Yes, delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ===================== EDIT MODE =====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-lg bg-slate-950/70 border-b border-slate-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancelEditing}
              className="p-2 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white"
            >
              <ArrowLeft size={24} />
            </button>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-lagoon to-coral text-xl font-black shadow-lg">TB</span>
            <p className="text-lg font-bold">TuneBuddy</p>
          </div>
          <h1 className="text-xl font-bold">{t('editProfile', lang)}</h1>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <div
              className="h-10 w-10 rounded-full bg-slate-800 border-2 border-coral flex items-center justify-center overflow-hidden"
            >
              {imageUrl ? (
                <img src={getImageUrl(imageUrl)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <GenderAvatar gender={formData.gender} size={20} />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="card p-8 space-y-4">
          {/* Profile Picture */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('profilePicture', lang)}</h2>
            <div className="flex items-center gap-6">
              <div className="h-32 w-32 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                {imageUrl ? (
                  <img src={getImageUrl(imageUrl)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <GenderAvatar gender={formData.gender} size={64} />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold gap-2 disabled:opacity-50"
                >
                  <Upload size={20} />
                  {uploading ? (lang === 'hr' ? 'Učitavam...' : 'Uploading...') : t('chooseImage', lang)}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-slate-400">{lang === 'hr' ? 'Ili unesi URL:' : 'Or enter URL:'}</p>
                <input
                  type="url"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-lagoon/60 focus:outline-none"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('basicInfo', lang)}</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-300">
                {t('firstName', lang)} *
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                />
              </label>
              <label className="text-sm text-slate-300">
                {t('lastName', lang)} *
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-300">
                {t('age', lang)} *
                <input
                  type="number"
                  min="13"
                  max="120"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                />
              </label>

              <label className="text-sm text-slate-300">
                {lang === 'hr' ? 'Spol' : 'Gender'} *
                <select
                  required
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">{lang === 'hr' ? 'Odaberi' : 'Select'}</option>
                  <option value="male">{lang === 'hr' ? 'Muško' : 'Male'}</option>
                  <option value="female">{lang === 'hr' ? 'Žensko' : 'Female'}</option>
                </select>
              </label>
            </div>

            <label className="text-sm text-slate-300 block">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                {t('city', lang)} *
              </div>
              <select
                required={!isCustomCity}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
                value={isCustomCity ? '__other__' : (croatianCities.includes(formData.location) ? formData.location : '__other__')}
                onChange={e => {
                  if (e.target.value === '__other__') {
                    setIsCustomCity(true);
                    if (croatianCities.includes(formData.location)) {
                      setFormData({ ...formData, location: '' });
                    }
                  } else {
                    setIsCustomCity(false);
                    setFormData({ ...formData, location: e.target.value });
                  }
                }}
              >
                <option value="">{t('selectCity', lang)}</option>
                {croatianCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
                <option value="__other__">{lang === 'hr' ? 'Drugi grad...' : 'Other city...'}</option>
              </select>
              {(isCustomCity || (!croatianCities.includes(formData.location) && formData.location !== '')) && (
                <input
                  type="text"
                  required
                  placeholder={lang === 'hr' ? 'Upiši naziv grada' : 'Enter city name'}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              )}
            </label>
          </div>

          {/* Genres */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              {t('favoriteGenres', lang)} * <span className="text-slate-500 text-base font-normal">({lang === 'hr' ? 'min. 2' : 'min. 2'})</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {genreOptions.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`rounded-full border px-3 py-1 text-sm transition cursor-pointer ${
                    selectedGenres.includes(g)
                      ? 'border-lagoon bg-lagoon/15 text-lagoon'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{lang === 'hr' ? 'Opis' : 'Description'}</h2>
            <textarea
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none min-h-[80px] resize-none"
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder={lang === 'hr' ? 'npr. Ljubitelj elektronike i indie glazbe...' : 'e.g. Electronic and indie music lover...'}
            />
          </div>

          {/* Favorite Artists */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('favoriteArtists', lang)}</h2>
            <textarea
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none min-h-[60px] resize-none"
              value={artists}
              onChange={e => setArtists(e.target.value)}
              placeholder={t('artistsPlaceholder', lang)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-slate-800">
            <button
              onClick={handleCancelEditing}
              className="flex-1 btn border border-slate-600 text-slate-300 hover:bg-slate-800 justify-center"
            >
              {t('cancel', lang)}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 btn bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold justify-center"
            >
              {loading ? (lang === 'hr' ? 'Spremam...' : 'Saving...') : t('saveChanges', lang)}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
