'use client';

import { useState } from 'react';
import { Folder, ChevronDown, ChevronUp, Trash2, Calendar } from 'lucide-react';

export default function HistoryView({ history, onDelete }) {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (history.length === 0) {
        return (
            <div className="text-center py-12 text-text-secondary">
                <Folder size={48} className="mx-auto mb-4 opacity-20" />
                <p>No saved workouts yet.</p>
                <p className="text-xs mt-2">Complete a workout to save it here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {history.slice().reverse().map((session) => (
                <div key={session.id} className="bg-surface rounded-2xl overflow-hidden border border-border">
                    <div
                        onClick={() => toggleExpand(session.id)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-hover transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Folder size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary">{session.name || 'Workout Session'}</h3>
                                <p className="text-xs text-text-secondary flex items-center gap-1">
                                    <Calendar size={10} />
                                    {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                                className="p-2 text-text-secondary hover:text-error transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                            {expandedId === session.id ? <ChevronUp size={20} className="text-text-secondary" /> : <ChevronDown size={20} className="text-text-secondary" />}
                        </div>
                    </div>

                    {expandedId === session.id && (
                        <div className="bg-bg/50 p-4 border-t border-border space-y-3 animate-in slide-in-from-top-2 duration-200">
                            {session.exercises.map((ex, idx) => (
                                <div key={idx} className="bg-surface rounded-lg p-3 border border-border/50">
                                    <h4 className="font-bold text-primary mb-2 text-sm">{ex.name || 'Unnamed Exercise'}</h4>
                                    <div className="space-y-1">
                                        {ex.sets.map((set, sIdx) => (
                                            <div key={sIdx} className="flex justify-between text-xs text-text-secondary">
                                                <span>Set {sIdx + 1}</span>
                                                <span>{set.weight}kg x {set.reps}</span>
                                                <span className={set.completed ? 'text-success' : 'text-text-secondary'}>
                                                    {set.completed ? 'Done' : '-'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
