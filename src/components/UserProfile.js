'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, ChevronDown, Settings } from 'lucide-react';
import ProfileModal from './ProfileModal';

export default function UserProfile() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, right: 0 });
    const buttonRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const updatePosition = () => {
                const rect = buttonRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.bottom + 8,
                    right: window.innerWidth - rect.right
                });
            };

            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition);

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition);
            };
        }
    }, [isOpen]);

    if (!user) return null;

    return (
        <>
            <div className="relative">
                <button
                    ref={buttonRef}
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 bg-surface/50 hover:bg-surface border border-white/10 rounded-full pl-1 pr-3 py-1 transition-all"
                >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <User size={16} />
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate hidden md:block">
                        {user.name}
                    </span>
                    <ChevronDown size={14} className={`text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {mounted && isOpen && createPortal(
                    <div className="fixed inset-0 z-[999] isolate">
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-[1px]"
                            onClick={() => setIsOpen(false)}
                        />
                        <div
                            className="fixed w-64 bg-surface border border-white/10 rounded-xl shadow-2xl z-[1000] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                            style={{
                                top: `${coords.top}px`,
                                right: `${coords.right}px`
                            }}
                        >
                            <div className="p-4 border-b border-white/5">
                                <p className="font-bold text-sm truncate text-white">{user.name}</p>
                                <p className="text-xs text-text-secondary truncate">{user.email || user.mobile}</p>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsProfileModalOpen(true);
                                    setIsOpen(false);
                                }}
                                className="w-full p-3 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                            >
                                <User size={16} />
                                View Profile
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    logout();
                                    setIsOpen(false);
                                }}
                                className="w-full p-3 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors border-t border-white/5"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
            </div>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={user}
            />
        </>
    );
}
