import React, { useState, useEffect, useRef } from 'react';
import waifuData from '../waifu_local.json';
import { compareWaifu } from '../utils/gameLogic';
import SearchBar from './SearchBar';
import GuessRow from './GuessRow';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabaseClient';

// --- Rules Modal Component ---
const RulesModal = ({ onStart }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-lg p-8 text-center bg-gray-900 border-4 border-red-600 rounded-xl shadow-2xl">
                <h2 className="mb-6 text-2xl md:text-3xl font-bold text-red-500 font-pixel uppercase tracking-widest animate-pulse">
                    Duel vs IA
                </h2>
                <div className="text-left bg-black/40 p-6 rounded-lg border border-white/10 mb-8 space-y-4 text-sm md:text-base text-gray-300 font-mono">
                    <p className="flex items-start gap-3">
                        <span className="text-red-500 text-xl">⚔️</span>
                        <span>Vous et l'IA cherchez la <strong className="text-white">MÊME</strong> Waifu mystère.</span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="text-blue-400 text-xl">🧠</span>
                        <span>La grille est <strong className="text-white">commune</strong> : les indices de l'un aident l'autre.</span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="text-yellow-400 text-xl">⚡</span>
                        <span>L'IA analyse vos coups pour éliminer les impossibilités.</span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="text-green-500 text-xl">🏆</span>
                        <span>Le premier qui trouve a gagné !</span>
                    </p>
                </div>
                <p className="mb-4 text-white font-pixel text-sm">Qui commence ?</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => onStart('player')}
                        className="flex-1 py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg font-pixel transition-transform hover:scale-105 active:scale-95 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                    >
                        Moi (Joueur)
                    </button>
                    <button
                        onClick={() => onStart('computer')}
                        className="flex-1 py-4 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg font-pixel transition-transform hover:scale-105 active:scale-95 border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
                    >
                        L'IA (Robot)
                    </button>
                </div>
            </div>
        </div>
    );
};

const getAllWaifu = () => [...waifuData];

// --- AI Brain Logic ---
const calculateBestGuess = (candidates, history) => {
    const validCandidates = candidates.filter(candidate => {
        return history.every(guessRecord => {
            const simulatedComparison = compareWaifu(guessRecord.waifu, candidate);
            return isComparisonConsistent(simulatedComparison, guessRecord.comparison);
        });
    });

    if (validCandidates.length === 0) {
        console.warn("AI found 0 valid candidates. Falling back to random.");
        return candidates[Math.floor(Math.random() * candidates.length)];
    }
    console.log(`AI Thinking: ${validCandidates.length} possibilities left.`);
    return validCandidates[Math.floor(Math.random() * validCandidates.length)];
};

const isComparisonConsistent = (simulated, actual) => {
    return (
        simulated.source === actual.source &&
        simulated.hair_color === actual.hair_color &&
        simulated.eyes_color === actual.eyes_color &&
        simulated.age === actual.age &&
        simulated.height === actual.height &&
        simulated.name_length === actual.name_length
    );
};

