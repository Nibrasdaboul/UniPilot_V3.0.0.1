import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db, initDb } from './db.js';

await initDb();

const adminPassword = 'Admin123!';
const studentPassword = 'Student123!';
const collegePassword = 'College123!';

const adminHash = bcrypt.hashSync(adminPassword, 10);
const studentHash = bcrypt.hashSync(studentPassword, 10);
const collegeHash = bcrypt.hashSync(collegePassword, 10);

async function seed() {
  const users = [
    ['admin@unipilot.local', adminHash, 'Admin User', 'admin', '0260000001', '0260000001'],
    ['student@unipilot.local', studentHash, 'Demo Student', 'student', '0260000003', '0260000003'],
    ['dean@unipilot.local', collegeHash, 'Dean', 'dean', '0260000002', '0260000002'],
  ];
  
  for (const [email, hash, name, role, person_code, university_id] of users) {
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!existing) {
      await db.prepare(
        'INSERT INTO users (email, password_hash, full_name, role, person_code, university_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW())'
      ).run(email, hash, name, role, person_code, university_id);
      console.log(`✅ Created: ${name} (${email})`);
    } else {
      console.log(`⚠️  Already exists: ${email}`);
    }
  }
}

await seed();
console.log('');
console.log('🌱 Seeded users:');
console.log('  Admin:       admin@unipilot.local / Admin123!');
console.log('  Student:     student@unipilot.local / Student123!');
console.log('  Dean:        dean@unipilot.local / College123!');
console.log('');
console.log('📝 Login via university_id:');
console.log('  university_id: 0260000003, password: College123!');
console.log('');
process.exit(0);
