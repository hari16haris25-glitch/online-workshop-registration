const path = require('path');
const bcrypt = require('bcryptjs');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(path.join(__dirname, 'pkiet_registrations.db'));
db.exec('PRAGMA journal_mode = WAL');

// ---------- Schema ----------
db.exec(`
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration_id TEXT UNIQUE NOT NULL,
  event_category TEXT NOT NULL,      -- Workshop / Technical / Cultural
  event_name TEXT NOT NULL,          -- e.g. AI & Machine Learning Workshop, Code Sprint, Group Dance
  sub_type TEXT,                     -- Solo / Duo / Team (technical & cultural)
  college_name TEXT NOT NULL,
  team_name TEXT,
  participant_names TEXT NOT NULL,   -- JSON array
  mobile_number TEXT NOT NULL,
  email TEXT NOT NULL,
  num_participants INTEGER NOT NULL,
  payment_screenshot TEXT,
  audio_file TEXT,                   -- performance sample for Solo Singing / Solo Dance / Group Dance
  registration_date TEXT NOT NULL,
  registration_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending / Approved / Rejected
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
`);

// ---------- Migration: add audio_file to any registrations table created
// before this column existed (CREATE TABLE IF NOT EXISTS above won't add it
// to an already-existing table). Safe to run every startup.
const existingColumns = db.prepare(`PRAGMA table_info(registrations)`).all().map(c => c.name);
if (!existingColumns.includes('audio_file')) {
  db.exec('ALTER TABLE registrations ADD COLUMN audio_file TEXT');
  console.log('Migrated: added audio_file column to registrations table.');
}

// Seed a default admin (username: admin / password: pkiet@2025) if none exists
const adminCount = db.prepare('SELECT COUNT(*) AS c FROM admins').get().c;
if (adminCount === 0) {
  const hash = bcrypt.hashSync('pkiet@2025', 10);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);
  console.log('Seeded default admin -> username: admin | password: pkiet@2025 (change this after first login)');
}

module.exports = db;
