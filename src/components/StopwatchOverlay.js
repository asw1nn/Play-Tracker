'use client';

import { X, Play, Pause, RotateCcw, Flag } from 'lucide-react';

export default function StopwatchOverlay({ isVisible, seconds, isRunning, laps, onToggle, onReset, onLap, onClose }) {
    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-surface border-t border-primary shadow-[0_-5px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 z-50 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="max-w-md mx-auto p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-primary font-bold uppercase text-sm tracking-wider mb-1">Stopwatch</h3>
                        <div className="text-7xl md:text-9xl font-sans font-black italic text-primary tabular-nums tracking-tighter">
                            {formatTime(seconds)}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary p-2">
                        <X size={24} />
                    </button>
                </div>

                {/* Laps List */}
                {laps.length > 0 && (
                    <div className="mb-6 max-h-32 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        {laps.slice().reverse().map((lapTime, index) => (
                            <div key={index} className="flex justify-between text-sm border-b border-border pb-1">
                                <span className="text-text-secondary">Lap {laps.length - index}</span>
                                <span className="font-mono text-text-primary">{formatTime(lapTime)}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    {isRunning ? (
                        <>
                            <button
                                onClick={onToggle}
                                className="flex-1 bg-surface-hover text-text-primary h-14 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-border transition-colors"
                            >
                                <Pause size={20} /> Stop
                            </button>
                            <button
                                onClick={onLap}
                                className="flex-1 bg-surface-hover text-text-primary h-14 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-border transition-colors"
                            >
                                <Flag size={20} /> Lap
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onToggle}
                                className="flex-1 bg-primary text-black h-14 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary-variant transition-colors shadow-lg shadow-primary/20"
                            >
                                <Play size={20} /> Start
                            </button>
                            <button
                                onClick={onReset}
                                className="flex-1 bg-surface-hover text-text-primary h-14 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-border transition-colors"
                            >
                                <RotateCcw size={20} /> Reset
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
