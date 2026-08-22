
const glitchLayers = document.querySelectorAll('.glitch-layer');

function triggerGlitch() {
    glitchLayers.forEach(layer => {
        layer.classList.add('is-glitching');
    });

    // bardzo krótki glitch
    setTimeout(() => {
        glitchLayers.forEach(layer => {
            layer.classList.remove('is-glitching');
        });
    }, 180);

    // kolejny glitch za losowy czas
    scheduleNextGlitch();
}

function scheduleNextGlitch() {
    const delay = 3000 + Math.random() * 7000;

    setTimeout(triggerGlitch, delay);
}

// pierwszy glitch po 4–7 sekundach
setTimeout(triggerGlitch, 4000 + Math.random() * 3000);

// ============================================================
// AUTOMATYCZNE SKANOWANIE FOLDERÓW
// ============================================================

const IMAGES_PATH = 'images/';
const YEARS = ['2025', '2026'];
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

let allImages = [];
let currentFilter = 'all';

// ============================================================
// TWOJE PLIKI – dodaj tutaj wszystkie nazwy obrazów
// ============================================================
const YOUR_FILES = {
    '2025': [
        'Miszekmaly.png',
    ],
    '2026': [
        'WARO55.png',
        'WARO2.png',
        'WARO3.png',
        'WARO4.png',
    ]
};

// ============================================================
// GŁÓWNA FUNKCJA
// ============================================================
async function scanGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    const countDisplay = document.getElementById('countDisplay');
    const systemMsg = document.getElementById('systemMsg');
    
    systemMsg.textContent = 'SYSTEM :: SCANNING_FILES...';
    
    let foundImages = [];
    
    for (const year of YEARS) {
        const files = YOUR_FILES[year] || [];
        
        for (const filename of files) {
            if (isSupported(filename)) {
                const path = `${IMAGES_PATH}${year}/${filename}`;
                
                try {
                    const response = await fetch(path, { method: 'HEAD' });
                    if (response.ok) {
                        foundImages.push({
                            year: year,
                            filename: filename,
                            path: path,
                            exists: true
                        });
                        console.log(`✅ ${year}/${filename} — znaleziono`);
                    } else {
                        console.warn(`⚠️ ${year}/${filename} — nie istnieje`);
                    }
                } catch (error) {
                    console.warn(`⚠️ ${year}/${filename} — błąd:`, error);
                }
            }
        }
    }
    
    if (foundImages.length === 0) {
        for (const year of YEARS) {
            foundImages.push({
                year: year,
                filename: 'placeholder',
                path: '',
                exists: false,
                isPlaceholder: true
            });
        }
    }
    
    allImages = foundImages;
    renderGallery('all');
    updateCount('all');
    
    systemMsg.textContent = `SYSTEM :: GALLERY_READY — ${foundImages.filter(img => img.exists).length} plików`;
}

function isSupported(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext);
}

function renderGallery(filter) {
    const galleryGrid = document.getElementById('galleryGrid');
    
    const filtered = filter === 'all' 
        ? allImages 
        : allImages.filter(img => img.year === filter);
    
    const realImages = filtered.filter(img => img.exists);
    
    if (realImages.length === 0) {
        galleryGrid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;color:#3a5a3a;padding:3rem;font-size:1.1rem;border:1px dashed #1a2a1a;border-radius:4px;">
                ⚡ brak obrazów
                <br><span style="font-size:0.8rem;color:#2a4a2a;">
                📁 wrzuć obrazy do folderów: images/2025/, images/2026/
                <br>📝 i dodaj ich nazwy w YOUR_FILES w script.js
                </span>
            </div>
        `;
        return;
    }
    
    galleryGrid.innerHTML = realImages.map((img) => {
        const fileName = img.filename.split('.').slice(0, -1).join('.');
        const displayName = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        return `
            <article class="work-card" data-year="${img.year}">
                <div class="work-header">
                    <span class="badge">[${img.year}]</span>
                    <span class="work-name" title="${displayName}">${displayName}</span>
                </div>
                <div class="work-preview">
                    <img src="${img.path}" alt="${displayName}" loading="lazy" 
                         onerror="this.style.display='none';
                                  this.parentElement.innerHTML='<div style=\\'font-size:2.5rem;color:#b8312f;padding:1rem;\\'>⚠️</div>'"
                    />
                </div>
                <div class="work-meta">
                    <span class="year-tag">${img.year}</span>
                </div>
            </article>
        `;
    }).join('');
}

function updateCount(filter) {
    const countDisplay = document.getElementById('countDisplay');
    const filtered = filter === 'all' 
        ? allImages 
        : allImages.filter(img => img.year === filter);
    const realImages = filtered.filter(img => img.exists);
    countDisplay.textContent = `znaleziono: ${realImages.length}`;
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        currentFilter = this.dataset.year;
        renderGallery(currentFilter);
        updateCount(currentFilter);
    });
});

scanGallery();

console.log('📂 Waro Soulmate Gallery');
console.log('📁 Wrzucaj obrazy do: images/2025/, images/2026/');
console.log('📝 Dodaj nazwy plików w YOUR_FILES');
