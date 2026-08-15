const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const EVENT_NAME = process.env.EVENT_NAME || 'PKIET CSE Tech Fest 2K25';

let transporter = null;
let configWarningShown = false;

function getTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    if (!configWarningShown) {
      console.warn(
        '[mailer] GMAIL_USER / GMAIL_APP_PASSWORD not set in .env — confirmation emails will be skipped. ' +
        'See README.md for setup instructions.'
      );
      configWarningShown = true;
    }
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD }
    });
  }
  return transporter;
}

function buildConfirmationEmail(registration) {
  const participants = JSON.parse(registration.participant_names || '[]');
  const greetingName = participants[0] || registration.college_name;

  const subject = `Registration Confirmed — ${registration.event_name} | ${EVENT_NAME}`;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2B2D33;">
    <div style="background: linear-gradient(135deg, #16265C, #1E3A8A); padding: 28px 32px; border-radius: 12px 12px 0 0;">
      <h1 style="color: #fff; font-size: 20px; margin: 0;">${EVENT_NAME}</h1>
    </div>
    <div style="border: 1px solid #E3E6EF; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
      <p>Hi ${greetingName},</p>
      <p>Your registration has been <strong style="color: #10B981;">confirmed and approved</strong>. Here are your details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 6px 0; color: #6B7280;">Registration ID</td><td style="padding: 6px 0; font-weight: 700;">${registration.registration_id}</td></tr>
        <tr><td style="padding: 6px 0; color: #6B7280;">Event</td><td style="padding: 6px 0; font-weight: 700;">${registration.event_name}</td></tr>
        <tr><td style="padding: 6px 0; color: #6B7280;">Category</td><td style="padding: 6px 0;">${registration.event_category}${registration.sub_type ? ' (' + registration.sub_type + ')' : ''}</td></tr>
        <tr><td style="padding: 6px 0; color: #6B7280;">College</td><td style="padding: 6px 0;">${registration.college_name}</td></tr>
      </table>
      <p>Please keep your Registration ID handy — you may be asked for it at check-in.</p>
      <p style="margin-top: 28px; color: #6B7280; font-size: 13px;">
        Questions? Reach out to the event coordinators at cse@pkiet.ac.in.
      </p>
    </div>
  </div>`;

  const text = `Hi ${greetingName},\n\nYour registration has been confirmed and approved.\n\nRegistration ID: ${registration.registration_id}\nEvent: ${registration.event_name}\nCategory: ${registration.event_category}${registration.sub_type ? ' (' + registration.sub_type + ')' : ''}\nCollege: ${registration.college_name}\n\nPlease keep your Registration ID handy for check-in.\n\nQuestions? cse@pkiet.ac.in`;

  return { subject, html, text };
}

/**
 * Sends a confirmation email for an approved registration.
 * Never throws — returns { sent: boolean, reason?: string } so the caller
 * (the approve action) can succeed even if email sending fails.
 */
async function sendConfirmationEmail(registration) {
  const t = getTransporter();
  if (!t) return { sent: false, reason: 'Email not configured (missing GMAIL_USER/GMAIL_APP_PASSWORD in .env)' };
  if (!registration.email) return { sent: false, reason: 'Registration has no email address on file' };

  const { subject, html, text } = buildConfirmationEmail(registration);

  try {
    await t.sendMail({
      from: `"${EVENT_NAME}" <${GMAIL_USER}>`,
      to: registration.email,
      subject, html, text
    });
    return { sent: true };
  } catch (err) {
    console.error('[mailer] Failed to send confirmation email:', err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendConfirmationEmail };
