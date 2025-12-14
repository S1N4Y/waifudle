import React from 'react';
import GuessRow from './GuessRow';

export default function GuessGrid({ guesses, target }) {
    // Hardcoded headers for the grid
    const headers = [
        "Waifu", "Source", "Cheveux", "Yeux", "Affiliation", "Age", "Taille"
    ];

    return (
        <div className="w-full max-w-5xl px-1 mx-auto">
            {/* Grid Header */}
            <div className="flex justify-center gap-1 mb-2 text-xs font-bold text-white drop-shadow-md capitalize sm:gap-2 sm:text-sm md:text-base tracking-widest">
                <div className="w-12 text-center whitespace-nowrap sm:w-16 md:w-20">Waifu</div>
                <div className="w-12 text-center whitespace-nowrap sm:w-16 md:w-20">Source</div>
                <div className="w-12 text-center whitespace-nowrap sm:w-16 md:w-20">Cheveux</div>
                <div className="w-12 text-center whitespace-nowrap sm:w-16 md:w-20">Yeux</div>
                <div className="w-12 text-center whitespace-nowrap sm:w-16 md:w-20">Affiliation</div>
                <div className="w-12 text-center whitespace-nowrap sm:w-16 md:w-20">Age</div>
                <div className="w-12 text-center whitespace-nowrap sm:w-16 md:w-20">Taille</div>
            </div>

            {/* Rows */}
            <div className="flex flex-col-reverse">
                {guesses.map((guess, idx) => (
                    <GuessRow key={`${guess.id}-${idx}`} guess={guess} target={target} />
                ))}
            </div>
        </div>
    );
}
