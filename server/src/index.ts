import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db, initDb } from './db';
import { seedEvents, getEventsByLocation, getEventsByGenre, getAllUpcomingEvents, getEventsBySource, getEventsByLocationAndSource } from './events';
import { createChatTables, getChatMessages, sendChatMessage, getUserMatches, getUnreadMessages, markMessagesAsRead, deleteMessage, deleteChat } from './chat';
import { getPersonalizedMatches, getRecommendedEvents, getArtistRecommendations } from './recommendations';
import { 
  registerUser, 
  loginUser, 
  getUserById, 
  getUserPreferences, 
  saveUserPreferences, 
  updateUserProfile, 
  deleteUserAccount, 
  generateToken, 
  verifyToken,
  toggleWishlistEvent,
  removeWishlistEvent,
  getWishlistEvents,
  getUsersWhoAlsoFavorited
} from './auth';

const app = express();
app.use(cors());
app.use(express.json());

// Create uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

const PORT = process.env.PORT || 4000;

// Initialize database
try {
  console.log('📦 Initializing database...');
  initDb();
  console.log('✅ Database initialized');
} catch (err) {
  console.error('❌ initDb error:', err);
  process.exit(1);
}

try {
  console.log('💬 Creating chat tables...');
  createChatTables();
  console.log('✅ Chat tables created');
} catch (err) {
  console.error('❌ createChatTables error:', err);
}

try {
  console.log('🎵 Seeding events...');
  seedEvents();
  console.log('✅ Events seeded');
} catch (err) {
  console.error('❌ seedEvents error:', err);
}

// Middleware to extract userId from JWT
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.userId = decoded.userId;
  next();
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'tunebuddy-api' });
});

// Auth routes
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, bio, age, gender, location, genres, artists } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = registerUser(email, password, firstName, lastName, bio || '', age || null, gender || null, location || null);
    if (genres || artists) {
      saveUserPreferences(user.id, genres || [], artists || []);
    }

    const token = generateToken(user.id);
    res.json({ token, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = loginUser(email, password);
    const token = generateToken(user.id);
    res.json({ token, user });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

// Protected routes
app.get('/api/me', authMiddleware, (req: Request, res: Response) => {
  const user = getUserById(req.userId!);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.put('/api/profile', authMiddleware, (req: Request, res: Response) => {
  try {
    const { firstName, lastName, bio, age, profileImage, location } = req.body;
    const updated = updateUserProfile(req.userId!, {
      firstName,
      lastName,
      bio,
      age,
      profileImage,
      location
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/preferences', authMiddleware, (req: Request, res: Response) => {
  const prefs = getUserPreferences(req.userId!);
  res.json(prefs);
});

app.post('/api/preferences', authMiddleware, (req: Request, res: Response) => {
  try {
    const { genres, artists } = req.body;
    saveUserPreferences(req.userId!, genres || [], artists || []);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/profile', authMiddleware, (req: Request, res: Response) => {
  try {
    deleteUserAccount(req.userId!);
    res.json({ success: true, message: 'Profile deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Events routes
app.get('/api/events', (req: Request, res: Response) => {
  try {
    const { location, genre, sources, day, month, year } = req.query;
    let events;

    // Parse sources (comma-separated)
    const sourceList = sources ? (sources as string).split(',').filter(Boolean) : [];

    if (location && sourceList.length > 0) {
      events = getEventsByLocationAndSource(location as string, sourceList);
    } else if (location) {
      events = getEventsByLocation(location as string);
    } else if (sourceList.length > 0) {
      // Filter all events by source
      events = getAllUpcomingEvents().filter(e => 
        sourceList.some(s => e.source?.toLowerCase().includes(s.toLowerCase()))
      );
    } else {
      events = getAllUpcomingEvents();
    }

    // Apply genre filter
    if (genre) {
      events = events.filter((event: any) => 
        event.genre?.toLowerCase().includes((genre as string).toLowerCase())
      );
    }

    // Apply date filters (day, month, year can be used independently)
    if (day || month || year) {
      events = events.filter((event: any) => {
        const eventDate = new Date(event.date);
        const eventDay = eventDate.getDate();
        const eventMonth = eventDate.getMonth() + 1; // getMonth() is 0-indexed
        const eventYear = eventDate.getFullYear();

        // Check each filter only if it's provided
        if (day && eventDay !== parseInt(day as string)) return false;
        if (month && eventMonth !== parseInt(month as string)) return false;
        if (year && eventYear !== parseInt(year as string)) return false;

        return true;
      });
    }

    res.json(events);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Wishlist routes
app.get('/api/wishlist', authMiddleware, (req: Request, res: Response) => {
  try {
    const events = getWishlistEvents(req.userId!);
    res.json(events);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/wishlist/:eventId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;
    toggleWishlistEvent(req.userId!, parseInt(eventId), status || 'interested');
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/wishlist/:eventId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    removeWishlistEvent(req.userId!, parseInt(eventId));
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get users who also favorited the same event
app.get('/api/wishlist/:eventId/users', authMiddleware, (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const users = getUsersWhoAlsoFavorited(req.userId!, parseInt(eventId));
    res.json(users);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get users who also favorited the same event
app.get('/api/wishlist/:eventId/users', authMiddleware, (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const users = getUsersWhoAlsoFavorited(req.userId!, parseInt(eventId));
    res.json(users);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// File upload endpoint
app.post('/api/upload', authMiddleware, upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Matches endpoint - personalized with scoring
app.get('/api/matches', authMiddleware, (req: Request, res: Response) => {
  try {
    const matches = getPersonalizedMatches(req.userId!);
    res.json(matches);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Recommended events endpoint
app.get('/api/events/recommended', authMiddleware, (req: Request, res: Response) => {
  try {
    const events = getRecommendedEvents(req.userId!);
    res.json(events);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Artist recommendations endpoint
app.get('/api/artists/recommended', authMiddleware, (req: Request, res: Response) => {
  try {
    const artists = getArtistRecommendations(req.userId!);
    res.json(artists);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Chat endpoints
// Get unread messages for notifications
app.get('/api/chat/unread', authMiddleware, (req: Request, res: Response) => {
  try {
    const unread = getUnreadMessages(req.userId!);
    res.json(unread);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/chat/:matchId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const matchIdNum = parseInt(matchId);
    
    // Mark messages as read when opening the chat
    markMessagesAsRead(req.userId!, matchIdNum);
    
    const messages = getChatMessages(req.userId!, matchIdNum);
    res.json(messages);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/chat/:matchId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const numericMatchId = parseInt(matchId);

    // Spremi poruku korisnika - pravi chat bez AI odgovora
    sendChatMessage(req.userId!, numericMatchId, message);

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a single message (only sender can delete)
app.delete('/api/chat/message/:messageId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const deleted = deleteMessage(req.userId!, parseInt(messageId));
    if (!deleted) {
      return res.status(403).json({ error: 'Cannot delete this message' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete entire chat with a match
app.delete('/api/chat/:matchId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const deletedCount = deleteChat(req.userId!, parseInt(matchId));
    res.json({ success: true, deletedCount });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ TuneBuddy API running on http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
  process.exit(1);
});
