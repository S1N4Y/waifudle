import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import ClassicGame from './components/ClassicGame';
import VsComputerGame from './components/VsComputerGame';

export default function App() {
    const [currentView, setCurrentView] = useState('menu');

    return (
        <div className="flex flex-col min-h-screen pb-10 items-center pt-10 relative">
            {/* Overlay Vignette Custom CSS */}
            <div className="fixed inset-0 pointer-events-none z-0 vignette-overlay"></div>

            <div className="w-full max-w-4xl mx-auto z-10 relative px-2">

                {currentView === 'menu' && (
                    <MainMenu
                        onStartClassic={() => setCurrentView('classic')}
                        onStartDuel={() => setCurrentView('duel')}
                    />
                )}

                {currentView === 'classic' && (
                    <ClassicGame onBackToMenu={() => setCurrentView('menu')} />
                )}

                {currentView === 'duel' && (
                    <VsComputerGame onBackToMenu={() => setCurrentView('menu')} />
                )}

            </div>

            <footer className="mt-10 text-center text-white/80 drop-shadow-md text-xs relative">
                <p>WaifuDLE - Fait pour le fun</p>
            </footer>
        </div>
    );
}
