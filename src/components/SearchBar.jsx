import React, { useState, useEffect, useRef } from 'react';
import waifuData from '../waifu_local.json';

export default function SearchBar({ onGuess, usedIds }) {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        if (query.length > 0) {
            const filtered = waifuData.filter(w =>
                w.name.toLowerCase().includes(query.toLowerCase()) &&
                !usedIds.has(w.id)
            ).slice(0, 10);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [query, usedIds]);

    const handleSelect = (waifu) => {
        onGuess(waifu);
        setQuery('');
        setShowSuggestions(false);
    };

    return (
        <div className="relative w-full max-w-md mx-auto mb-6 z-50" ref={wrapperRef}>
            <input
                type="text"
                className="w-full p-4 text-black bg-white rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 font-pixel capitalize"
                placeholder="Tapez le nom d'une Waifu..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length > 0 && setShowSuggestions(true)}
            />

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-2 overflow-hidden bg-white rounded-lg shadow-2xl animate-fade-in">
                    {suggestions.map((w) => (
                        <li
                            key={w.id}
                            className="flex items-center gap-3 p-3 text-black transition-colors border-b cursor-pointer hover:bg-gray-100 last:border-b-0"
                            onClick={() => handleSelect(w)}
                        >
                            <img src={w.image} alt={w.name} className="w-10 h-10 object-contain" />
                            <span className="font-bold capitalize font-pixel">{w.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
