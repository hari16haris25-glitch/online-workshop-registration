const express = require('express');
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');
const db = require('../db/database');
const { requireAdmin } = require('../middleware/auth');
const { sendConfirmationEmail } = require('../utils/mailer');

const router = express.Router();

// ---------- POST /api/admin/login ----------
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password || '', admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  req.session.isAdmin = true;
  req.session.username = admin.username;
  res.json({ success: true, username: admin.username });
});

// ---------- POST /api/admin/logout ----------
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// ---------- GET /api/admin/session ----------
router.get('/session', (req, res) => {
  res.json({ loggedIn: !!(req.session && req.session.isAdmin), username: req.session.username || null });
});

// ---------- GET /api/admin/stats ----------
router.get('/stats', requireAdmin, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) c FROM registrations').get().c;
  const workshop = db.prepare(`SELECT COUNT(*) c FROM registrations WHERE event_category='Workshop'`).get().c;
  const technical = db.prepare(`SELECT COUNT(*) c FROM registrations WHERE event_category='Technical'`).get().c;
  const cultural = db.prepare(`SELECT COUNT(*) c FROM registrations WHERE event_category='Cultural'`).get().c;
  const pending = db.prepare(`SELECT COUNT(*) c FROM registrations WHERE status='Pending'`).get().c;
  const approved = db.prepare(`SELECT COUNT(*) c FROM registrations WHERE status='Approved'`).get().c;
  res.json({ total, workshop, technical, cultural, pending, approved });
});

// ---------- GET /api/admin/registrations ----------
router.get('/registrations', requireAdmin, (req, res) => {
  const { search = '', category = 'All', status = 'All' } = req.query;
  let query = 'SELECT * FROM registrations WHERE 1=1';
  const params = [];

  if (category !== 'All') { query += ' AND event_category = ?'; params.push(category); }
  if (status !== 'All') { query += ' AND status = ?'; params.push(status); }
  if (search) {
    query += ' AND (registration_id LIKE ? OR college_name LIKE ? OR event_name LIKE ? OR participant_names LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  query += ' ORDER BY id DESC';

  const rows = db.prepare(query).all(...params).map(r => ({
    ...r,
    participant_names: JSON.parse(r.participant_names)
  }));
  res.json(rows);
});

// ---------- PUT /api/admin/registrations/:id ----------
router.put('/registrations/:id', requireAdmin, async (req, res) => {
  try {
    const {
      status = null, collegeName = null, mobileNumber = null, email = null,
      eventName = null, eventCategory = null, numParticipants = null
    } = req.body;
    const existing = db.prepare('SELECT * FROM registrations WHERE registration_id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Registration not found' });

    db.prepare(`
      UPDATE registrations SET
        status = COALESCE(?, status),
        college_name = COALESCE(?, college_name),
        mobile_number = COALESCE(?, mobile_number),
        email = COALESCE(?, email),
      event_name = COALESCE(?, event_name),
      event_category = COALESCE(?, event_category),
      num_participants = COALESCE(?, num_participants)
    WHERE registration_id = ?
  `).run(status, collegeName, mobileNumber, email, eventName, eventCategory, numParticipants, req.params.id);

    const justApproved = status === 'Approved' && existing.status !== 'Approved';
    let emailResult = null;

    if (justApproved) {
      const updated = db.prepare('SELECT * FROM registrations WHERE registration_id = ?').get(req.params.id);
      emailResult = await sendConfirmationEmail(updated);
    }

    res.json({ success: true, emailSent: emailResult?.sent ?? null, emailReason: emailResult?.reason });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update registration' });
  }
});

// ---------- DELETE /api/admin/registrations/:id ----------
router.delete('/registrations/:id', requireAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM registrations WHERE registration_id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Registration not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete registration' });
  }
});

// ---------- GET /api/admin/export (Excel) ----------
router.get('/export', requireAdmin, async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheets = {
    Workshop: null, 'Technical Solo': null, 'Technical Duo': null, 'Technical Team': null,
    'Solo Dance': null, 'Group Dance': null, 'Solo Singing': null,
    'Fashion Show Solo': null, 'Fashion Show Team': null
  };
  const headers = ['Registration ID', 'Event Category', 'Event Name', 'College Name',
    'Participant Name(s)', 'Mobile Number', 'Email', 'Number of Participants',
    'Payment Screenshot', 'Audio File', 'Registration Date', 'Registration Time', 'Status'];

  Object.keys(sheets).forEach(name => {
    const sheet = workbook.addWorksheet(name);
    sheet.addRow(headers).font = { bold: true };
    sheets[name] = sheet;
  });

  const rows = db.prepare('SELECT * FROM registrations ORDER BY id ASC').all();
  rows.forEach(r => {
    let sheetName = r.event_category;
    if (r.event_category === 'Technical' && r.sub_type) sheetName = `Technical ${r.sub_type}`;
    if (r.event_category === 'Cultural') sheetName = r.event_name;
    const sheet = sheets[sheetName] || sheets['Workshop'];
    sheet.addRow([
      r.registration_id, r.event_category, r.event_name, r.college_name,
      JSON.parse(r.participant_names).join(', '), r.mobile_number, r.email,
      r.num_participants, r.payment_screenshot || '', r.audio_file || '', r.registration_date,
      r.registration_time, r.status
    ]);
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=PKIET_Event_Registrations.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = router;
