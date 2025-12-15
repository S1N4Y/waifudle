import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import ClassicGame from './components/ClassicGame';
import VsComputerGame from './components/VsComputerGame';
import MangaMenu from './components/MangaMenu';

export default function App() {
    const [currentView, setCurrentView] = useState('menu');
    const [selectedSource, setSelectedSource] = useState(null);

    const handleBackToMenu = () => {
        setCurrentView('menu');
        setSelectedSource(null);
    };

    const handleMangaStart = (source) => {
        setSelectedSource(source);
        setCurrentView('classic_filtered');
    };

    return (
        <div className="flex flex-col min-h-screen pb-10 items-center pt-10 relative">
            {/* Overlay Vignette Custom CSS */}
            <div className="fixed inset-0 pointer-events-none z-0 vignette-overlay"></div>

            <div className="w-full max-w-4xl mx-auto z-10 relative px-2">

                {currentView === 'menu' && (
                    <MainMenu
                        onStartClassic={() => { setSelectedSource(null); setCurrentView('classic'); }}
                        onStartDuel={() => setCurrentView('duel')}
                        onStartManga={() => setCurrentView('manga_menu')}
                    />
                )}

                {currentView === 'manga_menu' && (
                    <MangaMenu
                        onSelectManga={handleMangaStart}
                        onBack={handleBackToMenu}
                    />
                )}

                {(currentView === 'classic' || currentView === 'classic_filtered') && (
                    <ClassicGame
                        onBackToMenu={handleBackToMenu}
                        filterSource={selectedSource}
                    />
                )}

                {currentView === 'duel' && (
                    <VsComputerGame onBackToMenu={handleBackToMenu} />
                )}

            </div>

            {/* Fixed Footer */}
            <footer className="fixed bottom-2 left-0 right-0 text-center text-white/80 drop-shadow-md text-sm font-bold z-0">
                <p>WaifuDLE - Fait pour le fun</p>
            </footer>
        </div>
    );
}
