'use client';

import { Trash2, Plus, Check } from 'lucide-react';

export default function ExerciseCard({ exercise, onUpdate, onDelete, setWorkoutData, workoutData }) {

    const addSet = () => {
        const newSet = { id: Date.now(), weight: '', reps: '', completed: false };
        const updatedExercise = { ...exercise, sets: [...exercise.sets, newSet] };
        setWorkoutData(workoutData.map(ex => ex.id === exercise.id ? updatedExercise : ex));
    };

    const updateSet = (setId, field, value) => {
        const updatedSets = exercise.sets.map(set =>
            set.id === setId ? { ...set, [field]: value } : set
        );
        onUpdate(exercise.id, 'sets', updatedSets);
    };

    const toggleSet = (setId) => {
        const updatedSets = exercise.sets.map(set =>
            set.id === setId ? { ...set, completed: !set.completed } : set
        );
        onUpdate(exercise.id, 'sets', updatedSets);
    };

    return (
        <div className="bg-surface rounded-2xl p-5 mb-4 border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => onUpdate(exercise.id, 'name', e.target.value)}
                    placeholder="Exercise Name"
                    className="bg-transparent text-xl font-bold text-primary placeholder-primary/50 focus:outline-none focus:border-b-2 focus:border-primary w-full mr-4"
                />
                <button
                    onClick={() => onDelete(exercise.id)}
                    className="text-text-secondary hover:text-error transition-colors p-1"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-[3rem_1fr_1fr_3rem] gap-3 text-xs font-bold text-text-secondary uppercase text-center mb-2 items-center">
                    <span>Set</span>
                    <span>kg</span>
                    <span>Reps</span>
                    <span className="text-[10px]">Done</span>
                </div>

                {exercise.sets.map((set, index) => (
                    <div key={set.id} className={`grid grid-cols-[3rem_1fr_1fr_3rem] gap-3 items-center ${set.completed ? 'opacity-50' : ''}`}>
                        <span className="text-text-secondary font-bold text-center bg-surface-hover rounded-md py-2 text-sm">{index + 1}</span>
                        <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                            placeholder="0"
                            className="bg-bg border border-border rounded-lg p-2 text-center text-text-primary focus:outline-none focus:border-primary font-bold w-full"
                        />
                        <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                            placeholder="0"
                            className="bg-bg border border-border rounded-lg p-2 text-center text-text-primary focus:outline-none focus:border-primary font-bold w-full"
                        />
                        <button
                            onClick={() => toggleSet(set.id)}
                            className={`h-10 w-full rounded-lg flex items-center justify-center transition-all ${set.completed ? 'bg-success text-black shadow-[0_0_10px_rgba(46,204,113,0.4)]' : 'bg-surface-hover text-text-secondary hover:bg-border'}`}
                        >
                            <Check size={18} strokeWidth={3} />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addSet}
                className="w-full mt-4 py-2 border border-dashed border-primary/50 text-primary rounded-lg font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={16} /> Add Set
            </button>
        </div>
    );
}
