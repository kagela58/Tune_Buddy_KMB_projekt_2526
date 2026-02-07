import { mockEvents, mockMatches, mockMessages, mockProfile } from '../data/mock';
import { ChatMessage, EventItem, MatchResult, UserProfile } from '../types';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
    body: init?.body ? init.body : undefined
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getProfile(): Promise<UserProfile> {
  try {
    return await fetchJson<UserProfile>('/api/profile');
  } catch (err) {
    console.warn('Falling back to mock profile', err);
    return mockProfile;
  }
}

export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  try {
    return await fetchJson<UserProfile>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  } catch (err) {
    console.warn('Falling back to mock profile save', err);
    return profile;
  }
}

export async function getMatches(city?: string): Promise<MatchResult[]> {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  try {
    return await fetchJson<MatchResult[]>(`/api/matches${query}`);
  } catch (err) {
    console.warn('Falling back to mock matches', err);
    return mockMatches;
  }
}

export async function getEvents(city?: string): Promise<EventItem[]> {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  try {
    return await fetchJson<EventItem[]>(`/api/events${query}`);
  } catch (err) {
    console.warn('Falling back to mock events', err);
    return mockEvents;
  }
}

export async function getMessages(matchId: string): Promise<ChatMessage[]> {
  try {
    return await fetchJson<ChatMessage[]>(`/api/chat/${matchId}`);
  } catch (err) {
    console.warn('Falling back to mock chat', err);
    return mockMessages;
  }
}

export async function sendMessage(matchId: string, text: string): Promise<ChatMessage[]> {
  try {
    return await fetchJson<ChatMessage[]>(`/api/chat/${matchId}`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  } catch (err) {
    console.warn('Falling back to mock send', err);
    return [
      ...mockMessages,
      { sender: 'you', text, timestamp: new Date().toISOString() }
    ];
  }
}

export async function register(email: string, password: string) {
  try {
    return await fetchJson<{ token: string; user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  } catch (err) {
    console.warn('Auth register stub fallback', err);
    return { token: 'mock-token', user: mockProfile };
  }
}

export async function login(email: string, password: string) {
  return await fetchJson<{ token: string; user: UserProfile }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}
