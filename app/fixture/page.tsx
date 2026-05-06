"use client";
import { useState } from "react";
import ContenedorLiga from "../components/ContenedorLiga";
import ContenedorCopa from "../components/ContenedorCopa";

// --- INTERFACES ---
interface FixtureState {
    activeTab: 'liga' | 'copa';
    divisionTab: 'A' | 'B';
}

export default function FixturePage() {
    // Manejo de estados para Tabs Principales y Sub-Tabs de Divisiones
    const [activeTab, setActiveTab] = useState<FixtureState['activeTab']>('liga');
    const [divisionTab, setDivisionTab] = useState<FixtureState['divisionTab']>('A');

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans selection:bg-[#c9a84c] selection:text-black overflow-x-hidden">

            {/* 1. HEADER MASIVO (Estilo Webild) */}
            <header className="relative pt-24 pb-12 px-6 border-b border-white/5 bg-gradient-to-b from-[#111] to-[#0a0a0a]">
                <div className="max-w-[1400px] mx-auto relative">
                    {/* Texto de fondo transparente / Marca de agua */}
                    <div className="absolute -top-16 -left-10 font-bebas text-[22vw] text-white/[0.02] pointer-events-none select-none uppercase italic leading-none whitespace-nowrap">
                        {activeTab === 'liga' ? 'League' : 'Trophy'}
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-[2px] bg-[#c9a84c]"></div>
                            <span className="text-[#c9a84c] font-barlow text-sm tracking-[10px] uppercase animate-pulse">
                                Temporada Oficial 2026
                            </span>
                        </div>
                        <h1 className="font-bebas text-7xl md:text-9xl tracking-tighter leading-none uppercase italic">
                            {activeTab === 'liga' ? 'Calendario ' : 'Calendario '}
                            <span className="text-[#c9a84c] not-italic">Competitivo</span>
                        </h1>
                    </div>
                </div>
            </header>

            {/* 2. BARRA DE NAVEGACIÓN PRINCIPAL (LIGA vs COPA) */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 py-6 px-6">
                <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-10">

                    {/* Main Tabs con Skew */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => setActiveTab('liga')}
                            className={`font-bebas text-2xl md:text-4xl px-12 py-3 skew-x-[-15deg] transition-all duration-500 border-2 ${activeTab === 'liga'
                                ? 'bg-[#c9a84c] border-[#c9a84c] text-black shadow-[0_0_30px_rgba(201,168,76,0.2)]'
                                : 'bg-transparent border-white/10 text-gray-500 hover:text-white hover:border-white/30'
                                }`}
                        >
                            <span className="inline-block skew-x-[15deg]">LIGA MASTER</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('copa')}
                            className={`font-bebas text-2xl md:text-4xl px-12 py-3 skew-x-[-15deg] transition-all duration-500 border-2 ${activeTab === 'copa'
                                ? 'bg-[#c9a84c] border-[#c9a84c] text-black shadow-[0_0_30px_rgba(201,168,76,0.2)]'
                                : 'bg-transparent border-white/10 text-gray-500 hover:text-white hover:border-white/30'
                                }`}
                        >
                            <span className="inline-block skew-x-[15deg]">COPA EL LEGADO</span>
                        </button>
                    </div>

                    {/* LÓGICA DE DIVISIONES (Solo visible si está en pestaña Liga) */}
                    {activeTab === 'liga' && (
                        <div className="flex items-center bg-[#111] p-1 border border-white/5 rounded-sm">
                            <button
                                onClick={() => setDivisionTab('A')}
                                className={`font-bebas text-xl px-8 py-2 transition-all ${divisionTab === 'A'
                                    ? 'bg-[#c9a84c] text-black'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                DIVISION A
                            </button>
                            <button
                                onClick={() => setDivisionTab('B')}
                                className={`font-bebas text-xl px-8 py-2 transition-all ${divisionTab === 'B'
                                    ? 'bg-[#c9a84c] text-black'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                DIVISION B
                            </button>
                        </div>
                    )}
                    {activeTab === 'copa' && (
                        <div className="flex items-center bg-[#111] p-1 border border-white/5 rounded-sm">
                            <button
                                onClick={() => setDivisionTab('A')}
                                className={`font-bebas text-xl px-8 py-2 transition-all ${divisionTab === 'A'
                                    ? 'bg-[#c9a84c] text-black'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                DIVISION A
                            </button>
                            <button
                                onClick={() => setDivisionTab('B')}
                                className={`font-bebas text-xl px-8 py-2 transition-all ${divisionTab === 'B'
                                    ? 'bg-[#c9a84c] text-black'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                DIVISION B
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. CONTENEDOR DE CONTENIDO DINÁMICO */}
            <section className="py-24 px-4 md:px-10 min-h-[600px]">
                <div className="max-w-[1400px] mx-auto w-full">
                    {/* 
                        Key dinámico para forzar re-render de animaciones al cambiar de pestaña 
                    */}
                    <div key={`${activeTab}-${divisionTab}`} className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                        {activeTab === 'liga' ? (
                            <div className="space-y-16">
                                {/* 
                                    Pasamos la división como prop si tu ContenedorLiga lo soporta,
                                    o simplemente renderizamos acorde al estado.
                                */}
                                <div className="flex items-center gap-6 mb-10">
                                    <h2 className="font-bebas text-5xl italic uppercase">
                                        Fixture <span className="text-[#c9a84c]">División {divisionTab}</span>
                                    </h2>
                                    <div className="h-[1px] flex-grow bg-white/5"></div>
                                </div>
                                <ContenedorLiga division={divisionTab} />
                            </div>
                        ) : (
                            <div className="space-y-16">
                                <div className="flex items-center gap-6 mb-10">
                                    <h2 className="font-bebas text-5xl italic uppercase">
                                        Cuadro de <span className="text-[#c9a84c]">Copa</span>
                                    </h2>
                                    <div className="h-[1px] flex-grow bg-white/5"></div>
                                </div>
                                <ContenedorCopa division={divisionTab} />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 4. FOOTER DECORATIVO GIGANTE */}
            <footer className="relative py-32 border-t border-white/5 bg-[#080808] overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center relative z-10">
                    <div className="font-bebas text-4xl text-gray-800 italic uppercase">
                        El Legado <br /> <span className="text-[#c9a84c] not-italic">PES 6 League</span>
                    </div>
                    <div className="text-right font-barlow text-[10px] tracking-[5px] uppercase text-gray-200">
                        Competición Organizada por <br /> el comité oficial de El Legado.
                    </div>
                </div>

                {/* Scrolling Text Estilo Webild */}

            </footer>
        </main>
    );
}