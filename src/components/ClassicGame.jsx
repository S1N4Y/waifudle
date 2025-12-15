import React, { useState, useEffect } from 'react';
import waifuData from '../waifu_local.json';
import SearchBar from './SearchBar';
import GuessGrid from './GuessGrid';
import WinModal from './WinModal';
import { supabase } from '../lib/supabaseClient';

function getRandomWaifu() {
    const randomIndex = Math.floor(Math.random() * waifuData.length);
    return waifuData[randomIndex];
}

export default function ClassicGame({ onBackToMenu, filterSource }) {
    const [targetWaifu, setTargetWaifu] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [showWinModal, setShowWinModal] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize Game
    useEffect(() => {
        // Check local storage for existing session
        // Note: For Manga Mode, we might want to skip local storage or namespace it, 
        // but for now simplistic approach: if filterSource changes, we force new game.
        const savedState = localStorage.getItem('waifudle-state');

        // If we are in "Filter Mode", we ignore previous generic saved games to avoid conflicts
        // OR we verify if the saved target matches the filter.
        let validSave = false;
        if (savedState) {
            const parsed = JSON.parse(savedState);
            if (!filterSource) {
                // Classic mode: valid if saved game valid
                validSave = true;
            } else {
                // Filter mode: check if saved waifu matches current filter
                if (parsed.target.source === filterSource) {
                    validSave = true;
                }
            }

            if (validSave) {
                setTargetWaifu(parsed.target);
                setGuesses(parsed.guesses);
                setHasWon(parsed.hasWon);
                setShowWinModal(parsed.hasWon);
            }
        }

        if (!validSave) {
            // Start new game
            let pool = waifuData;
            if (filterSource) {
                pool = waifuData.filter(w => w.source === filterSource);
                if (pool.length === 0) pool = waifuData; // Fallback if typo
            }

            const randomWaifu = pool[Math.floor(Math.random() * pool.length)];
            setTargetWaifu(randomWaifu);
            setGuesses([]);
            setHasWon(false);
            setShowWinModal(false);
        }
        setIsLoaded(true);
    }, [filterSource]); // Re-run if filterSource changes

    // Save state on change
    useEffect(() => {
        if (!targetWaifu) return;

        localStorage.setItem('waifudle-state', JSON.stringify({
            target: targetWaifu,
            guesses: guesses,
            hasWon: hasWon
        }));
    }, [targetWaifu, guesses, hasWon]);

    const handleGuess = async (waifu) => {
        if (hasWon) return;

        const newGuesses = [...guesses, waifu];
        setGuesses(newGuesses);

        const win = waifu.id === targetWaifu.id;
        if (win) {
            setHasWon(true);

            // Wait for 3.5s animation to finish before showing modal/updating stats
            setTimeout(async () => {
                const recordBroken = await updateGlobalStats(newGuesses.length);
                if (recordBroken) {
                    setIsNewRecord(true);
                }
                setShowWinModal(true);
            }, 3500);
        }
    };

    const updateGlobalStats = async (score) => {
        if (!supabase) return false;

        try {
            // 1. Get current stats
            const { data: currentRecord, error: fetchError } = await supabase
                .from('global_records')
                .select('*')
                .eq('id', 1)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error("Error fetching stats:", fetchError);
                return;
            }

            let newWins = 1;
            let isRecord = false;

            // 2. Handle Record Breaking
            // Return true if it's a record so we can show the input in the modal
            // ONLY if NOT in filter mode
            if (!filterSource) {
                if (currentRecord) {
                    // Strict less than for new record, or if no score set yet (999)
                    if (score <= currentRecord.best_score || currentRecord.best_score === 999) {
                        isRecord = true;
                    }
                } else {
                    // First ever run
                    isRecord = true;
                }
            }

            if (currentRecord) {
                // Always increment wins regardless of mode
                newWins = currentRecord.global_wins + 1;

                await supabase
                    .from('global_records')
                    .update({ global_wins: newWins })
                    .eq('id', 1);
            } else {
                // If no record exists, create one
                // (Though if in filter mode, we create it but don't set a "best_score" technically? 
                // Actually it defaults to 999 so it's fine)
                await supabase
                    .from('global_records')
                    .insert([{
                        id: 1, // Global fixed ID
                        global_wins: 1,
                        best_score: 999, // Temp score until name entered
                        holder_name: 'Personne',
                        record_timestamp: new Date().toISOString()
                    }]);
            }

            return isRecord;
        } catch (e) {
            console.error("Supabase Error:", e);
            alert("Erreur de sauvegarde : " + (e.message || JSON.stringify(e)));
            return false;
        }
    };

    const handleRecordSubmit = async (name) => {
        if (!supabase) return;

        const score = guesses.length;

        try {
            await supabase
                .from('global_records')
                .update({
                    best_score: score,
                    holder_name: name.substring(0, 15),
                    record_timestamp: new Date().toISOString()
                })
                .eq('id', 1);
        } catch (e) {
            console.error("Error updating record name:", e);
            alert("Erreur lors de l'enregistrement du nom.");
        }
    };

    const handleRestart = () => {
        setGuesses([]);
        setHasWon(false);
        setShowWinModal(false);
        setIsNewRecord(false);
        setTargetWaifu(getRandomWaifu());
        localStorage.removeItem('waifudle-state');
    };

    const handleWinAndExit = () => {
        localStorage.removeItem('waifudle-state');
        onBackToMenu();
    };

    if (!isLoaded || !targetWaifu) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;

    const usedIds = new Set(guesses.map(g => g.id));

    // Filter the search pool if a source filter is active
    const availableCandidates = filterSource
        ? waifuData.filter(w => w.source === filterSource)
        : waifuData;

    return (
        <div className="w-full animate-pop-in">
            <header className="py-4 mb-6 text-center border-b border-white/10 flex flex-col items-center">
                <button
                    onClick={onBackToMenu}
                    className="focus:outline-none"
                    title="Retour au menu"
                >
                    <img src="/waifudle_logo.png" alt="WaifuDLE" className="h-32 md:h-48 object-contain drop-shadow-2xl smooth-render hover:scale-105 transition-transform duration-300" />
                </button>
                <p className="mt-2 text-white/90 drop-shadow-md">
                    {filterSource ? `Mode ${filterSource}` : "Devinez la Waifu !"}
                </p>
            </header>

            <main className="flex-grow">
                {!hasWon && (
                    <SearchBar
                        onGuess={handleGuess}
                        usedIds={usedIds}
                        candidates={availableCandidates}
                    />
                )}

                <GuessGrid guesses={guesses} target={targetWaifu} />

                {showWinModal && (
                    <WinModal
                        waifu={targetWaifu}
                        guessCount={guesses.length}
                        onRestart={handleRestart}
                        isNewRecord={isNewRecord}
                        onRecordSubmit={handleRecordSubmit}
                        onBackToMenu={handleWinAndExit}
                    />
                )}
            </main>
        </div>
    );
}
