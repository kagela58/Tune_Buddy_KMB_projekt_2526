import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, MapPin } from 'lucide-react';
import { Genre } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import LanguageSelector from '../i18n/LanguageSelector';

const genreOptions: Genre[] = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Indie', 'Jazz', 'Classical', 'Metal', 'Funk', 'R&B', 'Folk', 'Country', 'Reggae', 'Latino', 'Turbofolk'];

const croatianCities = [
  'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula', 'Dubrovnik',
  'Šibenik', 'Varaždin', 'Karlovac', 'Slavonski Brod', 'Čakovec',
  'Solin', 'Poreč', 'Makarska'
];

interface RegisterProps {
  onNavigate: (page: string) => void;
  onRegister: (data: any) => Promise<void>;
  isLoading: boolean;
}

export default function Register({ onNavigate, onRegister, isLoading }: RegisterProps) {
  const { lang } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [artists, setArtists] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    bio: '',
    age: '',
    gender: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least 2 genres selected
    if (selectedGenres.length < 2) {
      alert(lang === 'hr' ? 'Molimo odaberi barem 2 žanra!' : 'Please select at least 2 genres!');
      return;
    }
    
    await onRegister({
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
      gender: formData.gender || null,
      location: formData.location || null,
      genres: selectedGenres,
      artists: artists.split(',').map(a => a.trim()).filter(Boolean)
    });
  };

  const toggleGenre = (genre: Genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md card p-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft size={20} />
            {t('back', lang)}
          </button>
          <LanguageSelector />
        </div>

        <h1 className="text-3xl font-black text-white">{t('registerTitle', lang)}</h1>
        <p className="text-slate-400">{t('registerSubtitle', lang)}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-slate-300">
              {t('firstName', lang)} *
              <input
                type="text"
                required
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                onInvalid={e => {
                  const input = e.target as HTMLInputElement;
                  if (input.validity.valueMissing) {
                    input.setCustomValidity(lang === 'hr' ? 'Molimo unesite ime' : 'Please enter first name');
                  }
                }}
                onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
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
                onInvalid={e => {
                  const input = e.target as HTMLInputElement;
                  if (input.validity.valueMissing) {
                    input.setCustomValidity(lang === 'hr' ? 'Molimo unesite prezime' : 'Please enter last name');
                  }
                }}
                onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
              />
            </label>
          </div>

          <label className="text-sm text-slate-300 block">
            {t('email', lang)} *
            <input
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              onInvalid={e => {
                const input = e.target as HTMLInputElement;
                if (input.validity.valueMissing) {
                  input.setCustomValidity(lang === 'hr' ? 'Molimo unesite e-mail adresu' : 'Please enter an email address');
                } else if (input.validity.typeMismatch) {
                  input.setCustomValidity(lang === 'hr' ? 'Molimo unesite ispravnu e-mail adresu (npr. ime@domena.com)' : 'Please enter a valid email address');
                }
              }}
              onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
            />
          </label>

          <label className="text-sm text-slate-300 block">
            {t('password', lang)} *
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                onInvalid={e => {
                  const input = e.target as HTMLInputElement;
                  if (input.validity.valueMissing) {
                    input.setCustomValidity(lang === 'hr' ? 'Molimo unesite lozinku' : 'Please enter a password');
                  }
                }}
                onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

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
                onInvalid={e => {
                  const input = e.target as HTMLInputElement;
                  if (input.validity.valueMissing) {
                    input.setCustomValidity(lang === 'hr' ? 'Molimo unesite godine' : 'Please enter your age');
                  } else if (input.validity.rangeUnderflow) {
                    input.setCustomValidity(lang === 'hr' ? 'Morate imati najmanje 13 godina' : 'You must be at least 13 years old');
                  } else if (input.validity.rangeOverflow) {
                    input.setCustomValidity(lang === 'hr' ? 'Unesite ispravne godine' : 'Please enter a valid age');
                  }
                }}
                onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
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
              value={isCustomCity ? '__other__' : formData.location}
              onChange={e => {
                if (e.target.value === '__other__') {
                  setIsCustomCity(true);
                  setFormData({ ...formData, location: '' });
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
            {isCustomCity && (
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

          <div>
            <p className="mb-2 text-sm text-slate-300">
              {t('favoriteGenres', lang)} * <span className="text-slate-500">({lang === 'hr' ? 'min. 2' : 'min. 2'})</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {genreOptions.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
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

          <label className="text-sm text-slate-300 block">
            {lang === 'hr' ? 'Opis (kratko o sebi)' : 'Description (about yourself)'}
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none min-h-[80px] resize-none"
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder={lang === 'hr' ? 'npr. Ljubitelj elektronike i indie glazbe...' : 'e.g. Electronic and indie music lover...'}
            />
          </label>

          <label className="text-sm text-slate-300 block">
            {t('favoriteArtists', lang)}
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none min-h-[60px] resize-none"
              value={artists}
              onChange={e => setArtists(e.target.value)}
              placeholder={t('artistsPlaceholder', lang)}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold justify-center"
          >
            {isLoading ? (lang === 'hr' ? 'Registriram...' : 'Registering...') : t('createProfile', lang)}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          {t('haveAccount', lang)}{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-lagoon hover:text-lagoon/80 transition font-semibold"
          >
            {t('login', lang)}
          </button>
        </p>
      </div>
    </div>
  );
}
