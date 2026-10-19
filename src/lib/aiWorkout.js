const EXERCISES_BY_MUSCLE = {
    chest: [
        ['Bench Press', 'compound', 'medium'],
        ['Push Ups', 'compound', 'easy'],
        ['Incline Dumbbell Press', 'compound', 'medium'],
        ['Dumbbell Flys', 'isolation', 'medium'],
        ['Cable Crossovers', 'isolation', 'medium'],
        ['Dips', 'compound', 'hard'],
    ],
    back: [
        ['Pull Ups', 'compound', 'hard'],
        ['Barbell Rows', 'compound', 'medium'],
        ['Lat Pulldowns', 'compound', 'easy'],
        ['Seated Cable Rows', 'compound', 'medium'],
        ['Face Pulls', 'isolation', 'easy'],
        ['Deadlifts', 'compound', 'hard'],
    ],
    shoulders: [
        ['Overhead Press', 'compound', 'medium'],
        ['Lateral Raises', 'isolation', 'easy'],
        ['Front Raises', 'isolation', 'easy'],
        ['Arnold Press', 'compound', 'medium'],
        ['Rear Delt Flys', 'isolation', 'easy'],
    ],
    legs: [
        ['Squats', 'compound', 'hard'],
        ['Leg Press', 'compound', 'medium'],
        ['Romanian Deadlifts', 'compound', 'medium'],
        ['Lunges', 'compound', 'medium'],
        ['Leg Extensions', 'isolation', 'easy'],
        ['Leg Curls', 'isolation', 'easy'],
        ['Calf Raises', 'isolation', 'easy'],
    ],
    biceps: [
        ['Barbell Curls', 'isolation', 'medium'],
        ['Hammer Curls', 'isolation', 'easy'],
        ['Preacher Curls', 'isolation', 'medium'],
        ['Concentration Curls', 'isolation', 'easy'],
    ],
    triceps: [
        ['Tricep Pushdowns', 'isolation', 'easy'],
        ['Skull Crushers', 'isolation', 'medium'],
        ['Overhead Extensions', 'isolation', 'medium'],
        ['Close Grip Bench Press', 'compound', 'medium'],
    ],
    core: [
        ['Plank', 'isolation', 'medium'],
        ['Crunches', 'isolation', 'easy'],
        ['Leg Raises', 'isolation', 'medium'],
        ['Russian Twists', 'isolation', 'medium'],
        ['Ab Wheel Rollouts', 'compound', 'hard'],
    ],
};

function pickRandom(items, count) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const otherIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
    }
    return shuffled.slice(0, count);
}

/** Generate a workout locally so the planner does not depend on the database API. */
export async function generateAIWorkout({ energyLevel, targetMuscles, duration, goal }) {
    if (!['low', 'medium', 'high'].includes(energyLevel)
        || !Array.isArray(targetMuscles)
        || targetMuscles.length === 0
        || !['short', 'long'].includes(duration)
        || !['cutting', 'gaining', 'recomposition'].includes(goal)) {
        throw new Error('Choose an energy level, at least one muscle group, a duration, and a goal.');
    }

    const exerciseCount = duration === 'short'
        ? (energyLevel === 'low' ? 3 : 4)
        : (energyLevel === 'low' ? 5 : energyLevel === 'medium' ? 6 : 8);
    const schemes = {
        gaining: { sets: 4, reps: '8-12', rest: '90s' },
        cutting: { sets: 3, reps: '15-20', rest: '45s' },
        recomposition: { sets: 3, reps: '10-15', rest: '60s' },
    };
    const scheme = { ...schemes[goal] };
    if (energyLevel === 'low') scheme.sets = Math.max(2, scheme.sets - 1);
    if (energyLevel === 'high') scheme.sets = Math.min(5, scheme.sets + 1);

    const selectedExercises = [];
    const muscles = [...new Set(targetMuscles.map((muscle) => String(muscle).toLowerCase()))]
        .filter((muscle) => EXERCISES_BY_MUSCLE[muscle]);
    if (muscles.length === 0) {
        throw new Error('Choose at least one supported muscle group.');
    }
    const exercisesPerMuscle = Math.ceil(exerciseCount / muscles.length);

    muscles.forEach((muscle) => {
        if (selectedExercises.length >= exerciseCount) return;

        const entries = EXERCISES_BY_MUSCLE[muscle].map(([name, type, difficulty]) => ({ name, type, difficulty }));
        const compounds = entries.filter((exercise) => exercise.type === 'compound');
        const count = Math.min(exercisesPerMuscle, exerciseCount - selectedExercises.length);
        const selection = compounds.length > 0 ? pickRandom(compounds, 1) : [];
        const remaining = entries.filter((exercise) => !selection.includes(exercise));
        selection.push(...pickRandom(remaining, count - selection.length));

        selectedExercises.push(...selection.map((exercise) => ({ ...exercise, muscleGroup: muscle })));
    });

    const now = Date.now();
    const restSeconds = Number.parseInt(scheme.rest, 10);
    const exercises = selectedExercises.map((exercise, index) => ({
        id: now + index,
        name: exercise.name,
        sets: Array.from({ length: scheme.sets }, (_, setIndex) => ({
            id: now + (index + 1) * 100 + setIndex,
            weight: '',
            reps: scheme.reps,
            completed: false,
        })),
        target: exercise.muscleGroup,
        rest: scheme.rest,
        notes: `Focus on form. ${goal === 'cutting' ? 'Keep heart rate up.' : 'Control the eccentric.'}`,
    }));
    const totalSeconds = exercises.reduce((total, exercise) => total + exercise.sets.length * (30 + restSeconds), 0);

    return {
        exercises,
        summary: {
            goal: goal.charAt(0).toUpperCase() + goal.slice(1),
            duration: `${Math.ceil(totalSeconds / 60) + 5} mins`,
            intensity: energyLevel.charAt(0).toUpperCase() + energyLevel.slice(1),
            totalSets: exercises.reduce((total, exercise) => total + exercise.sets.length, 0),
        },
    };
}
