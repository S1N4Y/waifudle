import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CommunityDashboard() {
    const [stats, setStats] = useState({
        global_wins: 0,
        best_score: '-',
        holder_name: 'Personne',
        record_timestamp: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch immediately
        fetchStats();

        // Optional: Subscribe to realtime changes
        let subscription = null;
        if (supabase) {
            subscription = supabase
                .channel('global_records_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'global_records' }, payload => {
                    console.log('Realtime update received:', payload);
                    fetchStats(); // working simple: refetch on any change
                })
                .subscribe();
        }

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const fetchStats = async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('global_records')
            .select('*')
            .eq('id', 1)
            .single();

        if (data) {
            setStats(data);
        } else if (error && error.code === 'PGRST116') {
            // Row not found, implies no global record initialized yet
            setStats({
                global_wins: 0,
                best_score: '-',
                holder_name: 'Personne',
                record_timestamp: null
            });
        }
        setLoading(false);
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'à l\'instant';
        if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
        return `il y a ${Math.floor(diffInSeconds / 3600)} h`;
    };

    if (loading) return <div className="animate-pulse h-20 w-full max-w-2xl bg-black/20 rounded-xl"></div>;

    return (
        <div className="w-full max-w-2xl bg-pink-900/40 backdrop-blur-md border border-pink-300/30 rounded-3xl flex flex-col text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] relative overflow-hidden animate-pop-in">
            {/* Glass shine effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent opacity-50 z-10"></div>

            <div className="grid grid-cols-1 sm:grid-cols-3 w-full divide-y sm:divide-y-0 sm:divide-x divide-white/10 p-2">
                {/* Global Wins */}
                <div className="flex flex-col items-center justify-center p-1">
                    <img src="/icon_planet_pixel.png" alt="Global Wins" className="w-10 h-10 object-contain mb-0 smooth-render drop-shadow-md" />
                    <span className="text-3xl font-bold font-pixel text-pink-200 mt-0 drop-shadow-sm">{stats.global_wins}</span>
                    <span className="text-xs sm:text-sm uppercase tracking-wider opacity-90 text-pink-100 font-bold mt-0">Victoires Globales</span>
                </div>

                {/* Daily Record */}
                <div className="flex flex-col items-center justify-center p-1">
                    <img src="/icon_trophy_pixel.png" alt="Record" className="w-10 h-10 object-contain mb-0 smooth-render drop-shadow-md" />
                    <span className="text-3xl font-bold font-pixel text-pink-200 mt-0 drop-shadow-sm">{stats.best_score === 999 ? '-' : stats.best_score}</span>
                    <span className="text-xs sm:text-sm uppercase tracking-wider opacity-90 text-pink-100 font-bold mt-0">Record Essais</span>
                </div>

                {/* Holder */}
                <div className="flex flex-col items-center justify-center p-1">
                    <img src="/icon_crown_pixel.png" alt="Holder" className="w-10 h-10 object-contain mb-0 -mt-1 smooth-render drop-shadow-md" />
                    <span className="text-xl font-bold mt-0 truncate max-w-[180px] text-pink-100">{stats.holder_name}</span>
                    <span className="text-xs opacity-80 text-pink-200 mt-0">{stats.record_timestamp ? formatTimeAgo(stats.record_timestamp) : 'En attente...'}</span>
                </div>
            </div>
        </div>
    );
}
