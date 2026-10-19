'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

// Components
import ExerciseCard from '../components/ExerciseCard';
import StopwatchOverlay from '../components/StopwatchOverlay';
import HistoryView from '../components/HistoryView';
import UserProfile from '../components/UserProfile';
import ExerciseSearchModal from '../components/ExerciseSearchModal';
import AIWorkoutModal from '../components/AIWorkoutModal';
import { Plus, Timer, Calendar, Save, Play, Dumbbell, Activity, Heart, LogIn, Search, Brain } from 'lucide-react';

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
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [workoutData, setWorkoutData] = useState([]);
    const [workoutName, setWorkoutName] = useState('');
    const [history, setHistory] = useState([]);
    const [viewMode, setViewMode] = useState('current'); // 'current' or 'history'
    const [isTimerVisible, setIsTimerVisible] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const timerInterval = useRef(null);

    const handleApplyAIWorkout = (exercises) => {
        setWorkoutData(exercises);
        setWorkoutName('AI Generated Workout');
        setIsAIModalOpen(false);
    };

    // Load data logic
    useEffect(() => {
        const loadData = async () => {
            if (isAuthenticated) {
                try {
                    // Fetch from API
                    const response = await api.get('/workouts');
                    setHistory(response.data.workouts);

                    // Check for local data to migrate
                    const localData = localStorage.getItem('playTrackerData');
                    if (localData) {
                        const parsed = JSON.parse(localData);
                        if (parsed.history && parsed.history.length > 0) {
                            // Migrate data
                            await api.post('/workouts/migrate', { history: parsed.history });
                            // Refresh history
                            const newResponse = await api.get('/workouts');
                            setHistory(newResponse.data.workouts);
                            // Clear local history but keep current workout if any
                            localStorage.removeItem('playTrackerData');
                            if (parsed.current && parsed.current.length > 0) {
                                setWorkoutData(parsed.current);
                                setWorkoutName(parsed.name || '');
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to load workouts:', error);
                }
            } else {
                // Load from localStorage
                const savedData = localStorage.getItem('playTrackerData');
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    setWorkoutData(parsed.current || []);
                    setWorkoutName(parsed.name || '');
                    setHistory(parsed.history || []);
                }
            }
        };

        if (!authLoading) {
            loadData();
        }
    }, [isAuthenticated, authLoading]);

    // Save current workout state locally (draft)
    useEffect(() => {
        if (!isAuthenticated) {
            const dataToSave = {
                current: workoutData,
                name: workoutName,
                history: history
            };
            localStorage.setItem('playTrackerData', JSON.stringify(dataToSave));
        }
    }, [workoutData, history, isAuthenticated]);

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

    const handleAddFromDatabase = (exerciseData) => {
        const newExercise = {
            id: Date.now(),
            name: exerciseData.name,
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
        setWorkoutName(`${type.charAt(0).toUpperCase() + type.slice(1)} Workout`);
    };

    const updateExercise = (id, field, value) => {
        setWorkoutData(workoutData.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
    };

    const deleteExercise = (id) => {
        setWorkoutData(workoutData.filter(ex => ex.id !== id));
    };

    const saveWorkout = async () => {
        if (workoutData.length === 0) return;

        const newSession = {
            id: Date.now(), // Temporary ID for UI
            date: new Date().toISOString(),
            exercises: workoutData,
            name: workoutName || 'Workout Session'
        };

        if (isAuthenticated) {
            try {
                const response = await api.post('/workouts', {
                    date: newSession.date,
                    exercises: newSession.exercises,
                    name: newSession.name
                });
                setHistory([response.data.workout, ...history]);
                setWorkoutData([]);
                setWorkoutName('');
                setViewMode('history');
            } catch (error) {
                console.error('Failed to save workout:', error);
                alert('Failed to save workout. Please try again.');
            }
        } else {
            setHistory([...history, newSession]);
            setWorkoutData([]);
            setWorkoutName('');
            setViewMode('history');
            router.push('/auth'); // Redirect to auth page after saving locally
        }
    };

    const handleDeleteHistory = async (id) => {
        if (isAuthenticated) {
            try {
                await api.delete(`/workouts/${id}`);
                setHistory(history.filter(h => h.id !== id));
            } catch (error) {
                console.error('Failed to delete workout:', error);
            }
        } else {
            setHistory(history.filter(h => h.id !== id));
        }
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

                {/* Top Right Controls */}
                <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
                    {isAuthenticated ? (
                        <UserProfile />
                    ) : (
                        <Link
                            href="/auth"
                            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full px-4 py-1.5 transition-all font-bold text-sm"
                        >
                            <LogIn size={16} />
                            <span className="hidden md:inline">Login / Register</span>
                        </Link>
                    )}
                </div>

                <div className="relative z-10 w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto pl-2 md:pl-4">
                    <h1 className="text-4xl md:text-6xl font-black font-serif italic text-primary tracking-tight uppercase mb-1 drop-shadow-sm">Play Tracker</h1>

                    <div className="flex items-center justify-between w-full">
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
                    <HistoryView history={history} onDelete={handleDeleteHistory} />
                )}
            </main>

            {/* FABs */}
            <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col gap-4 md:gap-6 z-50 items-end">
                {viewMode === 'current' && (
                    <>
                        {/* AI Workout Button */}
                        <button
                            onClick={() => setIsAIModalOpen(true)}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform group border border-white/20"
                        >
                            <Brain size={20} className="md:w-7 md:h-7 group-hover:animate-pulse" />
                        </button>

                        {/* Timer Button - Glassmorphism */}
                        <button
                            onClick={() => setIsTimerVisible(true)}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-surface/30 backdrop-blur-md border border-white/10 text-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform group"
                        >
                            <Timer size={20} className="md:w-7 md:h-7 group-hover:rotate-12 transition-transform" />
                        </button>

                        {/* Search Button */}
                        <button
                            onClick={() => setIsSearchModalOpen(true)}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-surface/30 backdrop-blur-md border border-white/10 text-blue-400 flex items-center justify-center shadow-lg hover:scale-105 transition-transform group"
                        >
                            <Search size={20} className="md:w-7 md:h-7" />
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

            {/* Exercise Search Modal */}
            <ExerciseSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onAddExercise={handleAddFromDatabase}
            />

            {/* AI Workout Modal */}
            <AIWorkoutModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onApplyWorkout={handleApplyAIWorkout}
            />
        </div>
    );
}
