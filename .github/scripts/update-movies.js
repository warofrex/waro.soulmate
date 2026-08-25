const fs = require('fs');

// Klucz API z GitHub Secrets
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// === TUTAJ WPISZ ID TWOICH LIST Z TMDB ===
const FAVORITE_LIST_ID = '123456';   // <-- ZASTĄP SWOIM ID
const WATCHLIST_ID = '789012';      // <-- ZASTĄP SWOIM ID

async function fetchMoviesFromList(listId) {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/list/${listId}?api_key=${TMDB_API_KEY}&language=pl-PL`
        );

        if (!response.ok) {
            console.error(`❌ Błąd pobierania listy: ${response.status}`);
            return [];
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.warn(`⚠️ Lista pusta lub brak dostępu: ${listId}`);
            return [];
        }

        return data.items.map(movie => ({
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w154${movie.poster_path}` : null
        })).filter(movie => movie.poster !== null);
    } catch (error) {
        console.error(`❌ Błąd:`, error.message);
        return [];
    }
}

async function updateMovies() {
    if (!TMDB_API_KEY) {
        console.error('❌ Brak klucza API! Ustaw TMDB_API_KEY w GitHub Secrets');
        process.exit(1);
    }

    console.log('🎬 Pobieranie danych z TMDB...');
    console.log(`📊 Pobieram listę ulubionych (ID: ${FAVORITE_LIST_ID})`);
    console.log(`📊 Pobieram listę do obejrzenia (ID: ${WATCHLIST_ID})`);

    const favorites = await fetchMoviesFromList(FAVORITE_LIST_ID);
    const watchlist = await fetchMoviesFromList(WATCHLIST_ID);

    const output = `// ============================================================
// AUTOMATYCZNIE GENEROWANE – NIE EDYTUJ RĘCZNIE!
// Ostatnia aktualizacja: ${new Date().toLocaleString('pl-PL')}
// Liczba filmów: ${favorites.length} ulubionych, ${watchlist.length} do obejrzenia
// ============================================================

const FAVORITE_MOVIES = ${JSON.stringify(favorites, null, 4)};

const WATCHLIST_MOVIES = ${JSON.stringify(watchlist, null, 4)};
`;

    fs.writeFileSync('movies-data.js', output);

    console.log(`\n✅ Zapisano do movies-data.js`);
    console.log(`📊 Ulubione: ${favorites.length} filmów`);
    console.log(`📊 Do obejrzenia: ${watchlist.length} filmów`);

    if (favorites.length === 0 && watchlist.length === 0) {
        console.warn('⚠️ Uwaga: Nie pobrano żadnych filmów! Sprawdź ID list i klucz API.');
    }
}

updateMovies();
