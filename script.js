// ==========================================
//  BELTRÍO – script.js
// ==========================================

// -- Navbar: background on scroll --
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// -- Mobile nav toggle --
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  const spans = navToggle.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  }
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  });
});

// -- Scroll reveal --
const revealSelectors = '.section-header, .video-wrapper, .gallery-item, .contact-card, .about-text, .about-deco, .agenda-card';
const revealElements = document.querySelectorAll(revealSelectors);

revealElements.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = (entry.target.closest('.contact-grid') || entry.target.closest('.gallery-masonry') || entry.target.closest('.agenda-list'))
        ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80
        : 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

revealElements.forEach(el => observer.observe(el));

// -- Active nav link on scroll --
const sections    = document.querySelectorAll('section[id], header[id]');
const navLinkEls  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinkEls.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.style.color = 'var(--accent)';
        }
      });
    }
  });
}, { rootMargin: '-40% 0px -40% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ==========================================
//  GALLERY – Album filter tabs
// ==========================================
const albumTabs    = document.querySelectorAll('.album-tab');
const galleryItems = document.querySelectorAll('.gallery-item');

function filterGallery(album) {
  galleryItems.forEach(item => {
    const inAlbum = album === 'all' || item.dataset.album === album;
    if (inAlbum) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}

albumTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    albumTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    filterGallery(tab.dataset.album);
  });
});

// ==========================================
//  LIGHTBOX
// ==========================================
const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxClose  = document.getElementById('lightboxClose');
const lightboxPrev   = document.getElementById('lightboxPrev');
const lightboxNext   = document.getElementById('lightboxNext');
const lightboxCounter= document.getElementById('lightboxCounter');
const lightboxAlbum  = document.getElementById('lightboxAlbumName');

let lightboxImages = [];  // Array of {src, album} currently visible
let lightboxIndex  = 0;

/** Build the current visible images list for lightbox navigation */
function buildLightboxList() {
  const activeTab  = document.querySelector('.album-tab.active');
  const activeAlbum = activeTab ? activeTab.dataset.album : 'all';
  lightboxImages = [];
  galleryItems.forEach(item => {
    if (activeAlbum === 'all' || item.dataset.album === activeAlbum) {
      lightboxImages.push({
        src:   item.dataset.src,
        album: item.querySelector('.gallery-overlay span')?.textContent || ''
      });
    }
  });
}

function openLightbox(clickedItem) {
  buildLightboxList();
  // Find index of clicked item
  const src = clickedItem.dataset.src;
  lightboxIndex = lightboxImages.findIndex(img => img.src === src);
  if (lightboxIndex === -1) lightboxIndex = 0;
  setLightboxImage(lightboxIndex, false);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function setLightboxImage(idx, animate = true) {
  const item = lightboxImages[idx];
  if (!item) return;

  if (animate) {
    lightboxImg.classList.add('fading');
    setTimeout(() => {
      lightboxImg.src = item.src;
      lightboxImg.alt = `BELTRÍO – ${item.album}`;
      lightboxImg.classList.remove('fading');
    }, 230);
  } else {
    lightboxImg.src = item.src;
    lightboxImg.alt = `BELTRÍO – ${item.album}`;
  }

  lightboxCounter.textContent = `${idx + 1} / ${lightboxImages.length}`;
  lightboxAlbum.textContent   = item.album;
  lightboxPrev.style.display  = lightboxImages.length > 1 ? '' : 'none';
  lightboxNext.style.display  = lightboxImages.length > 1 ? '' : 'none';
}

function prevImage() {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  setLightboxImage(lightboxIndex);
}
function nextImage() {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  setLightboxImage(lightboxIndex);
}

// Open lightbox on gallery item click / enter
galleryItems.forEach(item => {
  item.addEventListener('click',   () => openLightbox(item));
  item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(item); });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click',  prevImage);
lightboxNext.addEventListener('click',  nextImage);

// Click outside image closes
lightbox.addEventListener('click', e => {
  if (e.target === lightbox || e.target.id === 'lightboxTrack') closeLightbox();
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   prevImage();
  if (e.key === 'ArrowRight')  nextImage();
});

// ---- Touch / swipe support for mobile ----
let touchStartX = 0;
let touchStartY = 0;

lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    dx < 0 ? nextImage() : prevImage();
  }
}, { passive: true });

// ==========================================
//  VISIT COUNTER – GoatCounter API
// ==========================================
(async function loadVisitCount() {
  const el = document.getElementById('visitCount');
  if (!el) return;
  try {
    // GoatCounter public API: pageviews for all pages combined
    const res = await fetch('https://beltrio.goatcounter.com/counter/TOTAL.json');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    // Animate counting up
    const target = data.count || 0;
    animateCount(el, 0, target, 1400);
  } catch (err) {
    // Fallback: try to fetch the badge text
    try {
      const res2 = await fetch('https://beltrio.goatcounter.com/counter/TOTAL.text');
      const text = await res2.text();
      const num = parseInt(text.trim().replace(/,/g, ''), 10);
      if (!isNaN(num)) {
        animateCount(el, 0, num, 1400);
      } else {
        el.textContent = '–';
      }
    } catch {
      el.textContent = '–';
    }
  }
})();

function animateCount(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(from + (to - from) * eased).toLocaleString('es-AR');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
