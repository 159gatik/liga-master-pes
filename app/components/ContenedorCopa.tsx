"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";
import { useAuth } from "@/src/lib/hooks/useAuht";
import FormularioReporte from "./FormularioReporte";

interface Equipo { id: string; nombre: string; escudo: string; }
interface Reporte { id: string; local: string; visita: string; score: string; ronda: number; }
interface PartidoProgramado { id: string; localNombre: string; visitaNombre: string; ronda: number; }

export default function ContenedorCopa() {
    const { userData } = useAuth();
    const [rondaActiva, setRondaActiva] = useState<number>(1);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [reportesRonda, setReportesRonda] = useState<Reporte[]>([]);
    const [partidosProgramados, setPartidosProgramados] = useState<PartidoProgramado[]>([]);
    const totalRondas = 4;
    useEffect(() => {
        const unsubEquipos = onSnapshot(query(collection(db, "equipos"), orderBy("nombre", "asc")),
            (snap) => setEquipos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Equipo))));
        return () => unsubEquipos();
    }, []);

    useEffect(() => {
        const numRonda = Number(rondaActiva);

        // La limpieza se hace de forma segura fuera del renderizado directo
        const qCruces = query(collection(db, "partidos_copa"), where("ronda", "==", numRonda));
        const unsubCruces = onSnapshot(qCruces, (snap) => {
            setPartidosProgramados(snap.docs.map(d => ({ id: d.id, ...d.data() } as PartidoProgramado)));
        });

        const qReportes = query(collection(db, "reportes_copa"), where("ronda", "==", numRonda), orderBy("fecha", "desc"));
        const unsubReportes = onSnapshot(qReportes, (snap) => {
            setReportesRonda(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reporte)));
        });

        return () => { unsubCruces(); unsubReportes(); };
    }, [rondaActiva]);

    return (
        <div className="space-y-10">
            <div className="border-l-4 border-[#c9a84c] pl-6">
                <h1 className="font-bebas text-6xl italic tracking-tighter uppercase leading-none">
                    Copa de <span className="text-[#c9a84c]">la liga</span>
                </h1>
                <p className="text-gray-500 uppercase tracking-[4px] text-sm italic">Temporada 1 · El Legado PES 6</p>
            </div>
            {/* Selector de Ronda */}

            <div className="relative group bg-[#111] border-y border-[#222] py-2">
                <button onClick={() => document.getElementById('carrusel-fechas')?.scrollBy({ left: -200, behavior: 'smooth' })} className="absolute left-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-r from-[#111] to-transparent text-[#c9a84c]"><span className="font-bebas text-4xl">‹</span></button>
                <div id="carrusel-fechas" className="flex overflow-x-auto gap-4 px-10 no-scrollbar scroll-smooth items-center" style={{ scrollbarWidth: 'none' }}>
                    {Array.from({ length: totalRondas }, (_, i) => i + 1).map((f) => (
                        <button key={f} onClick={() => setRondaActiva(f)} className={`px-8 py-3 font-bebas text-3xl transition-all flex-shrink-0 italic tracking-widest relative ${rondaActiva === f ? "text-[#c9a84c] scale-110" : "text-[#333] hover:text-gray-400"}`}>
                            FECHA {f} </button>
                    ))}
                </div>
                <button onClick={() => document.getElementById('carrusel-fechas')?.scrollBy({ left: 200, behavior: 'smooth' })} className="absolute right-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-l from-[#111] to-transparent text-[#c9a84c]"><span className="font-bebas text-4xl">›</span></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <section className="lg:col-span-2 space-y-12">
                    <h3 className="font-bebas text-3xl text-[#c9a84c] border-b border-[#222] pb-2">Llaves de Copa</h3>
                    <div className="grid gap-4">
                        {partidosProgramados.map(p => (
                            <div key={p.id} className="bg-[#050505] border border-[#222] p-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
                                <div className="text-right uppercase truncate italic">{p.localNombre}</div>
                                <span className="text-[#c9a84c] font-bold">VS</span>
                                <div className="text-left uppercase truncate italic">{p.visitaNombre}</div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        {reportesRonda.map(rep => (
                            <div key={rep.id} className="bg-[#111] border border-[#222] p-6 text-center">
                                <p className="font-bebas text-2xl">{rep.local} {rep.score} {rep.visita}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="space-y-6">
                    <div className="bg-[#0f0f0f] p-6 border border-[#222]">
                        <h4 className="font-bebas text-2xl text-white mb-4">Reportar Partido de Copa</h4>
                        <FormularioReporte
                            fechaNumero={rondaActiva}
                            rivales={equipos}
                            equipoNombre={userData?.nombreEquipo || ""}
                            esCopa={true}
                        />
                    </div>
                </aside>
            </div>
        </div>
    );
}