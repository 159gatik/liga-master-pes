"use client";
import { useState } from "react";
import ContenedorLiga from "../components/ContenedorLiga";
import ContenedorCopa from "../components/ContenedorCopa";

export default function FixturePage() {
    const [activeTab, setActiveTab] = useState<'liga' | 'copa'>('liga');

    return (
        // Quitamos p-6 por p-4 para dejar más espacio en móviles
        <main className="min-h-screen bg-[#0a0a0a] p-4 md:p-10 text-white w-full overflow-x-hidden">

            {/* TABS: Ajustamos a text-2xl para móviles */}
            <div className="flex justify-center gap-6 mb-8">
                <button onClick={() => setActiveTab('liga')}
                    className={`font-bebas text-2xl md:text-4xl transition-all ${activeTab === 'liga' ? 'text-[#c9a84c]' : 'text-gray-700'}`}>
                    LIGA
                </button>
                <button onClick={() => setActiveTab('copa')}
                    className={`font-bebas text-2xl md:text-4xl transition-all ${activeTab === 'copa' ? 'text-[#c9a84c]' : 'text-gray-700'}`}>
                    COPA
                </button>
            </div>

            {/* w-full asegura que no se desborde */}
            <div className="w-full max-w-6xl mx-auto">
                {activeTab === 'liga' ? <ContenedorLiga /> : <ContenedorCopa />}
            </div>
        </main>
    );
}