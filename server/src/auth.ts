import { db } from './db';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

export interface UserRow {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  age: number | null;
  profileImage: string | null;
  location: string | null;
  createdAt: string;
}

export function registerUser(email: string, password: string, firstName: string, lastName: string, bio: string, age: number | null, gender: string | null = null, location: string | null = null) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new Error('Email already registered');

  const passwordHash = bcryptjs.hashSync(password, 10);
  const result = db.prepare(`
    INSERT INTO users (email, passwordHash, firstName, lastName, bio, age, gender, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(email, passwordHash, firstName, lastName, bio, age, gender, location);

  return getUserById(result.lastInsertRowid as number);
}

export function loginUser(email: string, password: string) {
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND deletedAt IS NULL').get(email) as UserRow | undefined;
  if (!user) throw new Error('Invalid email or password');

  const passwordHash = db.prepare('SELECT passwordHash FROM users WHERE id = ?').get(user.id) as { passwordHash: string };
  const isValid = bcryptjs.compareSync(password, passwordHash.passwordHash);
  if (!isValid) throw new Error('Invalid email or password');

  return user;
}

export function getUserById(id: number) {
  return db.prepare('SELECT id, email, firstName, lastName, bio, age, gender, profileImage, location, createdAt FROM users WHERE id = ? AND deletedAt IS NULL').get(id) as UserRow | undefined;
}

export function updateUserProfile(id: number, data: Partial<UserRow>) {
  const updates = [];
  const values = [];

  if (data.firstName !== undefined) {
    updates.push('firstName = ?');
    values.push(data.firstName);
  }
  if (data.lastName !== undefined) {
    updates.push('lastName = ?');
    values.push(data.lastName);
  }
  if (data.bio !== undefined) {
    updates.push('bio = ?');
    values.push(data.bio);
  }
  if (data.age !== undefined) {
    updates.push('age = ?');
    values.push(data.age);
  }
  if (data.profileImage !== undefined) {
    updates.push('profileImage = ?');
    values.push(data.profileImage);
  }
  if (data.location !== undefined) {
    updates.push('location = ?');
    values.push(data.location);
  }

  if (updates.length === 0) return getUserById(id);

  values.push(id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  return getUserById(id);
}

export function deleteUserAccount(id: number) {
  db.prepare('UPDATE users SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?').run(id);
}

export function generateToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    return null;
  }
}

export function saveUserPreferences(userId: number, genres: string[], artists: string[]) {
  db.prepare('DELETE FROM preferences WHERE userId = ?').run(userId);
  db.prepare('INSERT INTO preferences (userId, genres, artists) VALUES (?, ?, ?)').run(
    userId,
    JSON.stringify(genres),
    JSON.stringify(artists)
  );
}

export function getUserPreferences(userId: number) {
  const pref = db.prepare('SELECT genres, artists FROM preferences WHERE userId = ?').get(userId) as { genres: string; artists: string } | undefined;
  if (!pref) return { genres: [], artists: [] };
  return { genres: JSON.parse(pref.genres), artists: JSON.parse(pref.artists) };
}

export function getWishlistEvents(userId: number) {
  return db.prepare(`
    SELECT e.* FROM events e
    JOIN wishlist w ON e.id = w.eventId
    WHERE w.userId = ?
    ORDER BY e.date ASC
  `).all(userId) as Array<any>;
}

export function toggleWishlistEvent(userId: number, eventId: number, status: 'interested' | 'going') {
  const existing = db.prepare('SELECT id FROM wishlist WHERE userId = ? AND eventId = ?').get(userId, eventId);
  if (existing) {
    db.prepare('UPDATE wishlist SET status = ? WHERE userId = ? AND eventId = ?').run(status, userId, eventId);
  } else {
    db.prepare('INSERT INTO wishlist (userId, eventId, status) VALUES (?, ?, ?)').run(userId, eventId, status);
  }
}

export function removeWishlistEvent(userId: number, eventId: number) {
  db.prepare('DELETE FROM wishlist WHERE userId = ? AND eventId = ?').run(userId, eventId);
}

// Get users who also favorited the same event (excluding current user)
export function getUsersWhoAlsoFavorited(userId: number, eventId: number) {
  return db.prepare(`
    SELECT u.id, u.name, u.profileImage, u.location
    FROM users u
    JOIN wishlist w ON u.id = w.userId
    WHERE w.eventId = ? AND u.id != ?
    ORDER BY u.name ASC
  `).all(eventId, userId) as Array<{id: number, name: string, profileImage: string | null, location: string}>;
}
