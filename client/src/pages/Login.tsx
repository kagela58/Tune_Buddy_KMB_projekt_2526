import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import LanguageSelector from '../i18n/LanguageSelector';

interface LoginProps {
  onNavigate: (page: string) => void;
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export default function Login({ onNavigate, onLogin, isLoading }: LoginProps) {
  const { lang } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await onLogin(email, password);
    } catch (err: any) {
      const message = err.message || '';
      if (message.includes('Invalid email or password')) {
        setError(lang === 'hr' ? 'Pogrešan email ili lozinka' : 'Invalid email or password');
      } else {
        setError(lang === 'hr' ? 'Greška pri prijavi' : 'Login error');
      }
    }
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

        <h1 className="text-3xl font-black text-white">{t('loginTitle', lang)}</h1>
        <p className="text-slate-400">{t('loginSubtitle', lang)}</p>

        {error && (
          <div className="rounded-xl bg-red-500/15 border border-red-500/40 p-3 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="text-sm text-slate-300">
            {t('email', lang)}
            <input
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
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

          <label className="text-sm text-slate-300">
            {t('password', lang)}
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-lagoon/60 focus:outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold justify-center"
          >
            {isLoading ? (lang === 'hr' ? 'Spajam...' : 'Connecting...') : t('loginButton', lang)}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          {t('noAccount', lang)}{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-lagoon hover:text-lagoon/80 transition font-semibold"
          >
            {t('register', lang)}
          </button>
        </p>
      </div>
    </div>
  );
}
