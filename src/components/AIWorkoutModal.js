'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Brain, Activity, Clock, Target, Dumbbell, Sparkles, ChevronRight, ChevronLeft, Check, RefreshCw, Play, PersonStanding, Footprints, BatteryLow, Zap, Flame } from 'lucide-react';
import { generateAIWorkout } from '../lib/aiWorkout';

const STEPS = {
    ENERGY: 0,
    MUSCLES: 1,
    DURATION: 2,
    GOAL: 3,
    RESULTS: 4
};

const MUSCLE_GROUPS = [
    { id: 'chest', label: 'Chest', icon: Dumbbell },
    { id: 'back', label: 'Back', icon: Activity },
    { id: 'shoulders', label: 'Shoulders', icon: PersonStanding },
    { id: 'legs', label: 'Legs', icon: Footprints },
    { id: 'biceps', label: 'Biceps', icon: Dumbbell },
    { id: 'triceps', label: 'Triceps', icon: Dumbbell },
    { id: 'core', label: 'Core', icon: Target }
];

export default function AIWorkoutModal({ isOpen, onClose, onApplyWorkout }) {
    const [step, setStep] = useState(STEPS.ENERGY);
    const [loading, setLoading] = useState(false);
    const [generationError, setGenerationError] = useState('');
    const [generatedWorkout, setGeneratedWorkout] = useState(null);

    const [inputs, setInputs] = useState({
        energyLevel: '', // low, medium, high
        targetMuscles: [],
        duration: '', // short, long
        goal: '' // cutting, gaining, recomposition
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    const handleNext = () => {
        if (step < STEPS.GOAL) {
            setStep(step + 1);
        } else {
            handleGenerate();
        }
    };

    const handleBack = () => {
        if (step > STEPS.ENERGY) {
            setStep(step - 1);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setGenerationError('');
        try {
            const result = await generateAIWorkout(inputs);
            setGeneratedWorkout(result);
            setStep(STEPS.RESULTS);
        } catch (error) {
            console.error('Generation failed', error);
            setGenerationError(error.message || 'Could not generate a workout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (generatedWorkout) {
            onApplyWorkout(generatedWorkout.exercises);
            onClose();
            // Reset state for next time
            setTimeout(() => {
                setStep(STEPS.ENERGY);
                setGeneratedWorkout(null);
                setInputs({
                    energyLevel: '',
                    targetMuscles: [],
                    duration: '',
                    goal: ''
                });
            }, 500);
        }
    };

    const toggleMuscle = (muscleId) => {
        setInputs(prev => {
            const exists = prev.targetMuscles.includes(muscleId);
            if (exists) {
                return { ...prev, targetMuscles: prev.targetMuscles.filter(id => id !== muscleId) };
            } else {
                return { ...prev, targetMuscles: [...prev.targetMuscles, muscleId] };
            }
        });
    };

    const canProceed = () => {
        switch (step) {
            case STEPS.ENERGY: return !!inputs.energyLevel;
            case STEPS.MUSCLES: return inputs.targetMuscles.length > 0;
            case STEPS.DURATION: return !!inputs.duration;
            case STEPS.GOAL: return !!inputs.goal;
            default: return true;
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surface z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Brain size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">AI Workout Generator</h2>
                            <p className="text-xs text-text-secondary">
                                {step === STEPS.RESULTS ? 'Your Personalized Plan' : `Step ${step + 1} of 4`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-secondary hover:text-text-primary"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                    {/* Step 1: Energy Level */}
                    {step === STEPS.ENERGY && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">How's your energy today?</h3>
                                <p className="text-text-secondary">This helps us adjust the intensity and volume.</p>
                            </div>

                            <div className="grid gap-4">
                                {[
                                    { id: 'low', label: 'Low Energy', desc: 'Lighter weights, fewer sets, focus on movement.', icon: BatteryLow },
                                    { id: 'medium', label: 'Feeling Good', desc: 'Standard volume and intensity.', icon: Zap },
                                    { id: 'high', label: 'Beast Mode', desc: 'High volume, high intensity, push your limits.', icon: Flame }
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setInputs({ ...inputs, energyLevel: option.id })}
                                        className={`p-6 rounded-xl border text-left transition-all hover:scale-[1.02] flex items-center gap-4
                                            ${inputs.energyLevel === option.id
                                                ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(244,208,63,0.2)]'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <option.icon size={30} className="shrink-0 text-primary" strokeWidth={1.75} />
                                        <div>
                                            <h4 className={`font-bold text-lg ${inputs.energyLevel === option.id ? 'text-primary' : 'text-white'}`}>
                                                {option.label}
                                            </h4>
                                            <p className="text-sm text-text-secondary">{option.desc}</p>
                                        </div>
                                        {inputs.energyLevel === option.id && (
                                            <Check className="ml-auto text-primary" size={24} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Target Muscles */}
                    {step === STEPS.MUSCLES && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">What do you want to train?</h3>
                                <p className="text-text-secondary">Select one or more muscle groups.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {MUSCLE_GROUPS.map((muscle) => (
                                    <button
                                        key={muscle.id}
                                        onClick={() => toggleMuscle(muscle.id)}
                                        className={`p-4 rounded-xl border transition-all hover:scale-105 flex flex-col items-center gap-2 text-center
                                            ${inputs.targetMuscles.includes(muscle.id)
                                                ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <muscle.icon size={28} className={inputs.targetMuscles.includes(muscle.id) ? 'text-blue-400' : 'text-text-secondary'} strokeWidth={1.75} />
                                        <span className={`font-bold ${inputs.targetMuscles.includes(muscle.id) ? 'text-blue-400' : 'text-white'}`}>
                                            {muscle.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Duration */}
                    {step === STEPS.DURATION && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">How much time do you have?</h3>
                                <p className="text-text-secondary">We'll fit the workout to your schedule.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { id: 'short', label: 'Quick Workout', time: '~30-45 mins', icon: <Clock size={32} /> },
                                    { id: 'long', label: 'Full Session', time: '60+ mins', icon: <Activity size={32} /> }
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setInputs({ ...inputs, duration: option.id })}
                                        className={`p-8 rounded-xl border transition-all hover:scale-[1.02] flex flex-col items-center gap-4 text-center
                                            ${inputs.duration === option.id
                                                ? 'bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <div className={`${inputs.duration === option.id ? 'text-green-400' : 'text-text-secondary'}`}>
                                            {option.icon}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-xl mb-1 ${inputs.duration === option.id ? 'text-green-400' : 'text-white'}`}>
                                                {option.label}
                                            </h4>
                                            <p className="text-text-secondary">{option.time}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Goal */}
                    {step === STEPS.GOAL && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">What's your main goal?</h3>
                                <p className="text-text-secondary">This determines sets, reps, and rest periods.</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { id: 'gaining', label: 'Muscle Gain (Hypertrophy)', desc: 'Moderate reps (8-12), focus on volume.', color: 'text-purple-400', border: 'border-purple-500', bg: 'bg-purple-500/20' },
                                    { id: 'cutting', label: 'Fat Loss / Endurance', desc: 'High reps (15+), short rest periods.', color: 'text-red-400', border: 'border-red-500', bg: 'bg-red-500/20' },
                                    { id: 'recomposition', label: 'Strength & Recomp', desc: 'Mix of strength and hypertrophy ranges.', color: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-500/20' }
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setInputs({ ...inputs, goal: option.id })}
                                        className={`w-full p-5 rounded-xl border text-left transition-all hover:scale-[1.01]
                                            ${inputs.goal === option.id
                                                ? `${option.bg} ${option.border} shadow-lg`
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <h4 className={`font-bold text-lg mb-1 ${inputs.goal === option.id ? option.color : 'text-white'}`}>
                                            {option.label}
                                        </h4>
                                        <p className="text-sm text-text-secondary">{option.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in duration-300">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                                <Brain className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white mb-2">Generating Workout...</h3>
                                <p className="text-text-secondary">Analyzing your preferences and selecting exercises.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Results */}
                    {step === STEPS.RESULTS && generatedWorkout && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Summary Card */}
                            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-5 border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Sparkles className="text-yellow-400" size={20} />
                                    Workout Summary
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-black/20 rounded-lg p-3">
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Goal</p>
                                        <p className="font-bold text-white">{generatedWorkout.summary.goal}</p>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-3">
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Duration</p>
                                        <p className="font-bold text-white">{generatedWorkout.summary.duration}</p>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-3">
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Intensity</p>
                                        <p className="font-bold text-white">{generatedWorkout.summary.intensity}</p>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-3">
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Exercises</p>
                                        <p className="font-bold text-white">{generatedWorkout.exercises.length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Exercises List */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider ml-1">Exercises</h4>
                                {generatedWorkout.exercises.map((ex, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">{ex.name}</h4>
                                                <p className="text-xs text-text-secondary">
                                                    {ex.sets.length} sets × {ex.sets[0].reps} reps • {ex.rest} rest
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs px-2 py-1 rounded bg-white/10 text-text-secondary capitalize">
                                            {ex.target}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                {!loading && step !== STEPS.RESULTS && (
                    <div className="p-6 border-t border-white/10 bg-surface flex flex-col gap-4">
                        {generationError && (
                            <p role="alert" className="text-sm text-red-400">{generationError}</p>
                        )}
                        <div className="flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={step === STEPS.ENERGY}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                                ${step === STEPS.ENERGY
                                    ? 'text-white/20 cursor-not-allowed'
                                    : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <ChevronLeft size={18} />
                            Back
                        </button>

                        <div className="flex gap-2">
                            {Object.values(STEPS).slice(0, 4).map((s) => (
                                <div
                                    key={s}
                                    className={`w-2 h-2 rounded-full transition-colors ${s === step ? 'bg-primary' : s < step ? 'bg-primary/50' : 'bg-white/10'}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all
                                ${canProceed()
                                    ? 'bg-primary text-black hover:bg-primary-variant shadow-lg hover:shadow-primary/20'
                                    : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
                        >
                            {step === STEPS.GOAL ? 'Generate' : 'Next'}
                            {step === STEPS.GOAL ? <Sparkles size={18} /> : <ChevronRight size={18} />}
                        </button>
                        </div>
                    </div>
                )}

                {/* Results Footer */}
                {step === STEPS.RESULTS && (
                    <div className="p-6 border-t border-white/10 bg-surface flex gap-4">
                        <button
                            onClick={() => {
                                setStep(STEPS.ENERGY);
                                setGeneratedWorkout(null);
                            }}
                            className="flex-1 py-3 rounded-xl border border-white/10 font-bold text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Start Over
                        </button>
                        <button
                            onClick={handleApply}
                            className="flex-[2] py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary-variant transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            <Play size={18} fill="currentColor" />
                            Start Workout
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
