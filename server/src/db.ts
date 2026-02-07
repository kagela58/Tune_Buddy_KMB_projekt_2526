import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'tunebuddy.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      bio TEXT,
      age INTEGER,
      gender TEXT,
      profileImage TEXT,
      location TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletedAt DATETIME
    );

    CREATE TABLE IF NOT EXISTS preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL UNIQUE,
      genres TEXT NOT NULL,
      artists TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      date TEXT NOT NULL,
      artists TEXT NOT NULL,
      genre TEXT NOT NULL,
      ticketUrl TEXT,
      source TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      eventId INTEGER NOT NULL,
      status TEXT DEFAULT 'interested',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(eventId) REFERENCES events(id) ON DELETE CASCADE,
      UNIQUE(userId, eventId)
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_wishlist_userId ON wishlist(userId);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
  `);
  
  // Add gender column if it doesn't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE users ADD COLUMN gender TEXT`);
  } catch (e) {
    // Column already exists, ignore
  }
}
