import api from './api';

/**
 * Generate a workout plan based on user inputs
 * @param {Object} params
 * @param {string} params.energyLevel - 'low', 'medium', 'high'
 * @param {string[]} params.targetMuscles - Array of muscle groups
 * @param {string} params.duration - 'short', 'long'
 * @param {string} params.goal - 'cutting', 'gaining', 'recomposition'
 * @returns {Promise<Object>} Generated workout plan
 */
export const generateAIWorkout = async (params) => {
    try {
        const response = await api.post('/workouts/generate', params);
        return response.data;
    } catch (error) {
        console.error('Failed to generate workout:', error);
        throw error;
    }
};
