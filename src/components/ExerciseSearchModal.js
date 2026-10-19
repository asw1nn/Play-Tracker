'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Plus, Loader2, Image as ImageIcon, Dumbbell } from 'lucide-react';
import { searchExercises, getExerciseImages, getExerciseDetails } from '../lib/wger';

export default function ExerciseSearchModal({ isOpen, onClose, onAddExercise }) {
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [exerciseImages, setExerciseImages] = useState({});

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        const term = searchTerm.trim();
        const controller = new AbortController();
        const delayDebounceFn = setTimeout(async () => {
            if (term.length >= 3) {
                setSearching(true);
                setSearchError('');
                try {
                    const data = await searchExercises(term, { signal: controller.signal });
                    setResults(data.slice(0, 20));
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('Search failed', error);
                        setResults([]);
                        setSearchError('Exercise search is unavailable right now. Please try again.');
                    }
                } finally {
                    if (!controller.signal.aborted) setSearching(false);
                }
            } else {
                setResults([]);
                setSearchError('');
                setSearching(false);
            }
        }, 500);

        return () => {
            clearTimeout(delayDebounceFn);
            controller.abort();
        };
    }, [searchTerm]);

    const handleExpand = async (exerciseId) => {
        if (expandedId === exerciseId) {
            setExpandedId(null);
            return;
        }

        setExpandedId(exerciseId);

        // Fetch images if not already loaded
        if (!exerciseImages[exerciseId]) {
            try {
                const images = await getExerciseImages(exerciseId);
                setExerciseImages(prev => ({ ...prev, [exerciseId]: images }));
            } catch (error) {
                console.error('Failed to load images', error);
            }
        }
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surface z-10">
                    <h2 className="text-xl font-bold text-white">Add from Database</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-secondary hover:text-text-primary"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-white/5 bg-black/20">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                        <input
                            type="text"
                            placeholder="Search exercises (e.g., Bench Press)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-text-secondary focus:outline-none focus:border-primary/50 transition-colors"
                            autoFocus
                        />
                        {searching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="animate-spin text-primary" size={18} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {results.length === 0 && !searching && searchError && (
                        <div className="text-center py-12 text-text-secondary">
                            <p>{searchError}</p>
                        </div>
                    )}

                    {results.length === 0 && !searching && !searchError && searchTerm.trim().length >= 3 && (
                        <div className="text-center py-12 text-text-secondary">
                            <p>No exercises found matching "{searchTerm.trim()}"</p>
                        </div>
                    )}

                    {results.length === 0 && searchTerm.trim().length < 3 && (
                        <div className="text-center py-12 text-text-secondary">
                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Type at least 3 characters to search</p>
                        </div>
                    )}

                    {results.map((exercise) => (
                        <ExerciseResultItem
                            key={exercise.id}
                            exercise={exercise}
                            expandedId={expandedId}
                            onExpand={handleExpand}
                            onAdd={onAddExercise}
                            onClose={onClose}
                            exerciseImages={exerciseImages}
                        />
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
}

function ExerciseResultItem({ exercise, expandedId, onExpand, onAdd, onClose, exerciseImages }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        // Fetch details (image/description) if not already present
        const fetchInfo = async () => {
            if (!exercise.description && !details && !error) {
                setLoading(true);
                try {
                    const info = await getExerciseDetails(exercise.id);
                    if (isMounted) {
                        if (info) {
                            setDetails(info);
                        } else {
                            setError(true);
                        }
                    }
                } catch (err) {
                    if (isMounted) setError(true);
                } finally {
                    if (isMounted) setLoading(false);
                }
            }
        };

        fetchInfo();

        return () => { isMounted = false; };
    }, [exercise.id]);

    const displayExercise = details ? { ...exercise, ...details } : exercise;
    const imageSrc = displayExercise.image || displayExercise.image_thumbnail;

    return (
        <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden transition-all hover:border-white/10">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => onExpand(exercise.id)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex-shrink-0 overflow-hidden flex items-center justify-center text-primary relative">
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt={displayExercise.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Dumbbell size={24} className="opacity-50" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate pr-2">{displayExercise.name}</h3>
                        <p className="text-xs text-text-secondary line-clamp-2">
                            {loading ? 'Loading description...' :
                                error ? 'Description unavailable' :
                                    displayExercise.description
                                        ? displayExercise.description.replace(/<[^>]*>/g, '').slice(0, 100) + (displayExercise.description.length > 100 ? '...' : '')
                                        : 'No description'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd({
                            name: displayExercise.name,
                            sets: [{ weight: '', reps: '' }]
                        });
                        onClose();
                    }}
                    className="p-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors flex-shrink-0 ml-2"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Expanded Details */}
            {expandedId === exercise.id && (
                <div className="p-4 pt-0 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2 duration-200">
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {exerciseImages[exercise.id] && exerciseImages[exercise.id].length > 0 ? (
                            exerciseImages[exercise.id].slice(0, 2).map((img) => (
                                <div key={img.id} className="aspect-video relative rounded-lg overflow-hidden bg-white/5">
                                    <img
                                        src={img.image}
                                        alt={displayExercise.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 py-4 text-center text-xs text-text-secondary italic">
                                {exerciseImages[exercise.id] ? 'No additional images available' : 'Loading images...'}
                            </div>
                        )}
                    </div>
                    <div
                        className="mt-4 text-sm text-text-secondary prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: displayExercise.description || 'No description available.' }}
                    />
                </div>
            )}
        </div>
    );
}
