import { ChatMessage, EventItem, MatchResult, UserProfile } from '../types';

export const mockProfile: UserProfile = {
  id: 'you',
  name: 'Mia TuneBuddy',
  email: 'mia@example.com',
  location: 'Zagreb',
  bio: 'Elektronika, indie i večernji koncerti po gradu.',
  genres: ['Electronic', 'Indie', 'Pop'],
  artists: ['ODESZA', 'Tame Impala', 'Dua Lipa']
};

export const mockMatches: MatchResult[] = [
  {
    id: 'matea',
    name: 'Matea B.',
    location: 'Zagreb',
    genres: ['Pop', 'Electronic', 'Indie'],
    artists: ['Dua Lipa', 'Fred again..', 'Tame Impala'],
    score: 0.86,
    sharedGenres: ['Electronic', 'Indie', 'Pop'],
    sharedArtists: ['Dua Lipa', 'Tame Impala']
  },
  {
    id: 'karmen',
    name: 'Karmen G.',
    location: 'Split',
    genres: ['Rock', 'Indie', 'Pop'],
    artists: ['Arctic Monkeys', 'The Killers', 'Paramore'],
    score: 0.62,
    sharedGenres: ['Indie', 'Pop'],
    sharedArtists: []
  },
  {
    id: 'barbara',
    name: 'Barbara J.',
    location: 'Rijeka',
    genres: ['Electronic', 'Funk', 'Pop'],
    artists: ['Daft Punk', 'Jamiroquai', 'Disclosure'],
    score: 0.71,
    sharedGenres: ['Electronic', 'Pop'],
    sharedArtists: []
  }
];

export const mockEvents: EventItem[] = [
  {
    id: 1,
    title: 'Sunset Electronica @ Jarun',
    location: 'Zagreb',
    date: '2026-03-12',
    artists: 'Local DJs',
    genre: 'Electronic'
  },
  {
    id: 2,
    title: 'Indie Nights @ Tvornica',
    location: 'Zagreb',
    date: '2026-02-28',
    artists: 'Indie Collective',
    genre: 'Indie'
  },
  {
    id: 3,
    title: 'Rock & Friends Festival',
    location: 'Split',
    date: '2026-04-05',
    artists: 'Regional Rock Stars',
    genre: 'Rock'
  }
];

export const mockMessages: ChatMessage[] = [
  {
    sender: 'buddy',
    text: 'Hej, vidim da voliš ODESZA! Jesi čula novi live set?',
    timestamp: '2026-01-08T18:20:00Z'
  },
  {
    sender: 'you',
    text: 'Da, totalno me oduševio! Tražiš nekog za koncert u ožujku?',
    timestamp: '2026-01-08T18:21:00Z'
  }
];
