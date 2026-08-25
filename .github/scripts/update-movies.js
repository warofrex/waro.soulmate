const fs = require('fs');

// Klucz API z GitHub Secrets
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// === TUTAJ WPISZ ID TWOICH LIST Z TMDB ===
// Zastąp poniższe ID swoimi
const FAVORITE_LIST_ID = '8688704';   // <-- ZASTĄP SWOIM ID
const WATCHLIST_ID = '8688705';      // <-- ZASTĄP SWOIM ID

async function fetchMoviesFromList(listId) {
    console.log(`⏳ Pobieranie listy o ID: ${listId}...`);

    if (!TMDB_API_KEY) {
        console.error('❌ Błąd krytyczny: Brak klucza API (TMDB_API_KEY)');
        return [];
    }

    try {
        const url = `https://api.themoviedb.org/3/list/${listId}?api_key=${TMDB_API_KEY}&language=pl-PL`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`❌ Błąd HTTP ${response.status} dla listy ${listId}`);
            const errorText = await response.text();
            console.error(`   Odpowiedź serwera: ${errorText.substring(0, 200)}`);
            return [];
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.warn(`⚠️ Lista o ID ${listId} jest pusta lub nie istnieje.`);
            return [];
        }

        console.log(`✅ Znaleziono ${data.items.length} filmów na liście.`);
        return data.items
            .map(movie => ({
                title: movie.title,
                year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
                poster: movie.poster_path ? `https://image.tmdb.org/t/p/w154${movie.poster_path}` : null
            }))
            .filter(movie => movie.poster !== null); // Pomijamy filmy bez plakatu

    } catch (error) {
        console.error(`❌ Błąd sieci lub parsowania dla listy ${listId}:`, error.message);
        return [];
    }
}

async function updateMovies() {
    console.log('🎬 Rozpoczynanie aktualizacji bazy filmów...');

    if (!TMDB_API_KEY) {
        console.error('❌ Błąd krytyczny: Zmienna środowiskowa TMDB_API_KEY nie jest ustawiona.');
        console.error('   Upewnij się, że dodałeś secret o nazwie TMDB_API_KEY w ustawieniach repozytorium.');
        process.exit(1);
    }

    console.log(`📊 ID listy ulubionych: ${FAVORITE_LIST_ID}`);
    console.log(`📊 ID listy do obejrzenia: ${WATCHLIST_ID}`);

    // Pobieranie danych równolegle dla szybszego działania
    const [favorites, watchlist] = await Promise.all([
        fetchMoviesFromList(FAVORITE_LIST_ID),
        fetchMoviesFromList(WATCHLIST_ID)
    ]);

    // Sprawdzenie, czy udało się cokolwiek pobrać
    if (favorites.length === 0 && watchlist.length === 0) {
        console.warn('⚠️ UWAGA: Nie pobrano żadnych filmów. Sprawdź ID list i klucz API.');
        console.warn('   Plik movies-data.js NIE zostanie zaktualizowany, aby uniknąć usunięcia istniejących danych.');
        // Nie nadpisujemy pliku, jeśli nie ma danych, żeby nie zniszczyć istniejącej strony.
        return;
    }

    // Generowanie zawartości pliku
    const output = `// ============================================================
// AUTOMATYCZNIE GENEROWANE – NIE EDYTUJ RĘCZNIE!
// Ostatnia aktualizacja: ${new Date().toLocaleString('pl-PL')}
// Liczba filmów: ${favorites.length} ulubionych, ${watchlist.length} do obejrzenia
// ============================================================

const FAVORITE_MOVIES = ${JSON.stringify(favorites, null, 4)};

const WATCHLIST_MOVIES = ${JSON.stringify(watchlist, null, 4)};
`;

    // Zapis do pliku
    try {
        fs.writeFileSync('movies-data.js', output);
        console.log(`\n✅ Plik movies-data.js został pomyślnie zaktualizowany.`);
        console.log(`📊 Ulubione: ${favorites.length} filmów`);
        console.log(`📊 Do obejrzenia: ${watchlist.length} filmów`);
    } catch (error) {
        console.error('❌ Błąd zapisu pliku movies-data.js:', error.message);
        process.exit(1);
    }
}

// Uruchom główną funkcję
updateMovies();
