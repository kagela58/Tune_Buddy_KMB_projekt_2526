// Shared utility functions

/**
 * Get full image URL - handles both local and external URLs
 */
export function getImageUrl(url: string | null): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:4000${url}`;
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string, lang: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(lang === 'hr' ? 'hr-HR' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format time for display
 */
export function formatTime(dateStr: string, lang: string): string {
  return new Date(dateStr).toLocaleTimeString(lang === 'hr' ? 'hr-HR' : 'en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Croatian cities list
 */
export const croatianCities = [
  'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula', 'Dubrovnik',
  'Šibenik', 'Varaždin', 'Karlovac', 'Slavonski Brod', 'Čakovec',
  'Solin', 'Poreč', 'Makarska'
];

/**
 * Genre options
 */
export const genreOptions = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Indie', 'Jazz', 'Classical', 'Metal', 'Funk', 'R&B', 'Folk', 'Country', 'Reggae', 'Latino', 'Turbofolk'] as const;
export type Genre = typeof genreOptions[number];
