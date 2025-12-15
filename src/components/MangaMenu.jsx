import React from 'react';

const MANGA_LIST = [
    "Dragon Ball",
    "Fairy Tail",
    "High School DxD",
    "My Hero Academia",
    "Naruto",
    "One Piece",
    "Overwatch"
];

export default function MangaMenu({ onSelectManga, onBack }) {
    return (
        <div className="flex flex-col items-center justify-start text-center space-y-8 animate-pop-in relative z-10 w-full max-w-4xl mx-auto">
            {/* Header with Logo as Back Button */}
            <header className="py-4 mb-2 text-center flex flex-col items-center">
                <button
                    onClick={onBack}
                    className="focus:outline-none"
                    title="Retour au menu"
                >
                    <img src="/waifudle_logo.png" alt="WaifuDLE" className="h-32 md:h-48 object-contain drop-shadow-2xl smooth-render hover:scale-105 transition-transform duration-300" />
                </button>
                <h2 className="mt-4 text-2xl md:text-4xl font-bold text-white font-pixel drop-shadow-lg uppercase tracking-widest">
                    CHOISIS TON UNIVERS
                </h2>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full px-4">
                {MANGA_LIST.map((manga) => (
                    <button
                        key={manga}
                        onClick={() => onSelectManga(manga)}
                        className="py-4 px-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold font-pixel text-sm md:text-base rounded-2xl shadow-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 hover:brightness-125 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] hover:scale-105 transition-all duration-200 uppercase tracking-wider"
                    >
                        {manga}
                    </button>
                ))}
            </div>
        </div>
    );
}
