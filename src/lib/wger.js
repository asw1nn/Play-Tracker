const BASE_URL = 'https://wger.de/api/v2';

function absoluteMediaUrl(path) {
    if (!path) return null;
    return new URL(path, 'https://wger.de').toString();
}

function getEnglishTranslation(exercise) {
    return exercise.translations?.find((translation) => translation.language === 2)
        || exercise.translations?.[0]
        || null;
}

function mapExercise(exercise) {
    const translation = getEnglishTranslation(exercise);
    const image = exercise.images?.[0];

    return {
        ...exercise,
        id: exercise.id,
        name: translation?.name || exercise.name || 'Unnamed exercise',
        description: translation?.description || '',
        category: exercise.category?.name || exercise.category,
        image: absoluteMediaUrl(image?.image),
        image_thumbnail: absoluteMediaUrl(
            image?.thumbnails?.medium || image?.thumbnails?.small || image?.image
        ),
    };
}

/** Search the current wger exercise-info endpoint by name. */
export async function searchExercises(term, { signal } = {}) {
    const params = new URLSearchParams({
        'name__search': term.trim(),
        'language__code': 'en',
        limit: '20',
    });
    const response = await fetch(`${BASE_URL}/exerciseinfo/?${params}`, { signal });
    if (!response.ok) {
        throw new Error(`Exercise search failed (${response.status})`);
    }

    const data = await response.json();
    return (data.results || []).map(mapExercise);
}

/** Get images for a specific exercise. */
export async function getExerciseImages(exerciseId) {
    const params = new URLSearchParams({ exercise: String(exerciseId), limit: '20' });
    const response = await fetch(`${BASE_URL}/exerciseimage/?${params}`);
    if (!response.ok) throw new Error(`Failed to fetch exercise images (${response.status})`);
    const data = await response.json();
    return data.results || [];
}

/** Get full details for a specific exercise. */
export async function getExerciseDetails(exerciseId) {
    const params = new URLSearchParams({ 'language__code': 'en' });
    const response = await fetch(`${BASE_URL}/exerciseinfo/${exerciseId}/?${params}`);
    if (!response.ok) throw new Error(`Failed to fetch exercise details (${response.status})`);
    return mapExercise(await response.json());
}
