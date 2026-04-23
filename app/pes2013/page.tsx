"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/lib/hooks/useAuht";
import { db } from "@/src/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useLiga } from "@/src/lib/context/LigaContext";
import BannerPatrocinadores from "../components/BannerPatrocinadores";

interface Equipo {
    id: string;
    nombre: string;
    pts?: number;
    pj?: number;
    escudo?: string;
}

interface Reporte {
    id: string;
    local: string;
    visita: string;
    score: string;
}

export default function Pes2013Home() {
    const { user, userData } = useAuth();
    const { col } = useLiga();
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [resultados, setResultados] = useState<Reporte[]>([]);

    useEffect(() => {
        const q = query(collection(db, col("equipos")), orderBy("nombre", "asc"));
        return onSnapshot(q, (snap) => {
            setEquipos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Equipo)));
        });
    }, []);

    useEffect(() => {
        const q = query(collection(db, col("reportes")), orderBy("fecha", "desc"), limit(4));
        return onSnapshot(q, (snap) => {
            setResultados(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reporte)));
        });
    }, []);

    return (
        <main className="min-h-screen bg-[#0a1628] text-[#e8f4ff] font-sans p-6 md:p-10">

            {/* HEADER */}
            <div className="max-w-6xl mx-auto mb-10 border-l-4 border-[#00aaff] pl-5">
                <p className="text-[#00aaff] font-barlow-condensed text-xs tracking-[5px] uppercase mb-2">
                    Liga Master Online
                </p>
                <h1 className="font-bebas text-5xl md:text-7xl tracking-[5px] uppercase text-white">
                    PES <span className="text-[#00aaff]">2013</span>
                </h1>
            </div>

            {/* HERO */}
            <section className="max-w-6xl mx-auto relative bg-[#0d1f3c] border border-[#1a3a5c] border-t-4 border-t-[#00aaff] p-10 md:p-16 mb-10 overflow-hidden shadow-2xl">
                <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 font-bebas text-[10rem] text-[#00aaff] opacity-[0.03] pointer-events-none whitespace-nowrap hidden lg:block">
                    PES 2013
                </div>
                <div className="relative z-10">
                    <h2 className="font-bebas text-6xl md:text-8xl tracking-[8px] leading-[0.9] mb-6 uppercase">
                        La <span className="text-[#00aaff]">Leyenda</span>
                    </h2>
                    <p className="text-[#5588aa] max-w-lg leading-relaxed mb-8">
                        Revivé el mejor PES de la historia. Organizá tu equipo y escribí tu historia.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/pes2013/equipos"
                            className="border-2 border-[#00aaff] text-[#00aaff] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-[#00aaff] hover:text-[#0a1628] transition-all">
                            Equipos
                        </Link>
                        {!user ? (
                            <Link href="/register"
                                className="bg-[#00aaff] border-2 border-[#00aaff] text-[#0a1628] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-white hover:border-white transition-all">
                                Registrate
                            </Link>
                        ) : (
                            <Link href="/pes2013/perfil"
                                className="bg-[#00aaff] border-2 border-[#00aaff] text-[#0a1628] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-white hover:border-white transition-all">
                                Mi Oficina
                            </Link>
                        )}
                    </div>
                </div>
            </section>
            <BannerPatrocinadores />
            {/* STATS */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                {[
                    { value: equipos.length, label: "Clubes" },
                    { value: resultados.length, label: "Reportes" },
                    { value: "ACTIVO", label: "Estado", celeste: true },
                    { value: "I", label: "Edición" },
                ].map((s, i) => (
                    <div key={i} className="bg-[#0d1f3c] border border-[#1a3a5c] p-5 text-center relative overflow-hidden group">
                        <div className={`font-bebas text-4xl tracking-[2px] mb-1 ${s.celeste ? "text-[#00aaff]" : "text-[#00aaff]"}`}>
                            {s.value}
                        </div>
                        <div className="font-barlow-condensed text-[13px] tracking-[3px] text-[#3a6688] uppercase">
                            {s.label}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00aaff] opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>

            {/* GRILLA RESULTADOS + TABLA */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">

                {/* ÚLTIMOS RESULTADOS */}
                <div className="bg-[#0d1f3c] border border-[#1a3a5c] overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-[#0a1628] border-b border-[#1a3a5c]">
                        <h3 className="font-bebas text-2xl tracking-[3px] text-[#00aaff]">Últimos Resultados</h3>
                        <Link href="/pes2013/fixture" className="font-barlow-condensed text-[13px] tracking-[2px] text-[#3a6688] uppercase hover:text-[#00aaff]">
                            Ver fixture →
                        </Link>
                    </div>
                    <div className="p-0">
                        {resultados.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-[#00aaff] animate-pulse italic text-[10px] font-barlow-condensed uppercase tracking-[4px]">
                                    Esperando reportes oficiales...
                                </p>
                            </div>
                        ) : resultados.map((partido) => {
                            const [gL, gV] = (partido.score || "0-0").split('-').map(Number);
                            const localGana = gL > gV;
                            const visitaGana = gV > gL;
                            return (
                                <div key={partido.id} className="grid grid-cols-3 items-center p-4 border-b border-[#0f2540] last:border-0 hover:bg-[#ffffff03]">
                                    <span className={`text-right pr-2 font-barlow-condensed font-bold uppercase text-sm ${localGana ? 'text-[#00aaff]' : 'text-[#3a6688]'}`}>
                                        {partido.local}
                                    </span>
                                    <div className="flex justify-center">
                                        <div className="flex items-center bg-[#0a1628] border border-[#1a3a5c] px-3 py-1 rounded">
                                            <span className={`font-bebas text-2xl px-2 ${localGana ? 'text-[#00aaff]' : 'text-white'}`}>{gL}</span>
                                            <span className="text-[#1a3a5c] font-bebas text-xl">-</span>
                                            <span className={`font-bebas text-2xl px-2 ${visitaGana ? 'text-[#00aaff]' : 'text-white'}`}>{gV}</span>
                                        </div>
                                    </div>
                                    <span className={`text-left pl-2 font-barlow-condensed font-bold uppercase text-sm ${visitaGana ? 'text-[#00aaff]' : 'text-[#3a6688]'}`}>
                                        {partido.visita}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* TABLA */}
                <div className="bg-[#0d1f3c] border border-[#1a3a5c] overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-[#0a1628] border-b border-[#1a3a5c]">
                        <h3 className="font-bebas text-2xl tracking-[3px] text-[#00aaff]">Tabla de Posiciones</h3>
                        <Link href="/pes2013/positions" className="font-barlow-condensed text-[13px] tracking-[2px] text-[#3a6688] uppercase hover:text-[#00aaff]">
                            Ver completa →
                        </Link>
                    </div>
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="bg-[#0a1628] font-barlow-condensed text-[13px] tracking-[2px] text-[#3a6688] uppercase">
                                <th className="p-3">#</th>
                                <th className="p-3 text-left">Equipo</th>
                                <th className="p-3">PJ</th>
                                <th className="p-3">PTS</th>
                            </tr>
                        </thead>
                        <tbody className="font-barlow-condensed text-sm uppercase">
                            {equipos.length === 0 ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i} className="border-b border-[#0f2540] opacity-30">
                                        <td className="p-3 font-bebas text-lg text-[#3a6688]">{i}</td>
                                        <td className="p-3 text-left text-[#3a6688]">[ Equipo ]</td>
                                        <td className="p-3 text-[#3a6688]">—</td>
                                        <td className="p-3 font-bebas text-2xl text-[#3a6688]">—</td>
                                    </tr>
                                ))
                            ) : (
                                [...equipos]
                                    .sort((a, b) => (b.pts || 0) - (a.pts || 0))
                                    .slice(0, 4)
                                    .map((equipo, index) => (
                                        <tr key={equipo.id} className="border-b border-[#0f2540] hover:bg-[#ffffff03]">
                                            <td className="p-3 font-bebas text-lg text-[#3a6688]">{index + 1}</td>
                                            <td className="p-3 text-left font-bold text-white">{equipo.nombre}</td>
                                            <td className="p-3 text-[#3a6688]">{equipo.pj || 0}</td>
                                            <td className="p-3 font-bebas text-2xl text-[#00aaff]">{equipo.pts || 0}</td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}