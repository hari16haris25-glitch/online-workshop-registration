const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');

const router = express.Router();

// ---------- Multer (payment screenshot + performance audio uploads) ----------
const paymentsDir = path.join(__dirname, '..', 'public', 'uploads', 'payments');
const audioDir = path.join(__dirname, '..', 'public', 'uploads', 'audio');
[paymentsDir, audioDir].forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.fieldname === 'audioFile' ? audioDir : paymentsDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.webp'];
const AUDIO_EXT = ['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.webm'];

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB — covers short audio clips as well as screenshots
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'audioFile') {
      const ok = AUDIO_EXT.includes(ext);
      return cb(ok ? null : new Error('Only audio files (mp3, wav, m4a, ogg, aac) are allowed'), ok);
    }
    const ok = IMAGE_EXT.includes(ext);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  }
});

const uploadFields = upload.fields([
  { name: 'paymentScreenshot', maxCount: 1 },
  { name: 'audioFile', maxCount: 1 }
]);

const PREFIX = { Workshop: 'WS', Technical: 'TE', Cultural: 'CE' };

function nextRegistrationId(category) {
  const prefix = PREFIX[category] || 'EV';
  const row = db.prepare(
    `SELECT COUNT(*) AS c FROM registrations WHERE event_category = ?`
  ).get(category);
  const seq = 1001 + row.c;
  return `PKIET2K25${prefix}${seq}`;
}

// ---------- POST /api/register ----------
router.post('/register', uploadFields, (req, res) => {
  try {
    const {
      eventCategory, eventName, subType, collegeName, teamName,
      mobileNumber, email, numParticipants
    } = req.body;

    const requiredFields = { eventCategory, eventName, collegeName, mobileNumber, email, numParticipants };
    const missing = Object.entries(requiredFields)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
    }

    // participantNames[] arrives as repeated form fields or a JSON string
    let participants = req.body.participantNames || [];
    if (!Array.isArray(participants)) participants = [participants];
    participants = participants.filter(Boolean);

    const registrationId = nextRegistrationId(eventCategory);
    const now = new Date();
    const registrationDate = now.toISOString().slice(0, 10);
    const registrationTime = now.toTimeString().slice(0, 8);

    const paymentFile = req.files?.paymentScreenshot?.[0];
    const audioFile = req.files?.audioFile?.[0];
    const screenshotPath = paymentFile ? `/uploads/payments/${paymentFile.filename}` : null;
    const audioPath = audioFile ? `/uploads/audio/${audioFile.filename}` : null;

    db.prepare(`
      INSERT INTO registrations
        (registration_id, event_category, event_name, sub_type, college_name, team_name,
         participant_names, mobile_number, email, num_participants, payment_screenshot,
         audio_file, registration_date, registration_time, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `).run(
      registrationId, eventCategory, eventName, subType || null, collegeName, teamName || null,
      JSON.stringify(participants), mobileNumber, email, Number(numParticipants), screenshotPath,
      audioPath, registrationDate, registrationTime
    );

    res.json({ success: true, registrationId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

module.exports = router;
