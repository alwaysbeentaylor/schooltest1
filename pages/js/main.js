// VBS Sint-Maarten - Gedeelde JavaScript

// ===== MOBILE MENU =====
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      this.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });
    
    // Close menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }
});

// ===== LARGE TEXT MODE =====
function toggleLargeText() {
  document.body.classList.toggle('large-text-mode');
  const isLarge = document.body.classList.contains('large-text-mode');
  localStorage.setItem('largeTextMode', isLarge);
  
  const btn = document.querySelector('.accessibility-btn span');
  if (btn) {
    btn.style.fontSize = isLarge ? '1.5rem' : '1rem';
  }
}

// Check saved preference on load
document.addEventListener('DOMContentLoaded', function() {
  const isLarge = localStorage.getItem('largeTextMode') === 'true';
  if (isLarge) {
    document.body.classList.add('large-text-mode');
    const btn = document.querySelector('.accessibility-btn span');
    if (btn) {
      btn.style.fontSize = '1.5rem';
    }
  }
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ===== FORM HANDLING =====
function handleFormSubmit(event, formType) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Show success message
  alert('Bedankt! We nemen spoedig contact op.');
  form.reset();
  
  // In a real application, you would send this data to a server
  console.log(`${formType} form submitted:`, Object.fromEntries(formData));
  
  return false;
}

// ===== GOOGLE CALENDAR =====
function addToGoogleCalendar(title, date, description) {
  const startTime = date.replace(/-/g, '') + 'T090000Z';
  const endTime = date.replace(/-/g, '') + 'T170000Z';
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(description || '')}&location=VBS Sint-Maarten`;
  window.open(url, '_blank');
}

// ===== HERO CAROUSEL =====
class HeroCarousel {
  constructor(container) {
    this.container = container;
    this.images = container.querySelectorAll('.hero-slide');
    this.dots = container.querySelectorAll('.hero-dot');
    this.currentIndex = 0;
    this.interval = null;
    
    this.init();
  }
  
  init() {
    if (this.images.length <= 1) return;
    
    // Start auto-rotation
    this.startAutoPlay();
    
    // Add click handlers to dots
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goTo(index);
        this.resetAutoPlay();
      });
    });
  }
  
  goTo(index) {
    this.images[this.currentIndex].classList.remove('active');
    this.dots[this.currentIndex].classList.remove('active');
    
    this.currentIndex = index;
    
    this.images[this.currentIndex].classList.add('active');
    this.dots[this.currentIndex].classList.add('active');
  }
  
  next() {
    const nextIndex = (this.currentIndex + 1) % this.images.length;
    this.goTo(nextIndex);
  }
  
  startAutoPlay() {
    this.interval = setInterval(() => this.next(), 5000);
  }
  
  resetAutoPlay() {
    clearInterval(this.interval);
    this.startAutoPlay();
  }
}

// Initialize carousel if exists
document.addEventListener('DOMContentLoaded', function() {
  const heroCarousel = document.querySelector('.hero-carousel');
  if (heroCarousel) {
    new HeroCarousel(heroCarousel);
  }
});

// ===== LIGHTBOX =====
class Lightbox {
  constructor() {
    this.overlay = null;
    this.images = [];
    this.currentIndex = 0;
    
    this.init();
  }
  
  init() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'lightbox-overlay';
    this.overlay.innerHTML = `
      <button class="lightbox-close">&times;</button>
      <button class="lightbox-prev">&lsaquo;</button>
      <img class="lightbox-image" src="" alt="">
      <button class="lightbox-next">&rsaquo;</button>
      <div class="lightbox-counter"></div>
    `;
    this.overlay.style.display = 'none';
    document.body.appendChild(this.overlay);
    
    // Add event listeners
    this.overlay.querySelector('.lightbox-close').addEventListener('click', () => this.close());
    this.overlay.querySelector('.lightbox-prev').addEventListener('click', () => this.prev());
    this.overlay.querySelector('.lightbox-next').addEventListener('click', () => this.next());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.overlay.style.display === 'none') return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft') this.prev();
    });
  }
  
  open(images, startIndex = 0) {
    this.images = images;
    this.currentIndex = startIndex;
    this.update();
    this.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  
  close() {
    this.overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
  
  update() {
    this.overlay.querySelector('.lightbox-image').src = this.images[this.currentIndex];
    this.overlay.querySelector('.lightbox-counter').textContent = `${this.currentIndex + 1} / ${this.images.length}`;
  }
  
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.update();
  }
  
  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.update();
  }
}

// Initialize lightbox
const lightbox = new Lightbox();

// Make it globally available
window.openLightbox = function(images, startIndex) {
  lightbox.open(images, startIndex);
};

// ===== CALENDAR =====
class Calendar {
  constructor(container, events) {
    this.container = container;
    this.events = events || [];
    this.currentDate = new Date();
    this.selectedDate = null;
    
    this.monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
    this.dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
    
    this.init();
  }
  
  init() {
    this.render();
  }
  
  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    let html = `
      <div class="calendar-header">
        <button class="calendar-nav prev" onclick="calendar.prevMonth()">&lsaquo;</button>
        <h3>${this.monthNames[month]} ${year}</h3>
        <button class="calendar-nav next" onclick="calendar.nextMonth()">&rsaquo;</button>
      </div>
      <div class="calendar-days-header">
        ${this.dayNames.map(day => `<div>${day}</div>`).join('')}
      </div>
      <div class="calendar-days">
    `;
    
    // Empty cells
    for (let i = 0; i < startingDay; i++) {
      html += '<div class="calendar-day empty"></div>';
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = this.getEventsForDate(dateStr);
      const isToday = this.isToday(day);
      const eventType = dayEvents.length > 0 ? dayEvents[0].type : '';
      
      let classes = ['calendar-day'];
      if (isToday) classes.push('today');
      if (dayEvents.length > 0) classes.push('has-event', eventType.toLowerCase().replace(/\s/g, '-'));
      
      html += `
        <button class="${classes.join(' ')}" onclick="calendar.selectDate('${dateStr}')">
          <span>${day}</span>
          ${dayEvents.length > 0 ? '<span class="event-dot"></span>' : ''}
        </button>
      `;
    }
    
    html += '</div>';
    
    this.container.innerHTML = html;
  }
  
  getEventsForDate(dateStr) {
    return this.events.filter(e => e.date === dateStr);
  }
  
  isToday(day) {
    const today = new Date();
    return day === today.getDate() && 
           this.currentDate.getMonth() === today.getMonth() && 
           this.currentDate.getFullYear() === today.getFullYear();
  }
  
  selectDate(dateStr) {
    this.selectedDate = dateStr;
    const events = this.getEventsForDate(dateStr);
    
    const eventsList = document.querySelector('.selected-events');
    if (eventsList) {
      if (events.length === 0) {
        eventsList.innerHTML = '<p class="no-events">Geen evenementen op deze dag</p>';
      } else {
        eventsList.innerHTML = events.map(e => `
          <div class="event-item ${e.type.toLowerCase().replace(/\s/g, '-')}">
            <h4>${e.title}</h4>
            <span class="event-type">${e.type}</span>
            ${e.description ? `<p>${e.description}</p>` : ''}
            <button class="btn-link" onclick="addToGoogleCalendar('${e.title}', '${e.date}', '${e.description || ''}')">
              + Toevoegen aan agenda
            </button>
          </div>
        `).join('');
      }
    }
    
    this.render();
  }
  
  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  }
  
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  }
}

// Global calendar instance
let calendar;

// ===== NAVIGATION ACTIVE STATE =====
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-in-up');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
});


