import React from 'react';
import CommunityDashboard from './CommunityDashboard';

export default function MainMenu({ onStartClassic, onStartDuel }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-pop-in relative z-10">
            {/* Logo */}
            <div className="mb-4 flex flex-col items-center gap-6">
                <img
                    src="/waifudle_logo.png"
                    alt="WaifuDLE"
                    className="h-32 md:h-48 object-contain drop-shadow-2xl smooth-render hover:scale-105 transition-transform duration-300"
                />
                <CommunityDashboard />
            </div>

            {/* Menu Buttons */}
            <div className="w-full max-w-sm space-y-4">
                <button
                    onClick={onStartClassic}
                    className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold font-pixel text-lg rounded-3xl shadow-[0_0_15px_rgba(236,72,153,0.4)] border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 hover:brightness-110 hover:scale-105 transition-all duration-200 uppercase tracking-widest relative overflow-hidden group"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
                        Mode Classique
                    </span>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>
                </button>

                <button
                    onClick={onStartDuel}
                    className="w-full py-4 px-6 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-bold font-pixel text-lg rounded-3xl shadow-[0_0_15px_rgba(168,85,247,0.4)] border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 hover:brightness-110 hover:scale-105 transition-all duration-200 uppercase tracking-widest relative overflow-hidden group"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
                        Duel vs IA 🤖
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>
                </button>

                <div className="py-4 px-6 bg-white/10 text-pink-200/70 font-pixel text-xs rounded-3xl border border-white/10 uppercase tracking-widest cursor-not-allowed backdrop-blur-sm">
                    D'autres modes arrivent bientôt...
                </div>
            </div>

            {/* Credits or Info */}
            <div className="mt-8 text-white/80 text-lg font-bold drop-shadow-md max-w-md">
                <p>Testez vos connaissances sur vos Waifus préférées !</p>
            </div>
        </div>
    );
}
