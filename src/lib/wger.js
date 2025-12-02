const BASE_URL = 'https://wger.de/api/v2';

/**
 * Search for exercises by name
 * @param {string} term - The search term
 * @returns {Promise<Array>} - List of exercises
 */
export async function searchExercises(term) {
    try {
        // Use the search endpoint which returns names and basic details
        const response = await fetch(`${BASE_URL}/exercise/search/?term=${encodeURIComponent(term)}`);
        if (!response.ok) throw new Error('Failed to fetch exercises');
        const data = await response.json();

        // Map the suggestions format to our expected format
        // Map the suggestions format to our expected format
        // Map the suggestions format to our expected format
        const mappedResults = (data.suggestions || []).map(item => ({
            id: item.data.base_id || item.data.id, // Use base_id if available, as it maps to exerciseinfo
            name: item.value,
            description: '', // Search endpoint doesn't return description
            category: item.data.category,
            image: item.data.image ? `https://wger.de${item.data.image}` : null,
            image_thumbnail: item.data.image_thumbnail ? `https://wger.de${item.data.image_thumbnail}` : null
        }));

        // Deduplicate by ID
        const uniqueResults = [];
        const seenIds = new Set();

        for (const result of mappedResults) {
            if (!seenIds.has(result.id)) {
                seenIds.add(result.id);
                uniqueResults.push(result);
            }
        }

        return uniqueResults;
    } catch (error) {
        console.error('Error searching exercises:', error);
        return [];
    }
}

/**
 * Get images for a specific exercise
 * @param {number} exerciseId - The exercise ID
 * @returns {Promise<Array>} - List of images
 */
export async function getExerciseImages(exerciseId) {
    try {
        const response = await fetch(`${BASE_URL}/exerciseimage/?exercise=${exerciseId}`);
        if (!response.ok) throw new Error('Failed to fetch exercise images');
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching exercise images:', error);
        return [];
    }
}

/**
 * Get full details for an exercise
 * @param {number} exerciseId - The exercise ID
 * @returns {Promise<Object|null>} - Exercise details
 */
export async function getExerciseDetails(exerciseId) {
    try {
        const response = await fetch(`${BASE_URL}/exerciseinfo/${exerciseId}/`);
        if (!response.ok) throw new Error('Failed to fetch exercise details');
        const data = await response.json();

        // Find English translation (language 2)
        const translation = data.translations?.find(t => t.language === 2);

        // Get the first image if available
        const image = data.images && data.images.length > 0 ? data.images[0].image : null;

        return {
            ...data,
            name: translation?.name || data.name, // Fallback to base name if needed
            description: translation?.description || '',
            image: image // Add image to the returned object
        };
    } catch (error) {
        console.error('Error fetching exercise details:', error);
        return null;
    }
}
