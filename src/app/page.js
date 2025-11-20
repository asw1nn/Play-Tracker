'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Timer, Folder, Calendar, Save, Play, Dumbbell, Activity, Heart } from 'lucide-react';
import Image from 'next/image';

// Placeholder components - will be implemented next
import ExerciseCard from '../components/ExerciseCard';
import StopwatchOverlay from '../components/StopwatchOverlay';
import HistoryView from '../components/HistoryView';

const WORKOUT_TEMPLATES = {
    push: [
        { name: 'Bench Press', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Overhead Press', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Incline Dumbbell Press', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Tricep Pushdowns', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
    ],
    pull: [
        { name: 'Pull Ups', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Barbell Rows', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Face Pulls', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Bicep Curls', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
    ],
    legs: [
        { name: 'Squats', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Romanian Deadlifts', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Leg Press', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Calf Raises', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
    ],
    cardio: [
        { name: 'Running (30 mins)', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Cycling (45 mins)', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Jump Rope (15 mins)', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
    ],
    other: [
        { name: 'Plank', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Russian Twists', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
        { name: 'Burpees', sets: [{ id: 1, weight: '', reps: '', completed: false }] },
    ]
};

export default function Home() {
    const [workoutData, setWorkoutData] = useState([]);
    const [history, setHistory] = useState([]);
    const [viewMode, setViewMode] = useState('current'); // 'current' or 'history'
    const [isTimerVisible, setIsTimerVisible] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [laps, setLaps] = useState([]);

    const timerInterval = useRef(null);

    // Load data on mount
    useEffect(() => {
        const savedData = localStorage.getItem('playTrackerData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setWorkoutData(parsed.current || []);
            setHistory(parsed.history || []);
        }
    }, []);

    // Save data on change
    useEffect(() => {
        const dataToSave = {
            current: workoutData,
            history: history
        };
        localStorage.setItem('playTrackerData', JSON.stringify(dataToSave));
    }, [workoutData, history]);

    // Timer Logic
    useEffect(() => {
        if (isTimerRunning) {
            timerInterval.current = setInterval(() => {
                setTimerSeconds(s => s + 1);
            }, 1000);
        } else {
            clearInterval(timerInterval.current);
        }
        return () => clearInterval(timerInterval.current);
    }, [isTimerRunning]);

    const handleLap = () => {
        setLaps([...laps, timerSeconds]);
    };

    const handleReset = () => {
        setIsTimerRunning(false);
        setTimerSeconds(0);
        setLaps([]);
    };

    // Workout Logic
    const addExercise = () => {
        const newExercise = {
            id: Date.now(),
            name: '',
            sets: [{ id: Date.now() + 1, weight: '', reps: '', completed: false }]
        };
        setWorkoutData([...workoutData, newExercise]);
    };

    const loadTemplate = (type) => {
        const template = WORKOUT_TEMPLATES[type];
        const newExercises = template.map((ex, index) => ({
            id: Date.now() + index * 100,
            name: ex.name,
            sets: ex.sets.map(s => ({ ...s, id: Date.now() + index * 100 + 1 }))
        }));
        setWorkoutData(newExercises);
    };

    const updateExercise = (id, field, value) => {
        setWorkoutData(workoutData.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
    };

    const deleteExercise = (id) => {
        setWorkoutData(workoutData.filter(ex => ex.id !== id));
    };

    const saveWorkout = () => {
        if (workoutData.length === 0) return;
        const newSession = {
            id: Date.now(),
            date: new Date().toISOString(),
            exercises: workoutData
        };
        setHistory([...history, newSession]);
        setWorkoutData([]);
        setViewMode('history');
    };

    return (
        <div className="min-h-screen bg-bg text-text-primary pb-24 font-sans">
            {/* Header */}
            <header className="relative p-4 pt-6 md:p-6 md:pt-8 flex flex-col justify-center border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-10 overflow-hidden mb-6 md:mb-10">
                {/* Background Logo Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] mix-blend-soft-light">
                    <div className="relative w-[80%] h-[80%] blur-md">
                        <Image src="/logo.jpg" alt="Background Logo" fill className="object-contain" />
                    </div>
                </div>

                {/* Top Right Logo - Responsive Positioning */}
                <div className="absolute top-4 right-4 w-10 h-10 md:top-6 md:right-6 md:w-[60px] md:h-[60px] rounded-full overflow-hidden border border-primary/30 shadow-lg z-20">
                    <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
                </div>

                <div className="relative z-10 w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto pl-2 md:pl-4">
                    <h1 className="text-4xl md:text-6xl font-black font-serif italic text-primary tracking-tight uppercase mb-1 drop-shadow-sm">Play Tracker</h1>

                    <div className="flex items-center justify-between w-full pr-16 md:pr-20">
                        <p className="text-text-secondary text-xs md:text-sm font-medium flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>

                        {viewMode === 'current' && workoutData.length > 0 && (
                            <button
                                onClick={saveWorkout}
                                className="bg-primary text-black px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-primary-variant transition-colors shadow-md"
                            >
                                <Save size={14} /> FINISH
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <div className="flex border-b border-border mb-6 md:mb-8 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4">
                <button
                    onClick={() => setViewMode('current')}
                    className={`flex-1 py-3 text-sm md:text-base font-bold text-center transition-colors relative ${viewMode === 'current' ? 'text-primary' : 'text-text-secondary'}`}
                >
                    TODAY'S WORKOUT
                    {viewMode === 'current' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_rgba(244,208,63,0.5)]" />}
                </button>
                <button
                    onClick={() => setViewMode('history')}
                    className={`flex-1 py-3 text-sm md:text-base font-bold text-center transition-colors relative ${viewMode === 'history' ? 'text-primary' : 'text-text-secondary'}`}
                >
                    FOLDERS
                    {viewMode === 'history' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_rgba(244,208,63,0.5)]" />}
                </button>
            </div>

            {/* Main Content - Responsive Grid */}
            <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4">
                {viewMode === 'current' ? (
                    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
                        {workoutData.length === 0 ? (
                            <div className="col-span-2 py-10 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 opacity-50">
                                    <Play size={32} className="ml-1" />
                                </div>
                                <p className="text-lg font-medium leading-relaxed mb-6">Start a workout</p>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full max-w-2xl">
                                    <button onClick={() => loadTemplate('push')} className="bg-surface hover:bg-surface/80 border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105">
                                        <Dumbbell size={24} className="text-primary" />
                                        <span className="font-bold text-sm">PUSH</span>
                                    </button>
                                    <button onClick={() => loadTemplate('pull')} className="bg-surface hover:bg-surface/80 border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105">
                                        <Activity size={24} className="text-primary" />
                                        <span className="font-bold text-sm">PULL</span>
                                    </button>
                                    <button onClick={() => loadTemplate('legs')} className="bg-surface hover:bg-surface/80 border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105">
                                        <div className="rotate-90"><Dumbbell size={24} className="text-primary" /></div>
                                        <span className="font-bold text-sm">LEGS</span>
                                    </button>
                                    <button onClick={() => loadTemplate('cardio')} className="bg-surface hover:bg-surface/80 border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105">
                                        <Heart size={24} className="text-primary" />
                                        <span className="font-bold text-sm">CARDIO</span>
                                    </button>
                                    <button onClick={() => loadTemplate('other')} className="bg-surface hover:bg-surface/80 border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105">
                                        <Plus size={24} className="text-primary" />
                                        <span className="font-bold text-sm">OTHER</span>
                                    </button>
                                </div>

                                <p className="text-sm opacity-50 mt-8">Or tap the + button to add manually</p>
                            </div>
                        ) : (
                            workoutData.map(exercise => (
                                <ExerciseCard
                                    key={exercise.id}
                                    exercise={exercise}
                                    onUpdate={updateExercise}
                                    onDelete={deleteExercise}
                                    setWorkoutData={setWorkoutData}
                                    workoutData={workoutData}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    <HistoryView history={history} onDelete={(id) => setHistory(history.filter(h => h.id !== id))} />
                )}
            </main>

            {/* FABs */}
            <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col gap-4 md:gap-6 z-50 items-end">
                {viewMode === 'current' && (
                    <>
                        {/* Timer Button - Glassmorphism */}
                        <button
                            onClick={() => setIsTimerVisible(true)}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-surface/30 backdrop-blur-md border border-white/10 text-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform group"
                        >
                            <Timer size={20} className="md:w-7 md:h-7 group-hover:rotate-12 transition-transform" />
                        </button>

                        {/* Add Button - Enhanced */}
                        <button
                            onClick={addExercise}
                            className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-primary text-black flex items-center justify-center shadow-[0_4px_20px_rgba(244,208,63,0.4)] ring-2 ring-primary/50 hover:scale-105 transition-transform"
                        >
                            <Plus size={28} className="md:w-10 md:h-10" strokeWidth={2.5} />
                        </button>
                    </>
                )}
            </div>

            {/* Timer Overlay */}
            <StopwatchOverlay
                isVisible={isTimerVisible}
                seconds={timerSeconds}
                isRunning={isTimerRunning}
                laps={laps}
                onToggle={() => setIsTimerRunning(!isTimerRunning)}
                onReset={handleReset}
                onLap={handleLap}
                onClose={() => setIsTimerVisible(false)}
            />
        </div>
    );
}
