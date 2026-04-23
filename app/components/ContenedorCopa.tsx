"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";
import { useAuth } from "@/src/lib/hooks/useAuht";
import FormularioReporte from "./FormularioReporte";
import Image from "next/image";
interface Equipo { id: string; nombre: string; grupo?: 'A' | 'B'; escudo: string; }
interface Reporte { id: string; local: string; visita: string; score: string; ronda: number; }
interface PartidoProgramado { id: string; localNombre: string; visitaNombre: string; ronda: number; }

export default function ContenedorCopa() {
    const { userData } = useAuth();
    const [subTab, setSubTab] = useState<'grupos' | 'jornadas' | 'playoffs'>('grupos');
    const [rondaActiva, setRondaActiva] = useState<number>(1);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [reportesRonda, setReportesRonda] = useState<Reporte[]>([]);
    const [partidosProgramados, setPartidosProgramados] = useState<PartidoProgramado[]>([]);
    const totalRondas = 5;

    useEffect(() => {
        const unsubEquipos = onSnapshot(query(collection(db, "equipos"), orderBy("nombre", "asc")),
            (snap) => setEquipos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Equipo))));
        return () => unsubEquipos();
    }, []);

    useEffect(() => {
        const numRonda = Number(rondaActiva);
        const qCruces = query(collection(db, "partidos_copa"), where("ronda", "==", numRonda));
        const unsubCruces = onSnapshot(qCruces, (snap) => setPartidosProgramados(snap.docs.map(d => ({ id: d.id, ...d.data() } as PartidoProgramado))));

        const qReportes = query(collection(db, "reportes_copa"), where("ronda", "==", numRonda), orderBy("fecha", "desc"));
        const unsubReportes = onSnapshot(qReportes, (snap) => setReportesRonda(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reporte))));

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

            {/* TABS PRINCIPALES */}
            <div className="flex gap-8 border-b border-[#222] pb-2 overflow-x-auto">
                <button onClick={() => setSubTab('grupos')} className={`font-bebas text-3xl transition-all ${subTab === 'grupos' ? 'text-[#c9a84c]' : 'text-[#333]'}`}>GRUPOS</button>
                <button onClick={() => setSubTab('jornadas')} className={`font-bebas text-3xl transition-all ${subTab === 'jornadas' ? 'text-[#c9a84c]' : 'text-[#333]'}`}>JORNADAS</button>
                <button onClick={() => setSubTab('playoffs')} className={`font-bebas text-3xl transition-all ${subTab === 'playoffs' ? 'text-[#c9a84c]' : 'text-[#333]'}`}>PLAYOFFS</button>
            </div>

            {subTab === 'grupos' ? (
                <div className="grid md:grid-cols-2 gap-8">
                    {['A', 'B'].map(grupo => (
                        <div key={grupo} className="bg-[#111] p-8 border border-[#222] space-y-4">
                            <h3 className="font-bebas text-4xl text-[#c9a84c] italic tracking-widest">GRUPO {grupo}</h3>
                            {equipos.filter(e => e.grupo === grupo).map(e => (
                                <div key={e.id} className="p-3 border-b border-[#222] font-barlow-condensed text-xl text-white uppercase italic">{e.nombre}</div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : subTab === 'jornadas' ? (
                    <div className="space-y-10">
                        {/* Selector de Ronda */}
                        <div className="relative bg-[#111] border-y border-[#222] py-4">
                            {/* Ajustamos el scroll para que sea más intuitivo */}
                            <div className="flex overflow-x-auto gap-2 px-4 no-scrollbar snap-x snap-mandatory">
                                {Array.from({ length: totalRondas }, (_, i) => i + 1).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setRondaActiva(f)}
                                        className={`snap-center flex-shrink-0 px-6 py-2 font-bebas text-2xl transition-all italic border ${rondaActiva === f
                                            ? "border-[#c9a84c] text-[#c9a84c] bg-white/5"
                                            : "border-transparent text-[#333] hover:text-gray-500"
                                            }`}
                                    >
                                        JORNADA {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <section className="lg:col-span-2 space-y-12">
                                <h3 className="font-bebas text-3xl text-[#c9a84c] border-b border-[#222] pb-2 uppercase italic tracking-widest">
                                    PARTIDOS
                                </h3>
                                <div className="grid gap-6">
                                    {partidosProgramados.length > 0 ? partidosProgramados.map(p => {
                                        const eqLocal = equipos.find(e => e.nombre === p.localNombre);
                                        const eqVisita = equipos.find(e => e.nombre === p.visitaNombre);

                                        return (
                                            <div key={p.id} className="bg-[#050505] border border-[#222] p-4 shadow-lg">
                                                {/* Etiqueta de Grupo */}
                                                <div className="text-[#c9a84c] font-bebas text-xs tracking-[2px] mb-3 uppercase italic text-center md:text-left">
                                                    GRUPO {eqLocal?.grupo || 'A'}
                                                </div>

                                                {/* Contenedor principal: Vertical en móvil, Horizontal en md */}
                                                <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center gap-4">

                                                    {/* LOCAL */}
                                                    <div className="flex items-center justify-center md:justify-end gap-3 w-full">
                                                        <span className="font-bebas text-lg md:text-xl uppercase italic truncate">{p.localNombre}</span>
                                                        <div className="relative w-8 h-8 flex-shrink-0">
                                                            <img src={eqLocal?.escudo || "/escudo-default.png"} alt={p.localNombre} className="object-contain w-full h-full" />
                                                        </div>
                                                    </div>

                                                    {/* VS */}
                                                    <span className="text-[#c9a84c] font-black italic text-md">VS</span>

                                                    {/* VISITA */}
                                                    <div className="flex items-center justify-center md:justify-start gap-3 w-full">
                                                        <div className="relative w-8 h-8 flex-shrink-0">
                                                            <img src={eqVisita?.escudo || "/escudo-default.png"} alt={p.visitaNombre} className="object-contain w-full h-full" />
                                                        </div>
                                                        <span className="font-bebas text-lg md:text-xl uppercase italic truncate">{p.visitaNombre}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-gray-700 text-center py-4 italic border border-dashed border-[#222]">
                                            No hay partidos programados.
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    <h3 className="font-bebas text-3xl text-[#c9a84c] border-b border-[#222] pb-2 uppercase italic tracking-widest">Resultados</h3>
                                    {reportesRonda.map(rep => (
                                        <div key={rep.id} className="bg-[#111] border border-[#222] p-6 text-center font-bebas text-2xl uppercase tracking-widest italic text-white shadow-lg">
                                            {rep.local} <span className="text-[#c9a84c] px-4">{rep.score}</span> {rep.visita}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <aside className="space-y-6">
                                <div className="bg-[#0f0f0f] p-6 border border-[#222]">
                                    <h4 className="font-bebas text-2xl text-white mb-4 italic uppercase">Reportar Partido</h4>
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
            ) : (
                /* SECCIÓN PLAYOFFS */
                <div className="space-y-8 animate-in fade-in duration-500">
                    <h3 className="font-bebas text-4xl text-[#c9a84c] italic tracking-widest border-b border-[#222] pb-4">Fase Final</h3>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-[#111] border border-[#222] p-6">
                            <h4 className="font-bebas text-2xl mb-4 italic text-white underline">Semifinales</h4>
                            <div className="space-y-4 font-barlow-condensed uppercase italic text-gray-300">
                                <p><strong>Semifinal 1:</strong> 1ro Grupo A vs. 2do Grupo B</p>
                                <p><strong>Semifinal 2:</strong> 1ro Grupo B vs. 2do Grupo A</p>
                            </div>
                        </div>
                        <div className="bg-[#111] border border-[#222] p-6">
                            <h4 className="font-bebas text-2xl mb-4 italic text-white underline">Gran Final</h4>
                            <p className="font-barlow-condensed uppercase italic text-lg text-[#c9a84c]">Ganador S1 vs. Ganador S2</p>
                        </div>
                    </div>

                    <div className="bg-[#0f0f0f] border-l-4 border-[#c9a84c] p-6 mt-6">
                        <p className="text-gray-400 italic">
                            * Nota: Una vez finalizada la fase de grupos, los administradores cargarán los cruces correspondientes en las llaves de semifinales y la final.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}