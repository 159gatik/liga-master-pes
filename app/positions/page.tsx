"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";

interface EquipoTabla {
    id: string;
    nombre: string;
    escudo?: string;
    pj: number;
    pg: number;
    pe: number;
    pp: number;
    puntos: number;
    df?: number; // Diferencia de gol (opcional pero recomendado)
}

export default function Positions() {
    const [equipos, setEquipos] = useState<EquipoTabla[]>([]);
    const [loading, setLoading] = useState(true);

    // Reemplaza tu useEffect actual por este:
    useEffect(() => {
        // Quitamos los orderBy de la consulta para asegurarnos de que traiga TODO
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
                    df: (d.gf || 0) - (d.gc || 0) // Diferencia calculada
                } as EquipoTabla;
            });

            // Ordenamos en el cliente para que no dependa de índices de Firebase
            data.sort((a, b) => {
                // 1. Primero por Puntos
                if (b.puntos !== a.puntos) return b.puntos - a.puntos;
                // 2. Si empatan en puntos, por Diferencia de Gol (df)
                if (b.df !== a.df) return b.df - a.df;
                // 3. Si empatan en todo, por Partidos Ganados
                return b.pg - a.pg;
            });

            setEquipos(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-bebas text-[#c9a84c] text-4xl animate-pulse">
            Sincronizando Clasificación...
        </div>
    );

    return (
        <main className="min-h-screen bg-[#0a0a0a] p-4 md:p-10 font-barlow-condensed">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* CABECERA */}
                <div className="border-l-4 border-[#c9a84c] pl-6">
                    <h1 className="font-bebas text-7xl text-white italic tracking-tighter uppercase leading-none">
                        Tabla de <span className="text-[#c9a84c]">Posiciones</span>
                    </h1>
                    <p className="text-gray-500 uppercase tracking-[4px] text-sm italic">Temporada 1 · El Legado PES 6</p>
                </div>

                {/* TABLA ESTILO PROFESIONAL */}
                <div className="bg-[#111] border border-[#222] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#0a0a0a] text-gray-500 text-[10px] uppercase tracking-[3px] border-b border-[#222]">
                                    <th className="px-6 py-4 font-bold text-center">Pos</th>
                                    <th className="px-6 py-4 font-bold">Club</th>
                                    <th className="px-4 py-4 font-bold text-center">PJ</th>
                                    <th className="px-4 py-4 font-bold text-center">PG</th>
                                    <th className="px-4 py-4 font-bold text-center">PE</th>
                                    <th className="px-4 py-4 font-bold text-center">PP</th>
                                    <th className="px-4 py-4 font-bold text-center">DG</th>
                                    <th className="px-6 py-4 font-bold text-center text-[#c9a84c]">Pts</th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1a1a1a]">
                                {equipos.map((eq, index) => {
                                    const esClasificado = index < 8;
                                    const sinPartidos = eq.pj === 0;

                                    return (
                                        <tr key={eq.id} className={`hover:bg-white/[0.02] transition-colors group ${sinPartidos ? 'opacity-60' : 'opacity-100'}`}>
                                            {/* POSICIÓN */}
                                            <td className="px-6 py-4 text-center relative">
                                                {esClasificado && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                                )}
                                                <span className={`font-bebas text-2xl ${index === 0 ? 'text-[#c9a84c]' : 'text-gray-400'}`}>
                                                    {index + 1}
                                                </span>
                                            </td>

                                            {/* CLUB + ESCUDO */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-8 h-8 flex-shrink-0">
                                                        {eq.escudo ? (
                                                            <img src={eq.escudo} alt="" className="w-full h-full object-contain" />
                                                        ) : (
                                                            <div className="w-full h-full bg-[#222] rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <span className="text-white font-bold uppercase tracking-wider group-hover:text-[#c9a84c] transition-colors">
                                                        {eq.nombre}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* ESTADÍSTICAS (PJ, PG, PE, PP) */}
                                            <td className="px-4 py-4 text-center font-mono text-gray-400">{eq.pj}</td>
                                            <td className="px-4 py-4 text-center font-mono text-gray-400">{eq.pg}</td>
                                            <td className="px-4 py-4 text-center font-mono text-gray-400">{eq.pe}</td>
                                            <td className="px-4 py-4 text-center font-mono text-gray-400">{eq.pp}</td>
                                            <td className="px-4 py-4 text-center font-mono text-gray-300 font-bold">
                                                {eq.df > 0 ? `+${eq.df}` : eq.df}
                                            </td>
                                            {/* PUNTOS TOTALES */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bebas text-3xl text-[#c9a84c] tabular-nums">
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
                <div className="flex gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500"></div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Zona de Play-offs</span>
                    </div>
                </div>
            </div>
        </main>
    );
}