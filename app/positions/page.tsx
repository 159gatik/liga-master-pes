"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

interface EquipoTabla {
    id: string;
    nombre: string;
    escudo?: string;
    pj: number;
    pg: number;
    pe: number;
    pp: number;
    puntos: number;
    df: number;
    division: "A" | "B"; // Asegúrate de que tus documentos en Firebase tengan este campo
}

export default function PositionsPage() {
    const [equipos, setEquipos] = useState<EquipoTabla[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"A" | "B">("A");

    useEffect(() => {
        const q = query(collection(db, "equipos"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    id: doc.id,
                    nombre: d.nombre || "Sin nombre",
                    escudo: d.escudo || "",
                    pj: d.pj || 0,
                    pg: d.pg || 0,
                    pe: d.pe || 0,
                    pp: d.pp || 0,
                    puntos: d.puntos || 0,
                    df: (d.gf || 0) - (d.gc || 0),
                    division: d.division || "A"
                } as EquipoTabla;
            });

            // Ordenamiento Global
            data.sort((a, b) => {
                if (b.puntos !== a.puntos) return b.puntos - a.puntos;
                if (b.df !== a.df) return b.df - a.df;
                return b.pg - a.pg;
            });

            setEquipos(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filtrar equipos por la división seleccionada
    const equiposFiltrados = equipos.filter(eq => eq.division === activeTab);

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="font-bebas text-[#c9a84c] text-5xl animate-pulse italic">Cargando Clasificación...</div>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans selection:bg-[#c9a84c] selection:text-black overflow-x-hidden pb-20">

            {/* 1. HEADER MASIVO */}
            <header className="relative pt-20 pb-10 px-6 border-b border-white/5 bg-gradient-to-b from-[#111] to-[#0a0a0a]">
                <div className="max-w-[1400px] mx-auto relative">
                    <div className="absolute -top-10 -left-10 font-bebas text-[20vw] text-white/[0.02] pointer-events-none select-none uppercase italic leading-none">
                        Standings
                    </div>

                    <div className="relative z-10">
                        <span className="text-[#c9a84c] font-barlow text-sm tracking-[10px] uppercase block mb-4 animate-pulse">
                            Temporada 2026
                        </span>
                        <h1 className="font-bebas text-7xl md:text-9xl tracking-tighter leading-none uppercase italic">
                            Tabla de <span className="text-[#c9a84c] not-italic">Posiciones</span>
                        </h1>
                    </div>
                </div>
            </header>

            {/* 2. SELECTOR DE DIVISIONES (Estilo Webild Skew) */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 py-6 px-6">
                <div className="max-w-[1400px] mx-auto flex gap-4">
                    {["A", "B"].map((div) => (
                        <button
                            key={div}
                            onClick={() => setActiveTab(div as "A" | "B")}
                            className={`font-bebas text-2xl md:text-4xl px-10 py-2 skew-x-[-15deg] transition-all duration-300 ${activeTab === div
                                ? 'bg-[#c9a84c] text-black shadow-[0_0_20px_rgba(201,168,76,0.3)]'
                                : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <span className="inline-block skew-x-[15deg]">DIVISIÓN {div}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. TABLA DE POSICIONES */}
            <section className="py-12 px-4 md:px-10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="bg-[#0f0f0f] border border-white/5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black text-gray-500 text-[10px] uppercase tracking-[4px] border-b border-white/10">
                                        <th className="px-6 py-5 font-bold text-center w-20">#</th>
                                        <th className="px-6 py-5 font-bold">Club</th>
                                        <th className="px-4 py-5 font-bold text-center">PJ</th>
                                        <th className="px-4 py-5 font-bold text-center">PG</th>
                                        <th className="px-4 py-5 font-bold text-center">PE</th>
                                        <th className="px-4 py-5 font-bold text-center">PP</th>
                                        <th className="px-4 py-5 font-bold text-center">DG</th>
                                        <th className="px-6 py-5 font-bold text-center text-[#c9a84c] bg-white/[0.02]">Pts</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {equiposFiltrados.map((eq, index) => {
                                        const isTop = index < 4; // Zona clasificación
                                        const isBottom = index > equiposFiltrados.length - 3; // Zona descenso (ejemplo)

                                        return (
                                            <tr key={eq.id} className="hover:bg-white/[0.03] transition-all group">
                                                <td className="px-6 py-5 text-center relative">
                                                    {isTop && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>}
                                                    {isBottom && activeTab === "A" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>}

                                                    <span className={`font-bebas text-3xl ${index === 0 ? 'text-[#c9a84c]' : 'text-gray-400'}`}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={eq.escudo || "/placeholder-escudo.png"}
                                                            alt={eq.nombre}
                                                            className="w-10 h-10 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform"
                                                        />
                                                        <span className="font-bebas text-2xl md:text-3xl uppercase tracking-tighter group-hover:text-[#c9a84c] transition-colors">
                                                            {eq.nombre}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-center font-mono text-lg text-gray-400">{eq.pj}</td>
                                                <td className="px-4 py-5 text-center font-mono text-lg text-green-500/70">{eq.pg}</td>
                                                <td className="px-4 py-5 text-center font-mono text-lg text-gray-500">{eq.pe}</td>
                                                <td className="px-4 py-5 text-center font-mono text-lg text-red-500/70">{eq.pp}</td>
                                                <td className={`px-4 py-5 text-center font-mono text-lg font-bold ${eq.df > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                                                    {eq.df > 0 ? `+${eq.df}` : eq.df}
                                                </td>
                                                <td className="px-6 py-5 text-center bg-white/[0.01]">
                                                    <span className="font-bebas text-4xl text-[#c9a84c] tabular-nums">
                                                        {eq.puntos}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* LEYENDA */}
                    <div className="flex flex-wrap gap-8 mt-8 border-t border-white/5 pt-8">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"></div>
                            <span className="text-[10px] font-barlow text-gray-500 uppercase tracking-[3px]">Zona Play-offs / Champions</span>
                        </div>
                        {activeTab === "A" && (
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-red-600"></div>
                                <span className="text-[10px] font-barlow text-gray-500 uppercase tracking-[3px]">Zona Descenso</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}