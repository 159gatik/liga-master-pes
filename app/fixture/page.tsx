"use client";
import { useState } from "react";
import ContenedorLiga from "../components/ContenedorLiga";
import ContenedorCopa from "../components/ContenedorCopa";

export default function FixturePage() {
    const [activeTab, setActiveTab] = useState<'liga' | 'copa'>('liga');

    return (
        <main className="min-h-screen bg-[#0a0a0a] p-6 text-white">
            {/* TABS */}
            <div className="flex justify-center gap-8 mb-10">
                <button onClick={() => setActiveTab('liga')}
                    className={`font-bebas text-3xl ${activeTab === 'liga' ? 'text-[#c9a84c]' : 'text-gray-700'}`}>
                    LIGA
                </button>
                <button onClick={() => setActiveTab('copa')}
                    className={`font-bebas text-3xl ${activeTab === 'copa' ? 'text-[#c9a84c]' : 'text-gray-700'}`}>
                    COPA
                </button>
            </div>

            {/* AQUÍ ESTÁ LA MAGIA: El componente cambia según el estado */}
            <div className="max-w-6xl mx-auto">
                {activeTab === 'liga' ? <ContenedorLiga /> : <ContenedorCopa />}
            </div>
        </main>
    );
}