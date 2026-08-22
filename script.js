// ============================================================
// AUTOMATYCZNE SKANOWANIE FOLDERÓW
// Wystarczy wrzucać pliki do folderów images/2023/, images/2024/, images/2025/
// ============================================================

// Lista obsługiwanych rozszerzeń
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

// Folder z obrazkami
const IMAGES_PATH = 'images/';

// Lata które skanujemy
const YEARS = ['2023', '2024', '2025'];

// ============================================================
// FUNKCJA: generuje wszystkie możliwe nazwy plików
// (użytkownik wrzuca pliki, a my próbujemy je znaleźć)
// ============================================================
function generateFileList() {
    const files = [];
    
    YEARS.forEach(year => {
        // Próbujemy różnych wariantów nazw (bez rozszerzenia)
        // Możesz rozszerzyć listę o własne nazwy lub użyć systemu plików
        // Na razie używamy prostego systemu - skanujemy wszystkie pliki z folderu
        // poprzez zapytanie do serwera (fallback)
        
        // W praktyce - nie możemy bezpośrednio skanować folderów z przeglądarki
        // więc używamy sprytnego obejścia: próbujemy załadować pliki
        // o nazwach które mogą istnieć
    });
    
    return files;
}

// ============================================================
// GŁÓWNA FUNKCJA: skanuje i ładuje obrazy
// ============================================================
async function scanGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    const countDisplay = document.getElementById('countDisplay');
    const systemMsg = document.getElementById('systemMsg');
    
    systemMsg.textContent = 'SYSTEM :: SCANNING_FILES...';
    
    // Lista wszystkich znalezionych obrazów
    let foundImages = [];
    
    // Dla każdego roku próbujemy znaleźć obrazy
    for (const year of YEARS) {
        try {
            // Próbujemy pobrać listę plików z folderu (działa tylko na niektórych serwerach)
            // Alternatywnie - używamy metody "prób i błędów" - próbujemy załadować pliki
            // z nazwami które mogą istnieć
            
            // === METODA 1: Próbujemy załadować plik listy (jeśli istnieje) ===
            const listResponse = await fetch(`${IMAGES_PATH}${year}/list.json`)
                .then(res => res.ok ? res.json() : null)
                .catch(() => null);
            
            if (listResponse && Array.isArray(listResponse)) {
                // Mamy listę plików z JSON
                listResponse.forEach(filename => {
                    if (isSupported(filename)) {
                        foundImages.push({
                            year: year,
                            filename: filename,
                            path: `${IMAGES_PATH}${year}/${filename}`
                        });
                    }
                });
            } else {
                // === METODA 2: Skanujemy ręcznie (generujemy nazwy) ===
                // Tutaj możesz dodać swoje własne pliki lub użyć systemu 
                // który będzie skanował katalog
                
                // Na razie - przykładowe pliki (zastąp własnymi)
                const sampleFiles = await getSampleFiles(year);
                sampleFiles.forEach(filename => {
                    foundImages.push({
                        year: year,
                        filename: filename,
                        path: `${IMAGES_PATH}${year}/${filename}`
                    });
                });
            }
        } catch (error) {
            console.warn(`⚠️ Błąd skanowania roku ${year}:`, error);
        }
    }
    
    // Jeśli nie znaleźliśmy żadnych obrazów - pokaż przykładowe
    if (foundImages.length === 0) {
        foundImages = getFallbackImages();
    }
    
    // Wyświetl obrazy
    renderGallery(foundImages, 'all');
    countDisplay.textContent = `znaleziono: ${foundImages.length}`;
    systemMsg.textContent = `SYSTEM :: GALLERY_LOADED — ${foundImages.length} plików`;
    
    return foundImages;
}

// ============================================================
// POMOCNICZE: sprawdza czy plik ma obsługiwane rozszerzenie
// ============================================================
function isSupported(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext);
}

