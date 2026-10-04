import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, initDb } from './db.js';
import { nextUniversityId } from './college/universityId.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const IS_PROD = process.env.NODE_ENV === 'production';

// JWT secret: إلزامي في الإنتاج
const JWT_SECRET = process.env.JWT_SECRET || (IS_PROD ? null : 'dev-only-secret-change-me');
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is required in production. Set it in Render Environment.');
  process.exit(1);
}

// كلمة مرور الحسابات الافتراضية (غيّرها من متغيرات البيئة)
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'College123!';

// قائمة مصادر CORS (مفصولة بفاصلة). الواجهة تُقدَّم من نفس الدومين فلا تحتاجها غالباً.
const ALLOWED_ORIGINS = (process.env.FRONTEND_ORIGIN || process.env.APP_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Render يعمل خلف proxy
app.set('trust proxy', 1);

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(
  cors({
    origin: (origin, cb) => {
      // طلبات نفس الدومين أو أدوات مثل curl لا ترسل Origin
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// تسجيل الطلبات (بدون ضجيج health checks)
app.use((req, res, next) => {
  if (req.method === 'HEAD') return next();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// DATABASE INITIALIZATION (تُنفَّذ مرة واحدة فقط حتى مع الطلبات المتزامنة)
// ============================================================================
let initPromise = null;

function ensureDbInitialized() {
  if (!initPromise) {
    initPromise = (async () => {
      await initDb();
      await bootstrapCollege();
    })().catch((err) => {
      console.error('Failed to initialize database:', err.message);
      initPromise = null; // اسمح بإعادة المحاولة
      throw err;
    });
  }
  return initPromise;
}

// ============================================================================
// BOOTSTRAP COLLEGE DATA
// ============================================================================
async function createUserIfMissing({ email, fullName, role, code, enrollmentYear }) {
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    console.log(`✅ ${fullName} already exists`);
    return;
  }
  const hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
  if (enrollmentYear) {
    await db
      .prepare(
        'INSERT INTO users (email, password_hash, full_name, role, person_code, university_id, enrollment_year, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING id'
      )
      .get(email, hash, fullName, role, code, code, enrollmentYear);
  } else {
    await db
      .prepare(
        'INSERT INTO users (email, password_hash, full_name, role, person_code, university_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW()) RETURNING id'
      )
      .get(email, hash, fullName, role, code, code);
  }
  console.log(`✅ ${fullName} created: ${email}`);
}

async function bootstrapCollege() {
  try {
    console.log('🌱 Starting college bootstrap...');
    await createUserIfMissing({
      email: 'dean@unipilot.local',
      fullName: 'Dean',
      role: 'dean',
      code: '0260000001',
    });
    await createUserIfMissing({
      email: 'student_affairs@unipilot.local',
      fullName: 'Student Affairs',
      role: 'student_affairs',
      code: '0260000002',
    });
    await createUserIfMissing({
      email: 'student@unipilot.local',
      fullName: 'Demo Student',
      role: 'student',
      code: '0260000003',
      enrollmentYear: 2026,
    });
    console.log('✅ College bootstrap completed');
  } catch (err) {
    console.error('❌ Bootstrap error:', err.message);
  }
}

// ============================================================================
// AUTH HELPERS
// ============================================================================
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', message: err.message });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
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

    let user;
    if (university_id) {
      user = await db
        .prepare(
          'SELECT id, email, password_hash, full_name, role, university_id, person_code FROM users WHERE university_id = ? OR person_code = ?'
        )
        .get(university_id, university_id);
    } else {
      user = await db
        .prepare(
          'SELECT id, email, password_hash, full_name, role, university_id, person_code FROM users WHERE email = ?'
        )
        .get(email);
    }

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, university_id: user.university_id },
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
        university_id: user.university_id,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    await ensureDbInitialized();
    const user = await db
      .prepare('SELECT id, email, full_name, role, university_id, person_code FROM users WHERE id = ?')
      .get(req.auth.id);

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

// ============================================================================
// USERS ROUTES (محمية: للعميد وشؤون الطلاب فقط)
// ============================================================================
app.get('/api/users', requireAuth, requireRole('dean', 'student_affairs'), async (req, res) => {
  try {
    await ensureDbInitialized();
    const users = await db
      .prepare('SELECT id, email, full_name, role, university_id, person_code FROM users ORDER BY created_at DESC')
      .all();
    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', requireAuth, requireRole('dean', 'student_affairs'), async (req, res) => {
  try {
    await ensureDbInitialized();
    const { email, password, full_name, role = 'student', university_id } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full_name are required' });
    }

    // فقط العميد يستطيع إنشاء حسابات بصلاحيات غير الطالب
    if (role !== 'student' && req.auth.role !== 'dean') {
      return res.status(403).json({ error: 'Only the dean can create non-student accounts' });
    }

    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const code = university_id || (await nextUniversityId());

    const result = await db
      .prepare(
        'INSERT INTO users (email, password_hash, full_name, role, person_code, university_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW()) RETURNING id, email, full_name, role, university_id'
      )
      .run(email, hash, full_name, role, code, code);

    res.status(201).json({ user: result });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ============================================================================
// HEALTH CHECK & API INFO
// ============================================================================
app.get('/health', async (req, res) => {
  try {
    await ensureDbInitialized();
    res.json({ status: 'ok', message: 'UniPilot API is running' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// كان سابقاً على "/" — نُقل إلى "/api" ليظهر الـ frontend على الرابط الرئيسي
app.get('/api', (req, res) => {
  res.json({
    name: 'UniPilot API',
    version: '3.0.0.1',
    status: 'running',
    endpoints: {
      auth: ['POST /api/auth/login (university_id or email + password)', 'GET /api/auth/me'],
      users: ['GET /api/users', 'POST /api/users'],
    },
  });
});

// ============================================================================
// SERVE FRONTEND (مجلد dist الناتج عن npm run build)
// ============================================================================
const distPath = path.join(__dirname, '..', 'dist');
const indexHtml = path.join(distPath, 'index.html');

if (fs.existsSync(indexHtml)) {
  app.use(express.static(distPath, { index: false, maxAge: IS_PROD ? '1h' : 0 }));

  // أي طلب GET ليس API يُرجع index.html (لدعم React Router)
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(indexHtml);
  });
  console.log('🖥️  Serving frontend from', distPath);
} else {
  console.warn('⚠️  dist/index.html not found — run "npm run build". Frontend will not be served.');
}

// ============================================================================
// ERROR HANDLING
// ============================================================================
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
  console.log(`🚀 UniPilot running on port ${PORT}`);
  ensureDbInitialized().catch(() => {});
});
