import React from 'react';
import ArrowUp from './ArrowUp';
import ArrowDown from './ArrowDown';
import { compareWaifu, COMPARE_RESULT, RESULT_COLORS } from '../utils/gameLogic';

const getFontSize = (text) => {
    if (!text) return 'text-sm';
    const len = text.toString().length;
    // Aggressive sizing for 'Cormorant Garamond' to GUARANTEE fit
    // "High School DxD" (15 chars) needs to be tiny to fit on one line
    if (len >= 13) return 'text-[8px] sm:text-[9px] md:text-[10px] tracking-tighter leading-none';
    // "Junkertown" (10 chars), "Overwatch" (9 chars)
    if (len >= 9) return 'text-[9px] sm:text-[10px] md:text-[12px] tracking-tight leading-none';
    // Short words
    return 'text-[11px] sm:text-xs md:text-base tracking-normal leading-none';
};

const Cell = ({ result, content, suffix = '', delay = 0 }) => {
    let bgColor = RESULT_COLORS[COMPARE_RESULT.WRONG]; // Default Red

    if (result === COMPARE_RESULT.CORRECT) {
        bgColor = RESULT_COLORS[COMPARE_RESULT.CORRECT];
    } else if (result === COMPARE_RESULT.PARTIAL) {
        bgColor = RESULT_COLORS[COMPARE_RESULT.PARTIAL];
    }

    const displayContent = content === null || content === undefined ? '?' : content;
    const fullText = `${displayContent}${suffix}`;
    const fontSize = getFontSize(fullText);

    return (
        <div
            className={`relative flex flex-col items-center justify-center w-12 h-12 font-bold text-white border-2 border-white/20 rounded-md shadow-inner sm:w-16 sm:h-16 md:w-20 md:h-20 opacity-0 animate-pop-in overflow-hidden px-0.5 ${bgColor}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background Arrows */}
            {result === COMPARE_RESULT.HIGHER && (
                <ArrowUp className="absolute inset-0 w-full h-full text-red-900/60 pointer-events-none z-0" />
            )}
            {result === COMPARE_RESULT.LOWER && (
                <ArrowDown className="absolute inset-0 w-full h-full text-red-900/60 pointer-events-none z-0" />
            )}

            {/* Foreground Text */}
            <span className={`relative z-10 w-full text-center capitalize whitespace-nowrap drop-shadow-md px-0.5 ${fontSize}`}>
                {fullText}
            </span>
        </div>
    );
};

export default function GuessRow({ guess, target }) {
    const comparison = compareWaifu(guess, target);

    return (
        <div className="flex gap-1 mb-2 sm:gap-2 justify-center">
            {/* Sprite - Always Show */}
            <div className="flex items-center justify-center w-12 h-12 bg-white shadow-lg rounded-md sm:w-16 sm:h-16 md:w-20 md:h-20 opacity-0 animate-pop-in overflow-hidden" style={{ animationDelay: '0ms' }}>
                <img src={guess.image} alt={guess.name} className="w-full h-full object-cover" />
            </div>

            <Cell
                result={comparison.source}
                content={guess.source}
                delay={500}
            />
            <Cell
                result={comparison.hair_color}
                content={guess.hair_color}
                delay={1000}
            />
            <Cell
                result={comparison.eyes_color}
                content={guess.eyes_color}
                delay={1500}
            />
            <Cell
                result={comparison.affiliations}
                content={guess.affiliations}
                delay={2000}
            />
            <Cell
                result={comparison.age}
                content={guess.age}
                delay={2500}
            />
            <Cell
                result={comparison.height}
                content={guess.height}
                delay={3000}
            />
        </div>
    );
}
