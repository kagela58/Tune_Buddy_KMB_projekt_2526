import { db } from './db';

export interface ChatMessageRow {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  createdAt: string;
}

export function createChatTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      receiverId INTEGER NOT NULL,
      message TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(senderId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(receiverId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat_messages(senderId);
    CREATE INDEX IF NOT EXISTS idx_chat_receiver ON chat_messages(receiverId);
    
    CREATE TABLE IF NOT EXISTS chat_read_status (
      userId INTEGER NOT NULL,
      matchId INTEGER NOT NULL,
      lastReadAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (userId, matchId),
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(matchId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export function getChatMessages(userId: number, matchId: number) {
  return db.prepare(`
    SELECT * FROM chat_messages
    WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
    ORDER BY createdAt ASC
  `).all(userId, matchId, matchId, userId) as ChatMessageRow[];
}

export function sendChatMessage(senderId: number, receiverId: number, message: string) {
  const result = db.prepare('INSERT INTO chat_messages (senderId, receiverId, message) VALUES (?, ?, ?)').run(senderId, receiverId, message);
  return result.lastInsertRowid;
}

export function getUserMatches(userId: number) {
  // Get all users except current user, sorted by last message timestamp (active chats first)
  return db.prepare(`
    SELECT 
      u.id, 
      u.firstName || ' ' || u.lastName as name,
      u.location,
      u.profileImage,
      p.genres,
      p.artists,
      (
        SELECT MAX(createdAt) 
        FROM chat_messages 
        WHERE (senderId = u.id AND receiverId = ?) OR (senderId = ? AND receiverId = u.id)
      ) as lastMessageAt
    FROM users u
    LEFT JOIN preferences p ON u.id = p.userId
    WHERE u.id != ? AND u.deletedAt IS NULL
    ORDER BY lastMessageAt DESC NULLS LAST, u.firstName ASC
  `).all(userId, userId, userId) as Array<{
    id: number;
    name: string;
    location: string;
    profileImage: string;
    genres: string;
    artists: string;
    lastMessageAt: string | null;
  }>;
}

export function getUnreadMessages(userId: number) {
  // Get recent messages sent TO the current user that haven't been read yet
  const result = db.prepare(`
    SELECT 
      cm.senderId as matchId,
      u.firstName || ' ' || u.lastName as matchName,
      u.profileImage as matchImage,
      cm.message as lastMessage,
      cm.createdAt as timestamp,
      COUNT(*) as unreadCount
    FROM chat_messages cm
    JOIN users u ON u.id = cm.senderId
    WHERE cm.receiverId = ?
    AND u.deletedAt IS NULL
    AND cm.createdAt > COALESCE(
      (SELECT lastReadAt FROM chat_read_status WHERE userId = ? AND matchId = cm.senderId),
      '1970-01-01'
    )
    GROUP BY cm.senderId
    ORDER BY MAX(cm.createdAt) DESC
  `).all(userId, userId) as Array<{
    matchId: number;
    matchName: string;
    matchImage: string | null;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
  }>;
  
  return result;
}

export function markMessagesAsRead(userId: number, matchId: number) {
  // Update or insert the last read timestamp for this conversation
  db.prepare(`
    INSERT INTO chat_read_status (userId, matchId, lastReadAt)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(userId, matchId) DO UPDATE SET lastReadAt = CURRENT_TIMESTAMP
  `).run(userId, matchId);
}

// Delete a single message (only if user is the sender)
export function deleteMessage(userId: number, messageId: number): boolean {
  const message = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(messageId) as ChatMessageRow | undefined;
  if (!message || message.senderId !== userId) {
    return false; // Can only delete own messages
  }
  db.prepare('DELETE FROM chat_messages WHERE id = ?').run(messageId);
  return true;
}

// Delete entire chat conversation between two users
export function deleteChat(userId: number, matchId: number): number {
  const result = db.prepare(`
    DELETE FROM chat_messages 
    WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
  `).run(userId, matchId, matchId, userId);
  
  // Also clear read status
  db.prepare('DELETE FROM chat_read_status WHERE (userId = ? AND matchId = ?) OR (userId = ? AND matchId = ?)').run(userId, matchId, matchId, userId);
  
  return result.changes;
}