export default function VsComputerGame({ onBackToMenu }) {
    const [phase, setPhase] = useState('rules');
    const [turn, setTurn] = useState('player');
    const [targetWaifu, setTargetWaifu] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [winner, setWinner] = useState(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Refs for AI reliability
    const guessesRef = useRef(guesses);
    const candidatesRef = useRef(candidates);

    // Sync Refs on every render (or effect change)
    useEffect(() => {
        guessesRef.current = guesses;
        candidatesRef.current = candidates;
    }, [guesses, candidates]);

    // Initialization
    useEffect(() => {
        setTargetWaifu(waifuData[Math.floor(Math.random() * waifuData.length)]);
        setCandidates(getAllWaifu());
    }, []);

    // FIX: Patch existing guesses that might lack uniqueId (legacy session support)
    useEffect(() => {
        if (guesses.some(g => !g.uniqueId)) {
            setGuesses(prev => prev.map((g, index) => ({
                ...g,
                uniqueId: g.uniqueId || `${g.waifu.id}-${index}-${Date.now()}`
            })));
        }
    }, [guesses]);

    // --- AI Turn Effect ---
    useEffect(() => {
        let timer;

        // Wait for animation to finish AND for AI turn
        if (phase === 'playing' && turn === 'computer' && !isAiThinking && !isAnimating) {
            setIsAiThinking(true);

            timer = setTimeout(() => {
                try {
                    // AI Logic uses REFS to get latest data without breaking timer
                    const currentGuesses = guessesRef.current;
                    const currentCandidates = candidatesRef.current;

                    const bestGuessWaifu = calculateBestGuess(currentCandidates, currentGuesses);

                    if (!bestGuessWaifu) {
                        const random = currentCandidates[Math.floor(Math.random() * currentCandidates.length)];
                        processGuess(random, 'computer');
                    } else {
                        processGuess(bestGuessWaifu, 'computer');
                    }
                } catch (error) {
                    console.error("AI Crash:", error);
                    alert("L'IA a planté : " + error.message);
                    setIsAiThinking(false);
                }
            }, 2000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, turn, isAnimating]); // Removed guesses/candidates/isAiThinking to prevent cancellation

    const handleStart = (startingTurn) => {
        setTurn(startingTurn);
        setPhase('playing');
    };

    const handlePlayerGuess = (waifu) => {
        if (turn !== 'player' || phase !== 'playing' || isAnimating) return;
        processGuess(waifu, 'player');
    };

    const processGuess = (waifu, author) => {
        const comparison = compareWaifu(waifu, targetWaifu);
        const guessId = `${waifu.id}-${Date.now()}`;
        const newGuess = { waifu, author, comparison, uniqueId: guessId };

        setIsAnimating(true);

        // Update State
        const newGuesses = [...guesses, newGuess];
        setGuesses(newGuesses);

        // Update Refs Immediately (though effect handles it too, redundancy is safe)
        guessesRef.current = newGuesses;

        if (waifu.id === targetWaifu.id) {
            // Wait for animation (3500ms) before showing Game Over modal
            setTimeout(() => {
                handleGameOver(author);
            }, 3500);
        } else {
            // Wait for 3500ms (animation duration) before switching turn
            setTimeout(() => {
                setTurn(author === 'player' ? 'computer' : 'player');
                setIsAnimating(false);
            }, 3500);
        }
        setIsAiThinking(false);
    };

    const handleGameOver = async (winnerName) => {
        setWinner(winnerName);
        setPhase('gameover');
        if (winnerName === 'player') {
            confetti();
            // Update global stats (wins only)
            await updateGlobalStats();
        }
        setIsAiThinking(false);
        setIsAnimating(false);
    };

    const updateGlobalStats = async () => {
        if (!supabase) return;
        try {
            const { data: currentRecord } = await supabase
                .from('global_records')
                .select('global_wins')
                .eq('id', 1)
                .single();

            if (currentRecord) {
                await supabase
                    .from('global_records')
                    .update({ global_wins: currentRecord.global_wins + 1 })
                    .eq('id', 1);
            }
        } catch (e) {
            console.error("Error updating stats:", e);
        }
    };

    const handleRestart = () => {
        setTargetWaifu(waifuData[Math.floor(Math.random() * waifuData.length)]);
        setGuesses([]);
        setCandidates(getAllWaifu());
        setWinner(null);
        setPhase('rules');
        setIsAnimating(false);
        setIsAiThinking(false);
    };

    const usedIds = new Set(guesses.map(g => g.waifu.id));

    return (
        <div className="w-full relative min-h-screen">
            <header className="py-4 mb-6 text-center border-b border-white/10 flex flex-col items-center">
                <button
                    onClick={onBackToMenu}
                    className="focus:outline-none"
                    title="Retour au menu"
                >
                    <img src="/waifudle_logo.png" alt="WaifuDLE" className="h-32 md:h-48 object-contain drop-shadow-2xl smooth-render hover:scale-105 transition-transform duration-300" />
                </button>
                <div className="mt-2 flex items-center gap-3">
                    <span className="text-red-500 font-pixel text-xs md:text-sm">MODE DUEL VS IA</span>
                    {phase === 'playing' && (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold transition-colors duration-500 ${turn === 'player' ? 'bg-blue-600 text-white animate-pulse' : 'bg-red-600 text-white'}`}>
                            {turn === 'player' ? "C'est à votre tour" : "L'IA réfléchit..."}
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-grow pb-20">
                {phase === 'rules' && (
                    <RulesModal onStart={handleStart} />
                )}

                <div className={`relative z-50 transition-all duration-300 ${phase === 'rules' ? 'opacity-0 pointer-events-none' : (turn === 'player' && phase === 'playing' ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none translate-y-2')}`}>
                    <SearchBar onGuess={handlePlayerGuess} usedIds={usedIds} disabled={turn !== 'player'} />
                </div>

                <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-1 sm:px-4 gap-1 sm:gap-2 mt-4">
                    {/* Header Row */}
                    <div className="flex items-center gap-2 w-full justify-center mb-1">
                        {/* Spacer for the Author Icon (w-8) */}
                        <div className="w-8 shrink-0"></div>

                        {/* Column Headers */}
                        <div className="flex justify-center gap-1 text-[10px] sm:text-xs md:text-sm font-bold text-white/80 uppercase tracking-widest sm:gap-2">
                            <div className="w-12 text-center sm:w-16 md:w-20">Waifu</div>
                            <div className="w-12 text-center sm:w-16 md:w-20">Source</div>
                            <div className="w-12 text-center sm:w-16 md:w-20">Cheveux</div>
                            <div className="w-12 text-center sm:w-16 md:w-20">Yeux</div>
                            <div className="w-12 text-center sm:w-16 md:w-20">Affi.</div>
                            <div className="w-12 text-center sm:w-16 md:w-20">Age</div>
                            <div className="w-12 text-center sm:w-16 md:w-20">Taille</div>
                        </div>
                    </div>

                    {guesses.slice().reverse().map((guessRecord) => (
                        <div key={guessRecord.uniqueId} className="flex items-center gap-2 animate-pop-in w-full justify-center">
                            <div
                                className={`text-xl sm:text-2xl drop-shadow-md w-8 text-center flex-shrink-0 animate-bounce-short ${guessRecord.author === 'player' ? 'text-blue-400' : 'text-red-500'}`}
                                title={guessRecord.author === 'player' ? "Joueur" : "IA"}
                            >
                                {guessRecord.author === 'player' ? '👤' : '🤖'}
                            </div>
                            <GuessRow guess={guessRecord.waifu} target={targetWaifu} />
                        </div>
                    ))}
                </div>

                {phase === 'gameover' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className={`relative w-full max-w-md p-8 text-center border-4 rounded-xl shadow-2xl ${winner === 'player' ? 'bg-gray-800 border-green-500' : 'bg-gray-900 border-red-600'}`}>
                            <h2 className={`mb-4 text-3xl font-bold font-pixel animate-bounce ${winner === 'player' ? 'text-green-400' : 'text-red-500'}`}>
                                {winner === 'player' ? 'VICTOIRE !' : 'DÉFAITE ...'}
                            </h2>
                            <p className="text-white mb-6 font-bold">
                                {winner === 'player' ? "Vous avez vaincu l'Intelligence Artificielle !" : "L'IA a trouvé la Waifu avant vous."}
                            </p>

                            <div className="relative flex justify-center mb-6">
                                <div className={`absolute inset-0 rounded-full opacity-20 blur-xl animate-pulse ${winner === 'player' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <img src={targetWaifu?.image} alt={targetWaifu?.name} className="relative z-10 w-40 h-40 object-contain drop-shadow-lg" />
                            </div>
                            <p className="text-white font-pixel mb-8 capitalize text-lg">
                                C'était <span className={winner === 'player' ? 'text-green-400' : 'text-red-400'}>{targetWaifu?.name}</span> !
                            </p>

                            <div className="flex flex-col gap-3">
                                <button onClick={handleRestart} className="px-8 py-3 bg-white text-black font-bold rounded font-pixel hover:scale-105 transition-transform">
                                    {winner === 'player' ? 'REJOUER' : 'REVANCHE'}
                                </button>
                                <button onClick={onBackToMenu} className="px-8 py-2 bg-gray-700 text-white font-bold rounded font-pixel hover:bg-gray-600">
                                    MENU PRINCIPAL
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
