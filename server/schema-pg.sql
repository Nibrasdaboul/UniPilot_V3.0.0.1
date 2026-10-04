-- UniPilot PostgreSQL Schema
-- Run automatically by initDb() on server start
-- Fixed: Added all required columns (updated_at, department_id, college_id, enrollment_year, avatar_url)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student', 'dean', 'student_affairs', 'teaching_staff', 'exams_office')),
  person_code TEXT UNIQUE,
  university_id TEXT UNIQUE,
  college_id INTEGER,
  department_id INTEGER,
  enrollment_year INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  terms_accepted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS catalog_courses (
  id SERIAL PRIMARY KEY,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT,
  credit_hours INTEGER NOT NULL DEFAULT 3,
  "order" INTEGER NOT NULL DEFAULT 1,
  prerequisite_id INTEGER REFERENCES catalog_courses(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_courses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catalog_course_id INTEGER REFERENCES catalog_courses(id),
  course_name TEXT NOT NULL,
  course_code TEXT NOT NULL,
  credit_hours INTEGER NOT NULL DEFAULT 3,
  semester TEXT DEFAULT 'Spring 2026',
  difficulty INTEGER DEFAULT 5,
  target_grade REAL DEFAULT 85,
  professor_name TEXT,
  description TEXT,
  current_grade REAL,
  progress REAL DEFAULT 0,
  finalized_at TIMESTAMPTZ,
  passed INTEGER,
  semester_id INTEGER,
  withdrawn INTEGER NOT NULL DEFAULT 0,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, catalog_course_id)
);

CREATE INDEX IF NOT EXISTS idx_student_courses_user ON student_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_catalog ON student_courses(catalog_course_id);
CREATE INDEX IF NOT EXISTS idx_catalog_order ON catalog_courses("order");
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_person_code ON users(person_code);
CREATE INDEX IF NOT EXISTS idx_users_university_id ON users(university_id);

CREATE TABLE IF NOT EXISTS grade_items (
  id SERIAL PRIMARY KEY,
  student_course_id INTEGER NOT NULL REFERENCES student_courses(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'quiz',
  title TEXT NOT NULL,
  score REAL NOT NULL DEFAULT 0,
  max_score REAL NOT NULL DEFAULT 100,
  weight REAL NOT NULL DEFAULT 0,
  from_scheme INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_grade_items_student_course ON grade_items(student_course_id);

CREATE TABLE IF NOT EXISTS catalog_grade_items (
  id SERIAL PRIMARY KEY,
  catalog_course_id INTEGER NOT NULL REFERENCES catalog_courses(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'quiz',
  title TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 0,
  max_score REAL DEFAULT 100,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_catalog_grade_items_course ON catalog_grade_items(catalog_course_id);

CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_course_id INTEGER REFERENCES student_courses(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'student' CHECK (type IN ('student', 'app')),
  note_category TEXT,
  ref_id INTEGER,
  ref_type TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_type ON notes(type);

CREATE TABLE IF NOT EXISTS student_academic_record (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  cgpa REAL DEFAULT 0,
  cumulative_percent REAL DEFAULT 0,
  total_credits_completed REAL DEFAULT 0,
  total_credits_carried REAL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_student_academic_record_user ON student_academic_record(user_id);
