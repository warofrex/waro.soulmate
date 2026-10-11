const root = document.documentElement;

// ===== Język =====
const langToggle = document.getElementById('lang-toggle');

let lang = localStorage.getItem('lang');
if (!lang) {
  const browser = (navigator.language || 'en').toLowerCase();
  lang = browser.startsWith('pl') ? 'pl' : 'en';
}
root.setAttribute('lang', lang);

langToggle.addEventListener('click', () => {
  lang = lang === 'pl' ? 'en' : 'pl';
  root.setAttribute('lang', lang);
  localStorage.setItem('lang', lang);
});

// ===== Motyw =====
const themeToggle = document.getElementById('theme-toggle');
root.setAttribute('data-theme', localStorage.getItem('theme') || 'light');

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ===== Rok w stopce =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Przełączanie zakładek =====
const nav = document.getElementById('nav');
const panels = document.querySelectorAll('.panel');

nav.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  nav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  panels.forEach(p => p.classList.toggle('active', p.id === btn.dataset.target));
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.getElementById('gallery').addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG') {
    lightboxImg.src = e.target.src;
    lightboxImg.alt = e.target.alt;
    lightbox.classList.add('open');
  }
});

lightbox.addEventListener('click', () => {
  lightbox.classList.remove('open');
  lightboxImg.src = '';
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') lightbox.classList.remove('open');
});