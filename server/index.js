import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, initDb } from './db.js';
import { nextUniversityId, formatUniversityId } from './college/universityId.js';

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || process.env.APP_URL || 'http://localhost:5173';

// ✅ CRITICAL FIX: Enable trust proxy for Render/production deployments
// This is required because Render sits behind a proxy and forwards X-Forwarded-For header
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Compression middleware (no-op for now)
let compressionMiddleware = (req, res, next) => next();
app.use(compressionMiddleware);

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initDb();
      await bootstrapCollege();
      dbInitialized = true;
    } catch (err) {
      console.error('Failed to initialize database:', err.message);
      throw err;
    }
  }
}

// ============================================================================
// BOOTSTRAP COLLEGE DATA
// ============================================================================
async function bootstrapCollege() {
  try {
    console.log('🌱 Starting college bootstrap...');

    // Create Dean user
    const deanEmail = 'dean@unipilot.local';
    const existingDean = await db.prepare('SELECT id FROM users WHERE email = ?').get(deanEmail);
    if (!existingDean) {
      const deanHash = bcrypt.hashSync('College123!', 10);
      const deanId = await db.prepare(
        'INSERT INTO users (email, password_hash, full_name, role, person_code, university_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW()) RETURNING id'
      ).get(deanEmail, deanHash, 'Dean', 'dean', '0260000001', '0260000001');
      console.log('✅ Dean created:', deanEmail);
    } else {
      console.log('✅ Dean already exists');
    }

    // Create Student Affairs user
    const staffEmail = 'student_affairs@unipilot.local';
    const existingStaff = await db.prepare('SELECT id FROM users WHERE email = ?').get(staffEmail);
    if (!existingStaff) {
      const staffHash = bcrypt.hashSync('College123!', 10);
      const staffId = await db.prepare(
        'INSERT INTO users (email, password_hash, full_name, role, person_code, university_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW()) RETURNING id'
      ).get(staffEmail, staffHash, 'Student Affairs', 'student_affairs', '0260000002', '0260000002');
      console.log('✅ Student Affairs created:', staffEmail);
    } else {
      console.log('✅ Student Affairs already exists');
    }

    // Create Demo Student user
    const studentEmail = 'student@unipilot.local';
    const existingStudent = await db.prepare('SELECT id FROM users WHERE email = ?').get(studentEmail);
    if (!existingStudent) {
      const studentHash = bcrypt.hashSync('College123!', 10);
      const studentUniversityId = '0260000003';
      const studentId = await db.prepare(
        'INSERT INTO users (email, password_hash, full_name, role, person_code, university_id, enrollment_year, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING id'
      ).get(studentEmail, studentHash, 'Demo Student', 'student', studentUniversityId, studentUniversityId, 2026);
      console.log('✅ Demo Student created:', studentEmail);
    } else {
      console.log('✅ Demo Student already exists');
    }

    console.log('✅ College bootstrap completed');
  } catch (err) {
    console.error('❌ Bootstrap error:', err.message);
  }
}

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

app.post('/api/auth/login', async (req, res) => {
  try {
    await ensureDbInitialized();
    const { university_id, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (!university_id && !email) {
      return res.status(400).json({ error: 'University ID or email is required' });
    }

    // Find user by university_id or email
    let user;
    if (university_id) {
      user = await db.prepare(
        'SELECT id, email, password_hash, full_name, role, university_id, person_code FROM users WHERE university_id = ? OR person_code = ?'
      ).get(university_id, university_id);
    } else {
      user = await db.prepare(
        'SELECT id, email, password_hash, full_name, role, university_id, person_code FROM users WHERE email = ?'
      ).get(email);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        university_id: user.university_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        university_id: user.university_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    await ensureDbInitialized();
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.prepare(
      'SELECT id, email, full_name, role, university_id, person_code FROM users WHERE id = ?'
    ).get(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Unauthorized', message: err.message });
  }
});

// ============================================================================
// USERS ROUTES
// ============================================================================

app.get('/api/users', async (req, res) => {
  try {
    await ensureDbInitialized();
    const users = await db.prepare(
      'SELECT id, email, full_name, role, university_id, person_code FROM users ORDER BY created_at DESC'
    ).all();
    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    await ensureDbInitialized();
    const { email, password, full_name, role = 'student', university_id } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full_name are required' });
    }

    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const person_code = university_id || await nextUniversityId();

    const result = await db.prepare(
      'INSERT INTO users (email, password_hash, full_name, role, person_code, university_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW()) RETURNING id, email, full_name, role, university_id'
    ).run(email, hash, full_name, role, person_code, university_id);

    res.status(201).json({ user: result });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user', message: err.message });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', async (req, res) => {
  try {
    await ensureDbInitialized();
    res.json({ status: 'ok', message: 'UniPilot API is running' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/', async (req, res) => {
  try {
    await ensureDbInitialized();
    res.json({
      name: 'UniPilot API',
      version: '3.0.0.1',
      status: 'running',
      endpoints: {
        auth: [
          'POST /api/auth/login (university_id or email + password)',
          'GET /api/auth/me'
        ],
        users: [
          'GET /api/users',
          'POST /api/users'
        ]
      },
      defaultCredentials: {
        student: {
          university_id: '0260000003',
          password: 'College123!'
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'API initialization failed', message: err.message });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 UniPilot API running at http://localhost:${PORT}`);
  console.log(`📝 Auth: POST /api/auth/login (university_id), GET /api/auth/me`);
  console.log(`👥 Users: GET/POST /api/users`);
  console.log(`🔐 Default login: university_id=0260000003, password=College123!`);
});
