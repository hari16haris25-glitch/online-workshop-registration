require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

require('./db/database'); // initializes DB + seeds default admin

const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'pkiet-cse-techfest-2k25-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4 hours
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`PKIET Event Portal running at http://localhost:${PORT}`);
});
