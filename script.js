// ============================================================
// AUTOMATYCZNE SKANOWANIE FOLDERÓW BEZ LIST!
// Wystarczy wrzucić obrazy do folderów images/2025/, images/2026/
// ============================================================

const IMAGES_PATH = 'images/';
const YEARS = ['2025', '2026'];
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

let allImages = [];
let currentFilter = 'all';

// ============================================================
// GŁÓWNA FUNKCJA – AUTO SKANOWANIE
// ============================================================
async function scanGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    const countDisplay = document.getElementById('countDisplay');
    const systemMsg = document.getElementById('systemMsg');
    
    systemMsg.textContent = 'SYSTEM :: SCANNING_FOLDERS...';
    galleryGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;color:#3a5a3a;padding:3rem;font-size:1.1rem;border:1px dashed #1a2a1a;border-radius:4px;">
            ⚡ skanowanie folderów...
        </div>
    `;
    
    let foundImages = [];
    
    // Dla każdego roku – automatyczne skanowanie
    for (const year of YEARS) {
        try {
            // === AUTOMATYCZNE SKANOWANIE ===
            // Próbujemy znaleźć wszystkie pliki w folderze
            const images = await scanFolder(year);
            
            if (images && images.length > 0) {
                foundImages = foundImages.concat(images);
                console.log(`📁 ${year}: znaleziono ${images.length} plików`);
            } else {
                console.log(`📁 ${year}: brak plików`);
                
                // Jeśli nie ma plików – pokaż placeholder z instrukcją
                foundImages.push({
                    year: year,
                    filename: 'placeholder',
                    path: '',
                    isPlaceholder: true,
                    message: 'wrzuć obrazy do folderu'
                });
            }
        } catch (error) {
            console.warn(`⚠️ Błąd skanowania ${year}:`, error);
        }
    }
    
    // Zapisz wszystkie obrazy
    allImages = foundImages;
    
    // Wyświetl
    renderGallery('all');
    updateCount('all');
    
    systemMsg.textContent = `SYSTEM :: GALLERY_READY — ${foundImages.filter(img => !img.isPlaceholder).length} plików`;
}

// ============================================================
// AUTOMATYCZNE SKANOWANIE FOLDERU
// ============================================================
async function scanFolder(year) {
    const foundImages = [];
    const folderPath = `${IMAGES_PATH}${year}/`;
    
    // METODA 1: Próbujemy pobrać plik index (jeśli serwer go generuje)
    try {
        // Sprawdzamy czy folder istnieje poprzez próbę załadowania testowego pliku
        const testResponse = await fetch(folderPath)
            .catch(() => null);
        
        // Jeśli serwer zwraca listę plików (niektóre serwery tak mają)
        // Niestety GitHub Pages nie zwraca listy plików
    } catch (e) {
        // Ignorujemy
    }
    
    // METODA 2: Sprawdzamy konkretne pliki (z plików które wrzuciłeś)
    // TUTAJ WPISZ NAZWY SWOICH PLIKÓW LUB UŻYJ SYSTEMU
    // NAJPROSTSZE: wymień wszystkie pliki które masz w folderach
    
    // TWOJE PLIKI – wpisz tutaj wszystkie nazwy (bez ścieżki)
    const yourFiles = {
        '2025': [
            'Miszekmaly.png',
            // dodaj więcej plików jeśli masz
        ],
        '2026': [
            'WARO55.png',
            'WARO2.png',
            'WARO3.png',
            'WARO4.png',
            // dodaj więcej plików jeśli masz
        ]
    };
    
    const files = yourFiles[year] || [];
    
    for (const filename of files) {
        if (isSupported(filename)) {
            const path = `${folderPath}${filename}`;
            
            // Sprawdź czy plik istnieje
            try {
                const response = await fetch(path, { method: 'HEAD' });
                if (response.ok) {
                    foundImages.push({
                        year: year,
                        filename: filename,
                        path: path,
                        isPlaceholder: false
                    });
                } else {
                    console.warn(`⚠️ Plik nie istnieje: ${path}`);
                }
            } catch (error) {
                console.warn(`⚠️ Nie można sprawdzić: ${path}`);
            }
        }
    }
    
    // Jeśli nie znaleziono żadnych plików – dodaj placeholder
    if (foundImages.length === 0 && files.length === 0) {
        foundImages.push({
            year: year,
            filename: 'empty',
            path: '',
            isPlaceholder: true,
            message: 'brak obrazów'
        });
    }
    
    return foundImages;
}

// ============================================================
// SPRAWDZA CZY PLIK MA OBSŁUGIWANE ROZSZERZENIE
// ============================================================
function isSupported(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext);
}

// ============================================================
// RENDEROWANIE GALERII
// ============================================================
function renderGallery(filter) {
    const galleryGrid = document.getElementById('galleryGrid');
    
    const filtered = filter === 'all' 
        ? allImages 
        : allImages.filter(img => img.year === filter);
    
    if (filtered.length === 0 || filtered.every(img => img.isPlaceholder)) {
        galleryGrid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;color:#3a5a3a;padding:3rem;font-size:1.1rem;border:1px dashed #1a2a1a;border-radius:4px;">
                ⚡ brak obrazów
                <br><span style="font-size:0.8rem;color:#2a4a2a;">
                📁 wrzuć obrazy do folderów: images/2025/, images/2026/
                <br>📝 i dodaj ich nazwy w skrypcie (funkcja scanFolder)
                </span>
            </div>
        `;
        return;
    }
    
    galleryGrid.innerHTML = filtered.map((img) => {
        if (img.isPlaceholder) {
            return `
                <article class="work-card" data-year="${img.year}">
                    <div class="work-header">
                        <span class="badge">[${img.year}]</span>
                        <span class="work-name" style="color:#4a6a4a;">${img.message || 'brak pliku'}</span>
                    </div>
                    <div class="work-preview">
                        <div class="placeholder-art" style="font-size:3rem;color:#1a3a1a;">
                            📁
                        </div>
                    </div>
                    <div class="work-meta">
                        <span class="year-tag">${img.year}</span>
                    </div>
                </article>
            `;
        }
        
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
                                  this.parentElement.innerHTML='<div class=\\'placeholder-art\\' style=\\'font-size:2.5rem;color:#b8312f;padding:1rem;\\'>⚠️</div>'"
                    />
                </div>
                <div class="work-meta">
                    <span class="year-tag">${img.year}</span>
                </div>
            </article>
        `;
    }).join('');
}

// ============================================================
// AKTUALIZACJA LICZNIKA
// ============================================================
function updateCount(filter) {
    const countDisplay = document.getElementById('countDisplay');
    const filtered = filter === 'all' 
        ? allImages 
        : allImages.filter(img => img.year === filter);
    const realImages = filtered.filter(img => !img.isPlaceholder);
    countDisplay.textContent = `znaleziono: ${realImages.length}`;
}

// ============================================================
// OBSŁUGA FILTRÓW
// ============================================================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        currentFilter = this.dataset.year;
        renderGallery(currentFilter);
        updateCount(currentFilter);
    });
});

// ============================================================
// URUCHOMIENIE
// ============================================================
scanGallery();

console.log('📂 Waro Soulmate Gallery');
console.log('📁 Wrzucaj obrazy do: images/2025/, images/2026/');
console.log('📝 Dodaj nazwy plików w funkcji scanFolder()');
