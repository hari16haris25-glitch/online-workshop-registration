// ---------- Mobile nav toggle ----------
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) toggle.addEventListener('click', () => links.classList.toggle('open'));

  // ---------- Fade-in on scroll (staggered within each grid) ----------
  document.querySelectorAll('.card-grid, .footer-grid').forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      if (child.classList.contains('fade-in')) child.style.setProperty('--fade-delay', `${Math.min(i, 6) * 0.08}s`);
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

  // ---------- Button ripple effect ----------
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 550);
  });

  // ---------- Smooth page-leave transition on internal navigation ----------
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || link.target === '_blank') return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => { window.location.href = href; }, 220);
  });
});

// ---------- Toast ----------
function showToast(message, type = 'info') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'toast' + (type === 'error' ? ' error' : '');
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ---------- Dynamic participant name fields ----------
function renderParticipantFields(containerId, count) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    const div = document.createElement('div');
    div.className = 'field fade-in visible';
    div.style.setProperty('--fade-delay', `${i * 0.05}s`);
    div.innerHTML = `
      <label>Participant ${i} Name ${i === 1 ? '' : '(optional)'}</label>
      <input type="text" name="participantNames" placeholder="Enter participant name" ${i === 1 ? 'required' : ''} />
    `;
    container.appendChild(div);
  }
}

// ---------- Success dialog ----------
function showSuccessDialog(registrationId) {
  const overlay = document.getElementById('successOverlay');
  document.getElementById('regIdText').textContent = registrationId;
  overlay.classList.add('show');
  playSuccessChime();
}

// ---------- Success chime ----------
// Played right when the registration-success popup appears. Wrapped in a
// catch because some browsers block audio playback until the user has
// interacted with the page — harmless to skip if that happens.
function playSuccessChime() {
  try {
    const audio = new Audio('/audio/success-chime.wav');
    audio.volume = 0.55;
    audio.play().catch(() => { /* autoplay blocked — fail silently */ });
  } catch (err) { /* ignore */ }
}

// ---------- Generic registration form submit ----------
async function submitRegistrationForm(formEl, submitBtn) {
  const original = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';

  try {
    const formData = new FormData(formEl);
    const res = await fetch('/api/register', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Registration failed');

    showSuccessDialog(data.registrationId);
    formEl.reset();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = original;
  }
}

// ---------- File drop label update ----------
function bindFileDrop(inputId, labelId) {
  const input = document.getElementById(inputId);
  const label = document.getElementById(labelId);
  if (!input || !label) return;
  input.addEventListener('change', () => {
    label.textContent = input.files.length ? input.files[0].name : 'Choose File — No file chosen';
    label.style.animation = 'none';
    requestAnimationFrame(() => { label.style.animation = 'badge-in .3s ease'; });
  });
}
