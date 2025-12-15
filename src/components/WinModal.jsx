import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';

export default function WinModal({ waifu, guessCount, onRestart, isNewRecord, onRecordSubmit, onBackToMenu }) {
    const [name, setName] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onRecordSubmit(name);
            setSubmitted(true);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-base">
            <div className="relative w-full max-w-md p-8 text-center bg-gray-800 border-4 border-yellow-500 rounded-xl shadow-2xl">
                <h2 className="mb-4 text-3xl font-bold text-yellow-400 font-pixel animate-bounce">
                    {isNewRecord ? 'NOUVEAU RECORD !' : 'VICTOIRE !'}
                </h2>

                <div className="relative flex justify-center mb-6">
                    <div className="absolute inset-0 bg-yellow-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
                    <img
                        src={waifu.image}
                        alt={waifu.name}
                        className="relative z-10 object-contain w-48 h-48 drop-shadow-2xl"
                    />
                </div>

                <p className="mb-2 text-xl text-white font-pixel">
                    C'était <span className="text-yellow-400">{waifu.name}</span> !
                </p>

                <p className="mb-6 text-gray-300">
                    Trouvé en <span className="font-bold text-white">{guessCount}</span> essais.
                </p>

                {isNewRecord && !submitted && (
                    <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 animate-fade-in w-full">
                        <p className="text-sm text-yellow-300 font-pixel">Champion ! Entre ton pseudo :</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 px-4 py-2 text-center text-white bg-gray-700/50 rounded border-2 border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 font-pixel min-w-0 placeholder-gray-400"
                                placeholder="Pseudo..."
                                maxLength={15}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="px-3 py-2 bg-green-500 text-white font-bold rounded shadow hover:bg-green-600 disabled:opacity-50 font-pixel whitespace-nowrap text-xs sm:text-sm"
                            >
                                OK
                            </button>
                        </div>
                    </form>
                )}

                {isNewRecord && submitted && (
                    <p className="mb-6 text-green-400 font-pixel animate-pulse">Record enregistré !</p>
                )}

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={onRestart}
                        className="px-8 py-3 text-lg font-bold text-black transition-transform transform bg-yellow-400 rounded-lg shadow-lg hover:bg-yellow-300 hover:scale-105 active:scale-95 font-pixel w-full"
                    >
                        REJOUER
                    </button>
                    <button
                        onClick={onBackToMenu}
                        className="px-8 py-2 text-sm font-bold text-white transition-transform transform bg-gray-600 rounded-lg shadow hover:bg-gray-500 hover:scale-105 active:scale-95 font-pixel w-full"
                    >
                        MENU PRINCIPAL
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
