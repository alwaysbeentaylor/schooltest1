// VBS Sint-Maarten - Gedeelde Componenten (Header & Footer)

// ===== NAVIGATION CONFIGURATION =====
const navigationConfig = {
  pages: [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'Onze School' },
    { href: 'enroll.html', label: 'Inschrijven' },
    { href: 'news.html', label: 'Nieuws' },
    { href: 'calendar.html', label: 'Agenda' },
    { href: 'info.html', label: 'Info' },
    { href: 'ouderwerkgroep.html', label: 'Ouderwerkgroep' },
    { href: 'gallery.html', label: 'Foto\'s' },
    { href: 'contact.html', label: 'Contact' }
  ],
  cta: { href: 'box.html', label: '⭐ Box', mobileLabel: '⭐ Belevingsbox Aanvragen' }
};

// ===== GET CURRENT PAGE =====
function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  return page;
}

// ===== RENDER NAVIGATION =====
function renderNavigation() {
  const currentPage = getCurrentPage();
  
  const navLinks = navigationConfig.pages.map(page => {
    const isActive = page.href === currentPage || (currentPage === '' && page.href === 'index.html');
    return `
      <a href="${page.href}" class="nav-link ${isActive ? 'active' : ''}">${page.label}</a>
    `;
  }).join('');
  
  const mobileNavLinks = navigationConfig.pages.map(page => {
    const isActive = page.href === currentPage || (currentPage === '' && page.href === 'index.html');
    return `
      <a href="${page.href}" class="nav-link ${isActive ? 'active' : ''}">${page.label}</a>
    `;
  }).join('');
  
  return `
    <nav class="navbar">
      <div class="navbar-container">
        <a href="index.html" class="navbar-brand">
          <div class="navbar-logo">
            <img src="/images/logo.png" alt="VBS Sint-Maarten Logo">
          </div>
          <div>
            <h1 class="navbar-title">Sint-Maarten</h1>
            <p class="navbar-subtitle">Vrije Basisschool Sijsele</p>
          </div>
        </a>
        
        <div class="navbar-menu">
          ${navLinks}
          <a href="${navigationConfig.cta.href}" class="nav-cta">${navigationConfig.cta.label}</a>
        </div>
        
        <button class="mobile-menu-btn">
          <div class="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
      
      <div class="mobile-menu">
        ${mobileNavLinks}
        <a href="${navigationConfig.cta.href}" class="nav-cta">${navigationConfig.cta.mobileLabel}</a>
      </div>
    </nav>
  `;
}

// ===== RENDER FOOTER =====
function renderFooter() {
  return `
    <footer class="footer">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <img src="/images/logo.png" alt="VBS Sint-Maarten">
            <h3>VBS Sint-Maarten</h3>
          </div>
          <p class="footer-text">
            Een school met een hart voor elk kind.<br>
            Samen groeien, samen leren, samen leven.
          </p>
          <div class="social-links">
            <a href="https://www.facebook.com/vrijebasisschool.sintmaarten" target="_blank" rel="noreferrer">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/vbs_sintmaarten_sijsele/" target="_blank" rel="noreferrer">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>
        
        <div>
          <h3>Contact</h3>
          <ul class="footer-contact">
            <li>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Kloosterstraat 4a, 8340 Sijsele
            </li>
            <li>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              info@vrijebasisschoolsijsele.be
            </li>
            <li>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Kloosterstraat: 050 36 32 25
            </li>
            <li>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Hovingenlaan: 050 36 09 71
            </li>
            <li>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              GSM: 0496 23 57 01
            </li>
          </ul>
        </div>
        
        <div>
          <h3>Snel naar</h3>
          <ul>
            <li><a href="calendar.html">Kalender</a></li>
            <li><a href="info.html">Praktische Info</a></li>
            <li><a href="enroll.html">Inschrijven</a></li>
            <li><a href="ouderwerkgroep.html">Ouderwerkgroep</a></li>
            <li><a href="gallery.html">Fotogalerij</a></li>
          </ul>
        </div>
        
        <div>
          <h3>Admin</h3>
          <a href="../index.html" class="admin-btn">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Inloggen Beheerder
          </a>
        </div>
      </div>
      
      <div class="footer-bottom">
        <span>&copy; 2025 VBS Sint-Maarten Sijsele</span>
      </div>
    </footer>
  `;
}

// ===== RENDER ACCESSIBILITY BUTTON =====
function renderAccessibilityButton() {
  return `
    <button class="accessibility-btn" onclick="toggleLargeText()" title="Groot lettertype">
      <span>A</span>
    </button>
  `;
}

// ===== INITIALIZE COMPONENTS =====
function initComponents() {
  // Inject navigation at the beginning of body
  const navPlaceholder = document.querySelector('[data-nav]');
  if (navPlaceholder) {
    navPlaceholder.outerHTML = renderNavigation();
  } else {
    // If no placeholder, insert at the start of body
    document.body.insertAdjacentHTML('afterbegin', renderNavigation());
  }
  
  // Inject footer before closing body tag
  const footerPlaceholder = document.querySelector('[data-footer]');
  if (footerPlaceholder) {
    footerPlaceholder.outerHTML = renderFooter();
  } else {
    // If no placeholder, insert before scripts
    const scripts = document.querySelectorAll('script[src]');
    if (scripts.length > 0) {
      scripts[0].insertAdjacentHTML('beforebegin', renderFooter());
    } else {
      document.body.insertAdjacentHTML('beforeend', renderFooter());
    }
  }
  
  // Inject accessibility button
  const accPlaceholder = document.querySelector('[data-accessibility]');
  if (accPlaceholder) {
    accPlaceholder.outerHTML = renderAccessibilityButton();
  } else {
    document.body.insertAdjacentHTML('beforeend', renderAccessibilityButton());
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initComponents);
} else {
  initComponents();
}

