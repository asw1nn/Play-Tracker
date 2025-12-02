'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Calendar, Activity, Mail, Phone } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, user }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted || !isOpen || !user) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-0 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-primary">Profile Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-secondary hover:text-text-primary"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 ring-4 ring-surface shadow-xl">
                            <User size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{user.name}</h3>
                        <p className="text-text-secondary text-sm">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-black/20 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Age</p>
                                <p className="text-lg font-medium">{user.age ? `${user.age} years` : 'Not set'}</p>
                            </div>
                        </div>

                        <div className="bg-black/20 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Activity size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Gender</p>
                                <p className="text-lg font-medium capitalize">{user.gender || 'Not set'}</p>
                            </div>
                        </div>

                        {(user.email) && (
                            <div className="bg-black/20 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Email</p>
                                    <p className="text-lg font-medium break-all">{user.email}</p>
                                </div>
                            </div>
                        )}

                        {(user.mobile) && (
                            <div className="bg-black/20 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Mobile</p>
                                    <p className="text-lg font-medium">{user.mobile}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
