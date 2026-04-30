"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, orderBy, where, Timestamp } from "firebase/firestore";
import { useAuth } from "@/src/lib/hooks/useAuht";
import FormularioReporte from "./FormularioReporte";
import SeccionDisponibilidad from "./SeccionDisponibilidad";

interface Equipo { id: string; nombre: string; grupo?: 'A' | 'B'; escudo: string; }
interface Reporte { id: string; local: string; visita: string; score: string; ronda: number; }
interface PartidoProgramado { id: string; localNombre: string; visitaNombre: string; ronda: number; }
interface Disponibilidad { id: string; equipoId: string; nombreEquipo: string; fechaTorneo: number; texto: string; fecha: Timestamp; }
// ← NUEVO: Props
interface Props {
    colEquipos?: string;
    colPartidos?: string;
    colReportes?: string;
    acento?: string;
    temporada?: string;
}

export default function ContenedorCopa({
    colEquipos = "equipos",
    colPartidos = "partidos_copa",
    colReportes = "reportes_copa",
    acento = "#c9a84c",
    temporada = "Temporada 1 · El Legado PES 6"
}: Props) {
    const { user, userData, isAdmin, loading, equipoIdActivo, nombreEquipoActivo } = useAuth()
    const [subTab, setSubTab] = useState<'grupos' | 'jornadas' | 'playoffs'>('grupos');
    const [rondaActiva, setRondaActiva] = useState<number>(1);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [reportesRonda, setReportesRonda] = useState<Reporte[]>([]);
    const [partidosProgramados, setPartidosProgramados] = useState<PartidoProgramado[]>([]);
    const [listaHorarios, setListaHorarios] = useState<Disponibilidad[]>([]);
    const totalRondas = 5;

    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, colEquipos), orderBy("nombre", "asc")),
            (snap) => setEquipos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Equipo)))
        );
        return () => unsub();
    }, [colEquipos]);

    useEffect(() => {
        const numRonda = Number(rondaActiva);

        const qCruces = query(collection(db, colPartidos), where("ronda", "==", numRonda));
        const unsubCruces = onSnapshot(qCruces, (snap) =>
            setPartidosProgramados(snap.docs.map(d => ({ id: d.id, ...d.data() } as PartidoProgramado)))
        );

        const qReportes = query(collection(db, colReportes), where("ronda", "==", numRonda), orderBy("fecha", "desc"));
        const unsubReportes = onSnapshot(qReportes, (snap) =>
            setReportesRonda(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reporte)))
        );

        return () => { unsubCruces(); unsubReportes(); };
    }, [rondaActiva, colPartidos, colReportes]);

    // 3. Disponibilidad por Ronda
    useEffect(() => {
        const q = query(
            collection(db, "disponibilidad_copa"), // Asegúrate que la colección sea esta
            where("ronda", "==", rondaActiva)      // Filtra por ronda, no por fechaTorneo
        );
        const unsub = onSnapshot(q, (snap) =>
            setListaHorarios(snap.docs.map(d => ({ id: d.id, ...d.data() } as Disponibilidad)))
        );
        return () => unsub();
    }, [rondaActiva]);

    return (
        <div className="space-y-10">

            {/* HEADER */}
            <div className="border-l-4 pl-6" style={{ borderColor: acento }}>
                <h1 className="font-bebas text-6xl italic tracking-tighter uppercase leading-none">
                    Copa de <span style={{ color: acento }}>la liga</span>
                </h1>
                <p className="text-gray-500 uppercase tracking-[4px] text-sm italic">{temporada}</p>
            </div>

            {/* TABS */}
            <div className="flex gap-8 border-b border-[#222] pb-2 overflow-x-auto">
                {(['grupos', 'jornadas', 'playoffs'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSubTab(tab)}
                        className="font-bebas text-3xl transition-all uppercase"
                        style={{ color: subTab === tab ? acento : '#333' }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* GRUPOS */}
            {subTab === 'grupos' && (
                <div className="grid md:grid-cols-2 gap-8">
                    {(['A', 'B'] as const).map(grupo => (
                        <div key={grupo} className="bg-[#111] p-8 border border-[#222] space-y-4">
                            <h3 className="font-bebas text-4xl italic tracking-widest" style={{ color: acento }}>
                                GRUPO {grupo}
                            </h3>
                            {equipos.filter(e => e.grupo === grupo).map(e => (
                                <div key={e.id} className="p-3 border-b border-[#222] font-barlow-condensed text-xl text-white uppercase italic">
                                    {e.nombre}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* JORNADAS */}
            {subTab === 'jornadas' && (
                <div className="space-y-10">
                    <div className="relative bg-[#111] border-y border-[#222] py-4">
                        <div className="flex overflow-x-auto gap-2 px-4 no-scrollbar snap-x snap-mandatory">
                            {Array.from({ length: totalRondas }, (_, i) => i + 1).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setRondaActiva(f)}
                                    className="snap-center flex-shrink-0 px-6 py-2 font-bebas text-2xl transition-all italic border"
                                    style={rondaActiva === f
                                        ? { borderColor: acento, color: acento, background: 'rgba(255,255,255,0.05)' }
                                        : { borderColor: 'transparent', color: '#333' }
                                    }
                                >
                                    JORNADA {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <section className="lg:col-span-2 space-y-12">
                            <h3 className="font-bebas text-3xl border-b border-[#222] pb-2 uppercase italic tracking-widest" style={{ color: acento }}>
                                PARTIDOS
                            </h3>
                            <div className="grid gap-6">
                                {partidosProgramados.length > 0 ? partidosProgramados.map(p => {
                                    const eqLocal = equipos.find(e => e.nombre === p.localNombre);
                                    const eqVisita = equipos.find(e => e.nombre === p.visitaNombre);
                                    return (
                                        <div key={p.id} className="bg-[#050505] border border-[#222] p-4 shadow-lg">
                                            <div className="text-xs tracking-[2px] mb-3 uppercase italic text-center md:text-left font-bebas" style={{ color: acento }}>
                                                GRUPO {eqLocal?.grupo || 'A'}
                                            </div>
                                            <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center gap-4">
                                                <div className="flex items-center justify-center md:justify-end gap-3 w-full">
                                                    <span className="font-bebas text-lg md:text-xl uppercase italic truncate">{p.localNombre}</span>
                                                    <img src={eqLocal?.escudo || "/escudo-default.png"} alt={p.localNombre} className="w-8 h-8 object-contain" />
                                                </div>
                                                <span className="font-black italic text-md" style={{ color: acento }}>VS</span>
                                                <div className="flex items-center justify-center md:justify-start gap-3 w-full">
                                                    <img src={eqVisita?.escudo || "/escudo-default.png"} alt={p.visitaNombre} className="w-8 h-8 object-contain" />
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
                                <h3 className="font-bebas text-3xl border-b border-[#222] pb-2 uppercase italic tracking-widest" style={{ color: acento }}>
                                    Resultados
                                </h3>
                                {reportesRonda.map(rep => (
                                    <div key={rep.id} className="bg-[#111] border border-[#222] p-6 text-center font-bebas text-2xl uppercase tracking-widest italic text-white shadow-lg">
                                        {rep.local} <span style={{ color: acento }} className="px-4">{rep.score}</span> {rep.visita}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <aside>
                            <div className="bg-[#0f0f0f] p-6 border border-[#222]">
                                <h4 className="font-bebas text-2xl text-white mb-4 italic uppercase">Reportar Partido</h4>

                                {/* Validamos que el usuario tenga el rol de DT */}
                                {userData?.rol === "dt" ? (
                                    <FormularioReporte
                                        fechaNumero={rondaActiva}
                                        rivales={equipos.filter(e => e.nombre !== userData?.nombreEquipo)}
                                        equipoNombre={userData?.nombreEquipo || ""}
                                        esCopa={true}
                                    />
                                ) : (
                                    <div className="py-6 border border-dashed border-[#222] text-center">
                                        <p className="font-bebas text-xl uppercase italic tracking-widest" style={{ color: acento }}>
                                            Acceso restringido a DTs
                                        </p>
                                        <p className="text-gray-500 text-[10px] uppercase mt-1">
                                            Debes tener un equipo asignado para reportar
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-[#0f0f0f] border border-[#222] p-5 space-y-4">
                                <h4 className="font-bebas text-2xl text-white uppercase italic border-b border-[#222] pb-2">Horarios de los DTs</h4>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {listaHorarios.length > 0 ? (
                                        listaHorarios.map(h => (
                                            <div key={h.id} className="border-b border-[#222]/50 pb-2 last:border-0">
                                                <p className="text-[13px] font-bold uppercase tracking-wider" style={{ color: acento }}>{h.nombreEquipo}</p>
                                                <p className="text-gray-400 text-[13px] leading-tight mt-1 italic font-light">{h.texto}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-200 text-xs italic uppercase">Nadie cargó horarios todavía.</p>
                                    )}
                                </div>
                            </div>
                            {/* DISPONIBILIDAD */}
                            {userData?.rol === "dt" && (
                                <SeccionDisponibilidad
                                    equipoId={equipoIdActivo!}
                                    nombreEquipo={nombreEquipoActivo!}
                                    fechaActiva={rondaActiva}
                                />
                            )}
                        </aside>
                    </div>
                </div>
            )}

            {/* PLAYOFFS */}
            {subTab === 'playoffs' && (
                <div className="space-y-8">
                    <h3 className="font-bebas text-4xl italic tracking-widest border-b border-[#222] pb-4" style={{ color: acento }}>
                        Fase Final
                    </h3>
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
                            <p className="font-barlow-condensed uppercase italic text-lg" style={{ color: acento }}>
                                Ganador S1 vs. Ganador S2
                            </p>
                        </div>
                    </div>
                    <div className="bg-[#0f0f0f] border-l-4 p-6 mt-6" style={{ borderColor: acento }}>
                        <p className="text-gray-400 italic">
                            * Una vez finalizada la fase de grupos, los administradores cargarán los cruces en semifinales y la final.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}