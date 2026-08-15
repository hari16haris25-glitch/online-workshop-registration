document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('footer');
  if (!el) return;
  el.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <img src="/images/logo.jpg" alt="PKIET Logo" />
            <strong style="color:#fff">PKIET</strong>
          </div>
          <p>Engineering the Future. Empowering the World.</p>
          <div class="social-row">
            <a href="#" aria-label="Facebook">f</a>
            <a href="https://instagram.com/YOUR_HANDLE" target="_blank" rel="noopener" aria-label="Instagram">ig</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="https://youtube.com/@YOUR_CHANNEL" target="_blank" rel="noopener" aria-label="YouTube">yt</a>
          </div>
        </div>
        <div>
          <h4>Event Coordinators</h4>
          <p>Prof. S. Arunkumar &mdash; +91 98841 64310</p>
          <p>Prof. R. Kavitha &mdash; +91 91234 56780</p>
        </div>
        <div>
          <h4>Contact Us</h4>
          <p>cse@pkiet.ac.in</p>
          <p>+91 94873 12345</p>
        </div>
        <div>
          <h4>Address</h4>
          <p>PKIET Campus, Karaikal &ndash; 609603, Puducherry, India</p>
        </div>
      </div>
      <div class="footer-bottom">&copy; 2025 PKIET CSE Tech Fest 2K25. All Rights Reserved.</div>
    </div>
  `;
});
