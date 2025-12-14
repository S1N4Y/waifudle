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

export default function ClassicGame({ onBackToMenu }) {
    const [targetWaifu, setTargetWaifu] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [showWinModal, setShowWinModal] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize Game
    useEffect(() => {
        // Check local storage for existing session
        const savedState = localStorage.getItem('waifudle-state');

        if (savedState) {
            const parsed = JSON.parse(savedState);
            setTargetWaifu(parsed.target);
            setGuesses(parsed.guesses);
            setHasWon(parsed.hasWon);
            setShowWinModal(parsed.hasWon); // Show immediately if reloading a won game
        } else {
            // Start new game
            setTargetWaifu(getRandomWaifu());
        }
        setIsLoaded(true);
    }, []);

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

            if (currentRecord) {
                newWins = currentRecord.global_wins + 1;
                // Strict less than for new record, or if no score set yet (999)
                if (score <= currentRecord.best_score || currentRecord.best_score === 999) {
                    isRecord = true;
                }

                // Update wins
                await supabase
                    .from('global_records')
                    .update({ global_wins: newWins })
                    .eq('id', 1);
            } else {
                // No global record exists yet (first ever run), create it
                isRecord = true;
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

            // 2. Handle Record Breaking
            // Return true if it's a record so we can show the input in the modal
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

    return (
        <div className="w-full">
            <header className="py-4 mb-6 text-center border-b border-white/10 flex flex-col items-center">
                <button
                    onClick={onBackToMenu}
                    className="focus:outline-none hover:scale-105 transition-transform duration-200"
                    title="Retour au menu"
                >
                    <img src="/waifudle_logo.png" alt="WaifuDLE" className="h-24 md:h-32 object-contain drop-shadow-xl animate-pop-in smooth-render" />
                </button>
                <p className="mt-2 text-white/90 drop-shadow-md">Devinez la Waifu !</p>
            </header>

            <main className="flex-grow">
                {!hasWon && (
                    <SearchBar onGuess={handleGuess} usedIds={usedIds} />
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
