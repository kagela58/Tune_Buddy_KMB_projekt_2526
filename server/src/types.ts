export type Genre =
  | 'Pop'
  | 'Rock'
  | 'Hip-Hop'
  | 'Electronic'
  | 'Indie'
  | 'Jazz'
  | 'Classical'
  | 'Metal'
  | 'Funk';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  location: string;
  bio: string;
  genres: Genre[];
  artists: string[];
}

export interface EventItem {
  id: string;
  title: string;
  location: string;
  date: string;
  artists: string[];
  genre: Genre;
}

export interface MatchResult {
  id: string;
  name: string;
  location: string;
  genres: Genre[];
  artists: string[];
  score: number;
  sharedGenres: Genre[];
  sharedArtists: string[];
}

export interface ChatMessage {
  sender: 'you' | 'buddy';
  text: string;
  timestamp: string;
}