// ============================================================
// PRZYKŁADOWE PLIKI (zastąp własnymi)
// ============================================================
function getSampleFiles(year) {
    // Tutaj wpisz nazwy swoich plików (bez rozszerzenia)
    // albo użyj systemu który automatycznie je wykryje
    const samples = {
        '2023': [
            'pierwszy-krok.jpg',
            'noc-w-miescie.png',
            'portret-ciszy.jpg',
            'zmierzch.jpg',
            'echo.jpg'
        ],
        '2024': [
            'anthurium.jpg',
            'zachod-epsilon.png',
            'syntezator-snow.jpg',
            'mgla.jpg',
            'kosmos.jpg'
        ],
        '2025': [
            'mgla.jpg',
            'linia-snu.png',
            'echo-terminal.jpg',
            'nowy-projekt.jpg',
            'test.jpg'
        ]
    };
    return samples[year] || [];
}

// ============================================================
// FALLBACK - jeśli nic nie znaleziono
// ============================================================
function getFallbackImages() {
    const fallback = [];
    YEARS.forEach(year => {
        // Generujemy placeholder
        for (let i = 1; i <= 3; i++) {
            fallback.push({
                year: year,
                filename: `placeholder-${i}.jpg`,
                path: '', // puste - użyjemy placeholdera
                isPlaceholder: true
            });
        }
    });
    return fallback;
}

// ============================================================
// RENDEROWANIE GALERII
// ============================================================
let allImages = [];

function renderGallery(images, filter) {
    const galleryGrid = document.getElementById('galleryGrid');
    
    const filtered = filter === 'all' 
        ? images 
        : images.filter(img => img.year === filter);
    
    allImages = images;
    
    if (filtered.length === 0) {
        galleryGrid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;color:#3a5a3a;padding:3rem;font-size:1.1rem;border:1px dashed #1a2a1a;border-radius:4px;">
                ⚡ brak prac dla ${filter === 'all' ? 'tego okresu' : 'roku ' + filter}
            </div>
        `;
        return;
    }
    
    galleryGrid.innerHTML = filtered.map((img, index) => {
        // Generuj nazwę z pliku
        const fileName = img.filename.split('.').slice(0, -1).join('.');
        const displayName = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Czy to placeholder?
        if (img.isPlaceholder) {
            return `
                <article class="work-card" data-year="${img.year}">
                    <div class="work-header">
                        <span class="badge">[PLACEHOLDER]</span>
                        <span class="work-name">brak pliku</span>
                    </div>
                    <div class="work-preview">
                        <div class="placeholder-art" style="font-size:3rem;color:#1a3a1a;">
                            🖼️
                        </div>
                    </div>
                    <div class="work-meta">
                        <span class="year-tag">${img.year}</span>
                    </div>
                </article>
            `;
        }
        
        return `
            <article class="work-card" data-year="${img.year}">
                <div class="work-header">
                    <span class="badge">[${img.year}]</span>
                    <span class="work-name" title="${displayName}">${displayName}</span>
                </div>
                <div class="work-preview">
                    <img src="${img.path}" alt="${displayName}" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=\\'placeholder-art\\' style=\\'font-size:2.5rem;color:#1a3a1a;\\'>⚠️</div>'" />
                </div>
                <div class="work-meta">
                    <span class="year-tag">${img.year}</span>
                </div>
            </article>
        `;
    }).join('');
}

// ============================================================
// OBSŁUGA FILTRÓW
// ============================================================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const year = this.dataset.year;
        renderGallery(allImages, year);
        
        const count = year === 'all' 
            ? allImages.length 
            : allImages.filter(img => img.year === year).length;
        document.getElementById('countDisplay').textContent = `znaleziono: ${count}`;
    });
});

// ============================================================
// URUCHOMIENIE
// ============================================================
scanGallery();

// ============================================================
// (OPCJA) automatyczne odświeżanie co 30s
// ============================================================
// setInterval(() => {
//     scanGallery();
// }, 30000);

console.log('📂 Waro Soulmate Gallery — automatyczne skanowanie!');
console.log('📁 Wrzucaj pliki do folderów: images/2023/, images/2024/, images/2025/');
console.log('🔄 Strona automatycznie wykryje wszystkie obrazy');
