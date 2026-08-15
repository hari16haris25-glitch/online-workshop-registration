const TABLE_HEADERS = ['Reg. ID', 'Event Category', 'Event Name', 'College', 'Participant / Team', 'Mobile', 'Status', 'Date', 'Actions'];
let currentCategory = 'All';
let currentView = 'dashboard';

async function checkSession() {
  const res = await fetch('/api/admin/session');
  const data = await res.json();
  if (!data.loggedIn) location.href = '/admin-login.html';
}

function animateCount(el, to) {
  const from = parseInt(el.textContent, 10) || 0;
  if (from === to) { el.textContent = to; return; }
  const duration = 500;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = to;
  }
  requestAnimationFrame(tick);
}

async function loadStats() {
  const res = await fetch('/api/admin/stats');
  const s = await res.json();
  animateCount(document.getElementById('statTotal'), s.total);
  animateCount(document.getElementById('statWorkshop'), s.workshop);
  animateCount(document.getElementById('statTechnical'), s.technical);
  animateCount(document.getElementById('statCultural'), s.cultural);
  animateCount(document.getElementById('statPending'), s.pending);
  animateCount(document.getElementById('statApproved'), s.approved);
}

function renderTableHead(tableId) {
  const thead = document.querySelector(`#${tableId} thead`);
  thead.innerHTML = '<tr>' + TABLE_HEADERS.map(h => `<th>${h}</th>`).join('') + '</tr>';
}

function renderRows(tableId, rows) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="${TABLE_HEADERS.length}" class="table-empty">No registrations found.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td><strong>${r.registration_id}</strong></td>
      <td>${r.event_category}${r.sub_type ? ' (' + r.sub_type + ')' : ''}</td>
      <td>${r.event_name}</td>
      <td>${r.college_name}</td>
      <td>${r.participant_names.join(', ')}</td>
      <td>${r.mobile_number}</td>
      <td><span class="badge ${r.status}">${r.status}</span></td>
      <td>${r.registration_date}</td>
      <td>
        <div class="row-actions">
          ${r.audio_file ? `<a class="icon-btn" title="Listen to performance audio" href="${r.audio_file}" target="_blank" rel="noopener">&#127925;</a>` : ''}
          <button class="icon-btn" title="Edit" onclick="openEdit('${r.registration_id}')">&#9998;</button>
          <button class="icon-btn" title="Approve" onclick="quickStatus('${r.registration_id}','Approved')">&#10003;</button>
          <button class="icon-btn danger" title="Delete" onclick="deleteReg('${r.registration_id}')">&#128465;</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function loadRecent() {
  renderTableHead('recentTable');
  const res = await fetch('/api/admin/registrations');
  const rows = (await res.json()).slice(0, 6);
  renderRows('recentTable', rows);
}

async function loadRegistrations() {
  renderTableHead('regTable');
  const search = document.getElementById('searchInput').value.trim();
  const status = document.getElementById('statusFilter').value;
  const q = new URLSearchParams({ search, status, category: currentCategory });
  const res = await fetch('/api/admin/registrations?' + q.toString());
  const rows = await res.json();
  renderRows('regTable', rows);
  document.getElementById('regPanelTitle').textContent =
    currentCategory === 'All' ? 'All Registrations' : currentCategory + ' Registrations';
}

async function quickStatus(id, status) {
  const res = await fetch(`/api/admin/registrations/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    showToast(data.error || 'Failed to update status', 'error');
    return;
  }
  showToast(statusUpdateMessage(status, data));
  refreshCurrentView();
}

function statusUpdateMessage(status, data) {
  if (status !== 'Approved' || data.emailSent === null || data.emailSent === undefined) {
    return 'Status updated to ' + status;
  }
  return data.emailSent
    ? 'Status updated to Approved — confirmation email sent'
    : 'Status updated to Approved — email not sent (' + (data.emailReason || 'check server logs') + ')';
}

async function deleteReg(id) {
  if (!confirm(`Delete registration ${id}? This cannot be undone.`)) return;
  const res = await fetch(`/api/admin/registrations/${id}`, { method: 'DELETE' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    showToast(data.error || 'Failed to delete registration', 'error');
    return;
  }
  showToast('Registration deleted');
  refreshCurrentView();
}

function openEdit(id) {
  fetch('/api/admin/registrations?search=' + id).then(r => r.json()).then(rows => {
    const r = rows.find(x => x.registration_id === id) || rows[0];
    if (!r) return;
    document.getElementById('editRegId').value = r.registration_id;
    document.getElementById('editRegIdDisplay').value = r.registration_id;
    document.getElementById('editCollege').value = r.college_name;
    document.getElementById('editEventName').value = r.event_name;
    document.getElementById('editMobile').value = r.mobile_number;
    document.getElementById('editEmail').value = r.email;
    document.getElementById('editStatus').value = r.status;
    document.getElementById('editOverlay').classList.add('show');
  });
}

document.getElementById('cancelEdit').addEventListener('click', () => {
  document.getElementById('editOverlay').classList.remove('show');
});

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editRegId').value;
  const chosenStatus = document.getElementById('editStatus').value;
  const res = await fetch(`/api/admin/registrations/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collegeName: document.getElementById('editCollege').value,
      eventName: document.getElementById('editEventName').value,
      mobileNumber: document.getElementById('editMobile').value,
      email: document.getElementById('editEmail').value,
      status: chosenStatus
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    showToast(data.error || 'Failed to update registration', 'error');
    return;
  }
  document.getElementById('editOverlay').classList.remove('show');
  showToast(statusUpdateMessage(chosenStatus, data));
  refreshCurrentView();
});

function refreshCurrentView() {
  loadStats();
  if (currentView === 'dashboard') loadRecent();
  else loadRegistrations();
}

// ---------- Sidebar navigation ----------
document.querySelectorAll('.side-link[data-view]').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.side-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    currentView = link.dataset.view;
    currentCategory = link.dataset.cat || 'All';

    const isDashboard = currentView === 'dashboard';
    document.getElementById('dashboardView').style.display = isDashboard ? 'block' : 'none';
    document.getElementById('registrationsView').style.display = isDashboard ? 'none' : 'block';
    document.getElementById('searchBoxWrap').style.display = isDashboard ? 'none' : 'flex';
    document.getElementById('viewTitle').textContent = isDashboard ? 'Dashboard Overview' : 'Registration Management';

    refreshCurrentView();
  });
});

document.getElementById('searchInput')?.addEventListener('input', debounce(loadRegistrations, 300));
document.getElementById('statusFilter')?.addEventListener('change', loadRegistrations);

document.getElementById('exportBtn').addEventListener('click', () => {
  window.location.href = '/api/admin/export';
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  location.href = '/admin-login.html';
});

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ---------- Init ----------
checkSession().then(() => { loadStats(); loadRecent(); });
