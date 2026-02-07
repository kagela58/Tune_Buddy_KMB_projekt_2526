import { db } from './db';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  location: string | null;
  profileImage: string | null;
  genres: string[];
  artists: string[];
}

interface MatchScore {
  id: number;
  name: string;
  location: string | null;
  profileImage: string | null;
  genres: string[];
  artists: string[];
  score: number;
  sharedGenres: string[];
  sharedArtists: string[];
  sameCity: boolean;
  bio: string | null;
  age: number | null;
  gender: string | null;
}

/**
 * Calculate match score between two users based on shared preferences
 * Prioritizes users from the same city
 */
export function calculateMatchScore(user1: UserProfile, user2: UserProfile): { score: number; sameCity: boolean } {
  let score = 0;
  let sameCity = false;

  // Location bonus - BIG priority for same city (50 points)
  if (user1.location && user2.location && 
      user1.location.toLowerCase() === user2.location.toLowerCase()) {
    score += 50;
    sameCity = true;
  }

  // Genre matching (30 points max)
  const sharedGenres = user1.genres.filter(g => user2.genres.includes(g));
  score += sharedGenres.length * 8;

  // Artist matching (30 points max)
  const sharedArtists = user1.artists.filter(a => user2.artists.includes(a));
  score += sharedArtists.length * 8;

  return { score: Math.min(score, 100), sameCity }; // Cap at 100
}

/**
 * Get personalized user matches sorted by compatibility score
 * Active chats (with messages) appear at the top, sorted by most recent message
 */
export function getPersonalizedMatches(userId: number): MatchScore[] {
  // Get current user
  const currentUser = db.prepare('SELECT * FROM users WHERE id = ? AND deletedAt IS NULL').get(userId) as any;
  if (!currentUser) return [];

  // Get user preferences
  const currentPrefs = db.prepare('SELECT * FROM preferences WHERE userId = ?').get(userId) as any;
  const currentGenres = currentPrefs?.genres ? JSON.parse(currentPrefs.genres) : [];
  const currentArtists = currentPrefs?.artists ? JSON.parse(currentPrefs.artists) : [];

  const currentProfile: UserProfile = {
    id: currentUser.id,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    location: currentUser.location,
    profileImage: currentUser.profileImage,
    genres: currentGenres,
    artists: currentArtists
  };

  // Get all other users with preferences AND last message timestamp
  const otherUsers = db.prepare(`
    SELECT u.*, p.genres, p.artists,
      (
        SELECT MAX(createdAt) 
        FROM chat_messages 
        WHERE (senderId = u.id AND receiverId = ?) OR (senderId = ? AND receiverId = u.id)
      ) as lastMessageAt
    FROM users u
    LEFT JOIN preferences p ON u.id = p.userId
    WHERE u.id != ? AND u.deletedAt IS NULL
  `).all(userId, userId, userId) as any[];

  const matches: MatchScore[] = otherUsers.map(user => {
    const genres = user.genres ? JSON.parse(user.genres) : [];
    const artists = user.artists ? JSON.parse(user.artists) : [];

    const otherProfile: UserProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      profileImage: user.profileImage,
      genres,
      artists
    };

    const { score, sameCity } = calculateMatchScore(currentProfile, otherProfile);
    const sharedGenres = currentGenres.filter((g: string) => genres.includes(g));
    const sharedArtists = currentArtists.filter((a: string) => artists.includes(a));

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      location: user.location,
      profileImage: user.profileImage,
      genres,
      artists,
      score,
      sharedGenres,
      sharedArtists,
      sameCity,
      bio: user.bio,
      age: user.age,
      gender: user.gender,
      lastMessageAt: user.lastMessageAt || null
    };
  });

  // Sort by: 1) active chats first (by most recent message), 2) score descending (100% to 0%)
  return matches.sort((a, b) => {
    const aHasMessages = !!(a as any).lastMessageAt;
    const bHasMessages = !!(b as any).lastMessageAt;
    
    // First: active chats (with messages) go to top, sorted by most recent
    if (aHasMessages && bHasMessages) {
      return new Date((b as any).lastMessageAt).getTime() - new Date((a as any).lastMessageAt).getTime();
    }
    if (aHasMessages && !bHasMessages) return -1;
    if (!aHasMessages && bHasMessages) return 1;
    
    // For users without messages: sort by score (100% to 0%)
    return b.score - a.score;
  });
}

/**
 * Get recommended events based on user's genre preferences
 */
export function getRecommendedEvents(userId: number) {
  // Get user preferences
  const prefs = db.prepare('SELECT * FROM preferences WHERE userId = ?').get(userId) as any;
  if (!prefs) return [];

  const userGenres = prefs.genres ? JSON.parse(prefs.genres) : [];
  if (userGenres.length === 0) return [];

  // Get all upcoming events
  const events = db.prepare(`
    SELECT * FROM events
    WHERE date >= date('now')
    ORDER BY date ASC
  `).all() as any[];

  // Score events based on genre match
  const scoredEvents = events.map(event => {
    const eventGenre = event.genre || '';
    const match = userGenres.some((g: string) => 
      eventGenre.toLowerCase().includes(g.toLowerCase())
    );
    return {
      ...event,
      recommended: match,
      score: match ? 1 : 0
    };
  });

  // Sort by recommendation score then date
  return scoredEvents.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

/**
 * Get artist recommendations based on user's genre preferences
 */
export function getArtistRecommendations(userId: number): string[] {
  // Get user preferences
  const prefs = db.prepare('SELECT * FROM preferences WHERE userId = ?').get(userId) as any;
  if (!prefs) return [];

  const userGenres = prefs.genres ? JSON.parse(prefs.genres) : [];
  if (userGenres.length === 0) return [];

  // Get all events matching user's genres
  const events = db.prepare(`
    SELECT DISTINCT artists, genre FROM events
    WHERE date >= date('now')
  `).all() as any[];

  const recommendedArtists = new Set<string>();

  events.forEach(event => {
    const eventGenre = event.genre || '';
    const matchesGenre = userGenres.some((g: string) => 
      eventGenre.toLowerCase().includes(g.toLowerCase())
    );

    if (matchesGenre && event.artists) {
      // Split artists by comma and add to set
      const artists = event.artists.split(',').map((a: string) => a.trim());
      artists.forEach((artist: string) => recommendedArtists.add(artist));
    }
  });

  return Array.from(recommendedArtists).slice(0, 20); // Return top 20
}
