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
root.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');

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

// Funkcja przełączająca zakładkę
function activateTab(target) {
  nav.querySelectorAll('button').forEach(b => {
    b.classList.toggle('active', b.dataset.target === target);
  });
  panels.forEach(p => {
    p.classList.toggle('active', p.id === target);
  });
}

// Kliknięcie zakładki
nav.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const target = btn.dataset.target;
  activateTab(target);
  localStorage.setItem('activeTab', target);   // ← zapamiętaj
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Przy ładowaniu strony — przywróć ostatnią zakładkę
const savedTab = localStorage.getItem('activeTab');
if (savedTab && document.getElementById(savedTab)) {
  activateTab(savedTab);
}

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

// ===== Konfigurator ceny =====
(function initPriceBuilder() {
  const slider = document.getElementById('pb-slider');
  const frame = document.getElementById('pb-frame');
  const catLabel = document.getElementById('pb-cat');
  const total = document.getElementById('pb-total');

  const bgLayer = document.getElementById('pb-bg');
  const shadeDetail = document.getElementById('pb-shadow-detail');
  const shadeQuick = document.getElementById('pb-shadow-quick');

  const toggleBg = document.getElementById('pb-toggle-bg');
  const togglePaypal = document.getElementById('pb-toggle-paypal');
  const shadeNone = document.getElementById('pb-shade-none');
  const shadeQuickBtn = document.getElementById('pb-shade-quick');
  const shadeDetailBtn = document.getElementById('pb-shade-detail');

  if (!slider || !frame || !total) return;

  // Stan startowy: tło + szybkie cieniowanie włączone
  let hasBg = true;
  let shading = 'quick';
  let hasPaypal = false;

  const config = {
    1: { name: 'Bust',      price: 75,  priceEu: 17, width: 33,  height: 25 },
    2: { name: 'Half Body', price: 120, priceEu: 27, width: 33,  height: 66 },
    3: { name: 'Full Body', price: 165, priceEu: 38, width: 100, height: 100 }
  };

  // Współczynniki dodatków (procent ceny bazowej)
  const ADD = {
    bg:     0.15,   // +15% za tło
    quick:  0.15,   // +15% za szybkie cieniowanie
    detail: 0.50,   // +50% za szczegółowe cieniowanie
    paypal: 0.05    // +5% za PayPal
  };

  function update() {
    const idx = parseInt(slider.value, 10);
    const cfg = config[idx];

    frame.style.width = cfg.width + '%';
    frame.style.height = cfg.height + '%';
    catLabel.textContent = cfg.name;

    // Bazowa cena
    let price = cfg.price;
    let priceEu = cfg.priceEu;

    // Dodatki (zawsze od ceny bazowej)
    if (hasBg)                { price += cfg.price * ADD.bg;     priceEu += cfg.priceEu * ADD.bg; }
    if (shading === 'quick')  { price += cfg.price * ADD.quick;  priceEu += cfg.priceEu * ADD.quick; }
    if (shading === 'detail') { price += cfg.price * ADD.detail; priceEu += cfg.priceEu * ADD.detail; }

    // PayPal +5% (od całości, po dodatkach)
    if (hasPaypal) {
      price   *= (1 + ADD.paypal);
      priceEu *= (1 + ADD.paypal);
    }

    // Zaokrąglenie do 5 zł w górę
    price = Math.ceil(price / 5) * 5;
    priceEu = Math.ceil(priceEu / 5) * 5;

    total.textContent = price + ' zł / ' + priceEu + ' €';
  }

  slider.addEventListener('input', update);

  // Tło
  toggleBg.addEventListener('click', () => {
    hasBg = !hasBg;
    toggleBg.dataset.active = hasBg ? 'true' : 'false';
    bgLayer.classList.toggle('active', hasBg);
    update();
  });

  // PayPal
  togglePaypal.addEventListener('click', () => {
    hasPaypal = !hasPaypal;
    togglePaypal.dataset.active = hasPaypal ? 'true' : 'false';
    update();
  });

  // Cieniowanie
  function setShading(mode) {
    shading = mode;
    shadeNone.dataset.active = mode === 'none' ? 'true' : 'false';
    shadeQuickBtn.dataset.active = mode === 'quick' ? 'true' : 'false';
    shadeDetailBtn.dataset.active = mode === 'detail' ? 'true' : 'false';

    shadeQuick.classList.toggle('active', mode === 'quick');
    shadeDetail.classList.toggle('active', mode === 'detail');
    update();
  }

  shadeNone.addEventListener('click', () => setShading('none'));
  shadeQuickBtn.addEventListener('click', () => setShading('quick'));
  shadeDetailBtn.addEventListener('click', () => setShading('detail'));

  // Inicjalizacja — ustaw klasy na warstwach zgodnie ze stanem startowym
  bgLayer.classList.add('active');
  shadeQuick.classList.add('active');

  update();
})();