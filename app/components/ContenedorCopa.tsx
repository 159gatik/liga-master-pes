"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, orderBy, where, Timestamp, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "@/src/lib/hooks/useAuht";
import FormularioReporte from "./FormularioReporte";
import SeccionDisponibilidad from "./SeccionDisponibilidad";
import Image from "next/image";

// Interfaces
interface Equipo { id: string; nombre: string; grupo?: 'A' | 'B'; escudo: string; division?: string; }
interface Reporte { id: string; local: string; visita: string; equipoId: string; rivalId: string; score: string; dtUid: string; nombreDT: string; resultado: string; comentario: string; captura1: string; captura2: string; captura3: string; fechaTorneo: number; fecha: Timestamp; division?: string; }
interface PartidoProgramado { id: string; localNombre: string; visitaNombre: string; ronda: number; localId: string; visitaId: string; division?: string; }
interface Disponibilidad { id: string; equipoId: string; nombreEquipo: string; fechaTorneo: number; texto: string; fecha: Timestamp; division?: string; }

interface Props {
    division: 'A' | 'B'; // Prop obligatoria para coherencia con Fixture
    colEquipos?: string;
    colPartidos?: string;
    colReportes?: string;
    acento?: string;
    temporada?: string;
}

export default function ContenedorCopa({
    division,
    colEquipos = "equipos",
    colPartidos = "partidos_copa",
    colReportes = "reportes_copa",
    acento = "#c9a84c",
    temporada = "Temporada 1 · El Legado PES 6"
}: Props) {
    const { userData, equipoIdActivo, nombreEquipoActivo } = useAuth();
    const [subTab, setSubTab] = useState<'grupos' | 'jornadas' | 'playoffs'>('grupos');
    const [rondaActiva, setRondaActiva] = useState<number>(1);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [reportesRonda, setReportesRonda] = useState<Reporte[]>([]);
    const [partidosProgramados, setPartidosProgramados] = useState<PartidoProgramado[]>([]);
    const [listaHorarios, setListaHorarios] = useState<Disponibilidad[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const totalRondas = 5;

    // 1. Carga de Equipos (Filtrados por División)
    useEffect(() => {
        const q = query(
            collection(db, colEquipos),
            where("division", "==", division),
            orderBy("nombre", "asc")
        );
        const unsub = onSnapshot(q, (snap) =>
            setEquipos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Equipo)))
        );
        return () => unsub();
    }, [colEquipos, division]);

    // 2. Partidos y Reportes (Filtrados por Ronda y División)
    useEffect(() => {
        const qCruces = query(
            collection(db, colPartidos),
            where("ronda", "==", Number(rondaActiva)),
            where("division", "==", division)
        );
        const unsubCruces = onSnapshot(qCruces, (snap) =>
            setPartidosProgramados(snap.docs.map(d => ({ id: d.id, ...d.data() } as PartidoProgramado)))
        );

        const qReportes = query(
            collection(db, colReportes),
            where("ronda", "==", Number(rondaActiva)),
            where("division", "==", division),
            orderBy("fecha", "desc")
        );
        const unsubReportes = onSnapshot(qReportes, (snap) =>
            setReportesRonda(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reporte)))
        );


        return () => { unsubCruces(); unsubReportes(); };
    }, [rondaActiva, colPartidos, colReportes, division]);

    // 3. Disponibilidad por Ronda (Filtrada por División)
    useEffect(() => {
        const q = query(
            collection(db, "disponibilidad_copa"),
            where("ronda", "==", rondaActiva),
            where("division", "==", division)
        );
        const unsub = onSnapshot(q, (snap) =>
            setListaHorarios(snap.docs.map(d => ({ id: d.id, ...d.data() } as Disponibilidad)))
        );
        return () => unsub();
    }, [rondaActiva, division]);

    const scroll = (dir: 'L' | 'R') => {
        if (scrollRef.current) {
            const move = dir === 'L' ? -200 : 200;
            scrollRef.current.scrollBy({ left: move, behavior: 'smooth' });
        }
    };

    const eliminarReporte = async (reporteId: string) => {
        if (window.confirm("¿Estás seguro de eliminar este reporte?")) {
            try { await deleteDoc(doc(db, colReportes, reporteId)); } catch (e) { console.error(e); }
        }
    };

    return (
        <div className="w-full space-y-12 animate-in fade-in duration-700">

            {/* 1. SUB-TABS MODERNOS */}
            <div className="flex justify-center md:justify-start gap-4 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
                {(['grupos', 'jornadas', 'playoffs'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSubTab(tab)}
                        className={`font-bebas text-3xl px-8 py-2 transition-all uppercase skew-x-[-15deg] border ${subTab === tab ? 'bg-white text-black border-white' : 'bg-transparent text-gray-600 border-white/5 hover:text-white'
                            }`}
                    >
                        <span className="inline-block skew-x-[15deg]">{tab}</span>
                    </button>
                ))}
            </div>

            {/* CONTENIDO DINÁMICO SEGÚN SUBTAB */}
            <div key={subTab} className="animate-in slide-in-from-left-4 duration-500">

                {/* --- SECCIÓN: GRUPOS --- */}
                {subTab === 'grupos' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {(['A', 'B'] as const).map(grupo => (
                            <div key={grupo} className="bg-[#111] p-10 border-t-4 border-[#c9a84c] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 font-bebas text-8xl italic">GP {grupo}</div>
                                <h3 className="font-bebas text-5xl italic tracking-tighter mb-8 text-[#c9a84c]">
                                    GRUPO <span className="text-white">{grupo}</span>
                                </h3>
                                <div className="space-y-3">
                                    {equipos.filter(e => e.grupo === grupo).map(e => (
                                        <div key={e.id} className="flex items-center gap-4 p-4 bg-black/40 border border-white/5 group hover:border-[#c9a84c]/30 transition-all">
                                            <div className="relative w-8 h-8 grayscale group-hover:grayscale-0 transition-all">
                                                <Image src={e.escudo || "/img/default-shield.png"} alt="" fill className="object-contain" />
                                            </div>
                                            <span className="font-bebas text-2xl uppercase tracking-widest text-gray-300 group-hover:text-white">{e.nombre}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- SECCIÓN: JORNADAS --- */}
                {subTab === 'jornadas' && (
                    <div className="space-y-12">
                        {/* Selector de Rondas con Flechas */}
                        <div className="relative group bg-white/[0.02] border-y border-white/5 py-4 overflow-hidden">
                            <button onClick={() => scroll('L')} className="absolute left-0 top-0 bottom-0 z-10 px-4 bg-gradient-to-r from-[#0a0a0a] to-transparent text-[#c9a84c] font-bebas text-4xl">‹</button>
                            <div ref={scrollRef} className="flex overflow-x-auto gap-8 px-12 no-scrollbar scroll-smooth items-center">
                                {Array.from({ length: totalRondas }, (_, i) => i + 1).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setRondaActiva(f)}
                                        className={`px-6 py-2 font-bebas text-4xl transition-all flex-shrink-0 italic tracking-tighter relative ${rondaActiva === f ? 'text-[#c9a84c] scale-110' : 'text-gray-700 hover:text-gray-400'
                                            }`}
                                    >
                                        RONDA {f}
                                        {rondaActiva === f && <div className="absolute -bottom-4 left-0 right-0 h-1 bg-[#c9a84c]" />}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => scroll('R')} className="absolute right-0 top-0 bottom-0 z-10 px-4 bg-gradient-to-l from-[#0a0a0a] to-transparent text-[#c9a84c] font-bebas text-4xl">›</button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                            {/* Partidos Programados */}
                            <div className="lg:col-span-2 space-y-12">
                                <div>
                                    <h3 className="font-bebas text-4xl uppercase italic border-l-4 border-[#c9a84c] pl-4 mb-8">Cronograma <span className="text-[#c9a84c]">Copa</span></h3>
                                    <div className="grid gap-4">
                                        {partidosProgramados.length > 0 ? partidosProgramados.map(p => {
                                            const escL = equipos.find(e => e.id === p.localId)?.escudo || "/img/default-shield.png";
                                            const escV = equipos.find(e => e.id === p.visitaId)?.escudo || "/img/default-shield.png";
                                            return (
                                                <div key={p.id} className="bg-[#111] p-6 grid grid-cols-[1fr_auto_1fr] items-center border border-white/5 group hover:border-white/10 transition-all">
                                                    <div className="flex items-center gap-4 overflow-hidden">
                                                        <div className="relative w-10 h-10 shrink-0"><Image src={escL} alt="" fill className="object-contain " /></div>
                                                        <span className="font-bebas text-2xl uppercase truncate">{p.localNombre}</span>
                                                    </div>
                                                    <div className="px-6 font-bebas text-xl text-[#c9a84c] italic bg-black/40 py-1 mx-2 rounded">VS</div>
                                                    <div className="flex items-center gap-4 justify-end text-right overflow-hidden">
                                                        <span className="font-bebas text-2xl uppercase truncate">{p.visitaNombre}</span>
                                                        <div className="relative w-10 h-10 shrink-0"><Image src={escV} alt="" fill className="object-contain " /></div>
                                                    </div>
                                                </div>
                                            );
                                        }) : <div className="p-10 border border-dashed border-white/10 text-center text-gray-600 uppercase font-barlow text-xs italic tracking-widest">Sin cruces definidos aún.</div>}
                                    </div>
                                </div>

                                {/* Resultados Procesados */}
                                <div>
                                    <h3 className="font-bebas text-4xl uppercase italic border-l-4 border-[#c9a84c] pl-4 mb-8">
                                        Resultados <span className="text-[#c9a84c]">Oficiales</span>
                                    </h3>
                                    <div className="grid gap-6">
                                        {reportesRonda.length > 0 ? (
                                            reportesRonda.map((rep) => (
                                                <div key={rep.id} className="bg-[#111] p-8 border border-white/5 hover:border-[#c9a84c]/30 transition-all relative overflow-hidden group">
                                                    <div className="flex justify-between items-center relative z-10">
                                                        {/* LOCAL */}
                                                        <div className="flex-1 flex flex-col items-center gap-3">
                                                            <div className="relative w-16 h-16 grayscale group-hover:grayscale-0 transition-all">
                                                                <Image
                                                                    src={equipos.find(e => e.id === rep.equipoId)?.escudo || "/img/default-shield.png"}
                                                                    alt="" fill className="object-contain"
                                                                />
                                                            </div>
                                                            <p className="font-bebas text-2xl uppercase tracking-tighter text-center">{rep.local}</p>
                                                        </div>

                                                        {/* MARCADOR */}
                                                        <div className="px-10">
                                                            <div className="bg-black border border-white/10 px-8 py-3 font-bebas text-5xl text-[#c9a84c] skew-x-[-10deg]">
                                                                <div className="skew-x-[10deg]">{rep.score}</div>
                                                            </div>
                                                        </div>

                                                        {/* VISITA */}
                                                        <div className="flex-1 flex flex-col items-center gap-3">
                                                            <div className="relative w-16 h-16 grayscale group-hover:grayscale-0 transition-all">
                                                                <Image
                                                                    src={equipos.find(e => e.id === rep.rivalId)?.escudo || "/img/default-shield.png"}
                                                                    alt="" fill className="object-contain"
                                                                />
                                                            </div>
                                                            <p className="font-bebas text-2xl uppercase tracking-tighter text-center">{rep.visita}</p>
                                                        </div>
                                                    </div>

                                                    {/* PIE DE REPORTE (DT, COMENTARIOS Y CAPTURAS) */}
                                                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                                                        <div className="font-barlow text-[10px] tracking-[3px] uppercase text-gray-500 italic text-center md:text-left">
                                                            DT: {rep.nombreDT} <span className="mx-2 text-gray-800">/</span> {rep.comentario || "Sin comentarios"}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex gap-2">
                                                                {[rep.captura1, rep.captura2, rep.captura3].filter(Boolean).map((cap, i) => (
                                                                    <a
                                                                        key={i} href={cap} target="_blank"
                                                                        className="font-bebas text-xs bg-white/5 px-4 py-1 hover:bg-[#c9a84c] hover:text-black transition-all uppercase"
                                                                    >
                                                                        Cap {i + 1}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                            {userData?.rol === 'admin' && (
                                                                <button
                                                                    onClick={() => eliminarReporte(rep.id)}
                                                                    className="ml-4 text-red-900 hover:text-red-500 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" /></svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-[#0d0d0d] p-20 text-center border border-white/5">
                                                <p className="font-bebas text-3xl text-gray-800 uppercase italic">Esperando resultados...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Lateral: Reportes y Horarios */}
                            <aside className="space-y-12">
                                <div className="bg-[#111] border-t-4 border-[#c9a84c] p-8 shadow-2xl">
                                    <h4 className="font-bebas text-3xl mb-6 italic uppercase">Cargar <span className="text-[#c9a84c]">Copa</span></h4>
                                    {userData?.rol === "dt" ? (
                                        <FormularioReporte
                                            fechaNumero={rondaActiva}
                                            rivales={equipos.filter(e => e.nombre !== userData?.nombreEquipo)}
                                            equipoNombre={userData?.nombreEquipo || ""}
                                            esCopa={true}
                                        />
                                    ) : <div className="p-10 border border-dashed border-white/10 text-center text-gray-600 font-barlow text-xs uppercase">Solo para Directores Técnicos</div>}
                                </div>

                                <div className="bg-[#0d0d0d] p-8 border border-white/5">
                                    <h4 className="font-bebas text-3xl mb-8 uppercase italic border-b border-white/10 pb-4">Horarios <span className="text-[#c9a84c]">DTs</span></h4>
                                    <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
                                        {listaHorarios.length > 0 ? listaHorarios.map(h => (
                                            <div key={h.id} className="border-b border-white/5 pb-4 last:border-0 group">
                                                <p className="text-xs font-bold uppercase tracking-[3px] text-[#c9a84c] mb-2">{h.nombreEquipo}</p>
                                                <p className="text-gray-500 text-sm italic font-barlow leading-relaxed group-hover:text-gray-300 transition-colors">"{h.texto}"</p>
                                            </div>
                                        )) : <p className="text-gray-700 text-[10px] uppercase italic tracking-[4px]">Sin publicaciones.</p>}
                                    </div>
                                </div>

                                {userData?.rol === "dt" && (
                                    <div className="bg-[#c9a84c] p-1 skew-x-[-10deg]">
                                        <div className="bg-black p-6 skew-x-[10deg]">
                                            <SeccionDisponibilidad
                                                equipoId={equipoIdActivo!}
                                                nombreEquipo={nombreEquipoActivo!}
                                                fechaActiva={rondaActiva}
                                            />
                                        </div>
                                    </div>
                                )}
                            </aside>
                        </div>
                    </div>
                )}

                {/* --- SECCIÓN: PLAYOFFS --- */}
                {subTab === 'playoffs' && (
                    <div className="space-y-12">
                        <div className="flex items-center gap-6 mb-10">
                            <h3 className="font-bebas text-6xl uppercase italic tracking-tighter text-[#c9a84c]">Fase <span className="text-white">Final</span></h3>
                            <div className="h-[1px] flex-grow bg-white/5"></div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="bg-white/5 backdrop-blur-sm p-10 border-l-8 border-[#c9a84c] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 font-bebas text-7xl select-none">SF</div>
                                <h4 className="font-bebas text-3xl mb-8 italic text-white underline underline-offset-8 decoration-[#c9a84c]/30">Semifinales</h4>
                                <div className="space-y-6 font-barlow text-xl uppercase italic text-gray-300">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span>SF1</span>
                                        <span className="text-[#c9a84c]">1°A vs 2°B</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span>SF2</span>
                                        <span className="text-[#c9a84c]">1°B vs 2°A</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-[#111] to-[#050505] p-10 border-l-8 border-[#c9a84c] shadow-[0_0_50px_rgba(201,168,76,0.1)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-bebas text-9xl text-[#c9a84c] select-none italic">Cup</div>
                                <h4 className="font-bebas text-3xl mb-8 italic text-white underline underline-offset-8 decoration-[#c9a84c]/30">Gran Final</h4>
                                <div className="font-bebas text-5xl text-[#c9a84c] tracking-tighter leading-none">
                                    GANADOR SF1 <br /> <span className="text-white text-3xl italic mx-4 font-black">VS</span> <br /> GANADOR SF2
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-900/10 border-l-4 border-red-600 p-8">
                            <p className="text-gray-500 italic font-barlow leading-relaxed tracking-wide">
                                * Los cruces de playoffs se generan automáticamente al finalizar la fase de grupos. Manténganse atentos a los anuncios oficiales.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}