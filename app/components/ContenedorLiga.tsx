"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/src/lib/firebase";
import {
    collection, query, onSnapshot, orderBy,
    doc, where, Timestamp, deleteDoc
} from "firebase/firestore";
import { useAuth } from "@/src/lib/hooks/useAuht";
import FormularioReporte from "./FormularioReporte";
import SeccionDisponibilidad from "./SeccionDisponibilidad";
import Image from "next/image";

// Interfaces
interface Equipo { id: string; nombre: string; escudo?: string; division?: string; }
interface Reporte { id: string; local: string; visita: string; equipoId: string; rivalId: string; score: string; dtUid: string; nombreDT: string; resultado: string; comentario: string; captura1: string; captura2: string; captura3: string; fechaTorneo: number; fecha: Timestamp; division?: string; }
interface Disponibilidad { id: string; equipoId: string; nombreEquipo: string; fechaTorneo: number; texto: string; fecha: Timestamp; division?: string; }
interface PartidoProgramado { id: string; localNombre: string; visitaNombre: string; fechaTorneo: number; localId: string; visitaId: string; division?: string; }

interface Props {
    division?: 'A' | 'B'; // Prop obligatoria para el filtrado
    colEquipos?: string;
    colPartidos?: string;
    colReportes?: string;
    colDisponibilidad?: string;
    colTorneo?: string;
    acento?: string;
    temporada?: string;
}

export default function ContenedorLiga({
    division,
    colEquipos = "equipos",
    colPartidos = "partidos",
    colReportes = "reportes",
    colDisponibilidad = "disponibilidad",
    colTorneo = "torneo",
    acento = "#c9a84c",
    temporada = "Temporada 1 · El Legado PES 6"
}: Props) {
    const { user, userData, isAdmin, loading, equipoIdActivo, nombreEquipoActivo } = useAuth();
    const [fechaActiva, setFechaActiva] = useState(1);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [reportesFecha, setReportesFecha] = useState<Reporte[]>([]);
    const [fechasAbiertas, setFechasAbiertas] = useState<Record<string, boolean>>({});
    const [listaHorarios, setListaHorarios] = useState<Disponibilidad[]>([]);
    const [partidosProgramados, setPartidosProgramados] = useState<PartidoProgramado[]>([]);
    const [cargandoConfig, setCargandoConfig] = useState(true);

    const totalFechas = 18;

    // 1. Equipos y Config (Filtrados por División)
    useEffect(() => {
        const qEquipos = query(
            collection(db, colEquipos),
            where("division", "==", division), // Filtro de división
            orderBy("nombre", "asc")
        );
        const unsubEquipos = onSnapshot(qEquipos, (snap) => {
            setEquipos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Equipo)));
        });

        const unsubEstado = onSnapshot(doc(db, colTorneo, "configuracion"), (docSnap) => {
            if (docSnap.exists()) setFechasAbiertas(docSnap.data().fechasStatus || {});
            setCargandoConfig(false);
        });

        return () => { unsubEquipos(); unsubEstado(); };
    }, [colEquipos, colTorneo, division]);

    // 2. Partidos y Reportes (Filtrados por Fecha y División)
    useEffect(() => {
        const numFecha = Number(fechaActiva);

        const qCruces = query(
            collection(db, colPartidos),
            where("fechaTorneo", "==", numFecha),
            where("division", "==", division) // Filtro de división
        );
        const unsubCruces = onSnapshot(qCruces, (snap) => {
            setPartidosProgramados(snap.docs.map(d => ({ id: d.id, ...d.data() } as PartidoProgramado)));
        });

        const qReportes = query(
            collection(db, colReportes),
            where("fechaTorneo", "==", numFecha),
            where("division", "==", division), // Filtro de división
            orderBy("fecha", "desc")
        );
        const unsubReportes = onSnapshot(qReportes, (snap) => {
            setReportesFecha(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reporte)));
        });

        return () => { unsubCruces(); unsubReportes(); };
    }, [fechaActiva, colPartidos, colReportes, division]);

    // 3. Disponibilidad (Filtrada por División)
    useEffect(() => {
        const q = query(
            collection(db, colDisponibilidad),
            where("fechaTorneo", "==", fechaActiva),
            where("division", "==", division) // Filtro de división
        );
        const unsub = onSnapshot(q, (snap) => {
            setListaHorarios(snap.docs.map(d => ({ id: d.id, ...d.data() } as Disponibilidad)));
        });
        return () => unsub();
    }, [fechaActiva, colDisponibilidad, division]);

    const estaAbierta = fechasAbiertas[`fecha_${fechaActiva}`] === true;

    const eliminarReporte = async (reporteId: string) => {
        if (window.confirm("¿Estás seguro de eliminar este reporte?")) {
            try { await deleteDoc(doc(db, colReportes, reporteId)); } catch (e) { console.error(e); }
        }
    };

    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth / 2
                : scrollLeft + clientWidth / 2;

            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full space-y-12 animate-in fade-in duration-700">

            {/* CARRUSEL FECHAS (Estilo Minimalista Webild) */}
            <div className="relative group bg-white/[0.02] border-y border-white/5 py-4 overflow-hidden">

                {/* Flecha Izquierda */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-10 px-4 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-[#c9a84c] hover:text-white"
                >
                    <span className="font-bebas text-5xl leading-none">‹</span>
                </button>

                {/* Contenedor Scrollable */}
                <div
                    ref={scrollRef}
                    id="carrusel-fechas"
                    className="flex overflow-x-auto gap-8 px-10 no-scrollbar scroll-smooth items-center"
                >
                    {Array.from({ length: totalFechas }, (_, i) => i + 1).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFechaActiva(f)}
                            className={`px-6 py-2 font-bebas text-4xl transition-all flex-shrink-0 italic tracking-tighter relative ${fechaActiva === f ? 'text-[#c9a84c] scale-110' : 'text-gray-700 hover:text-gray-400'
                                }`}
                        >
                            F{f}
                            {fechaActiva === f && (
                                <div className="absolute -bottom-4 left-0 right-0 h-1 bg-[#c9a84c]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Flecha Derecha */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-10 px-4 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-[#c9a84c] hover:text-white"
                >
                    <span className="font-bebas text-5xl leading-none">›</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                {/* COLUMNA PRINCIPAL */}
                <section className="lg:col-span-2 space-y-16">

                    {/* PARTIDOS PROGRAMADOS */}
                    <div className="space-y-8">
                        <h3 className="font-bebas text-4xl uppercase italic tracking-tighter border-l-4 border-[#c9a84c] pl-4">
                            Cronograma <span className="text-[#c9a84c]">de Partidos</span>
                        </h3>
                        <div className="grid gap-4">
                            {partidosProgramados.length > 0 ? (
                                partidosProgramados.map((p) => {
                                    const escL = equipos.find(e => e.id === p.localId)?.escudo || "/img/default-shield.png";
                                    const escV = equipos.find(e => e.id === p.visitaId)?.escudo || "/img/default-shield.png";
                                    return (
                                        <div
                                            key={p.id}
                                            className="bg-[#111] p-4 md:p-6 grid grid-cols-[1fr_auto_1fr] items-center border border-white/5 hover:border-[#c9a84c]/30 transition-all group gap-2 md:gap-0"
                                        >
                                            {/* LOCAL */}
                                            <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                                                <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
                                                    <Image src={escL} alt={p.localNombre} fill className="object-contain" />
                                                </div>
                                                <span className="font-bebas text-lg md:text-2xl uppercase tracking-tighter truncate">
                                                    {p.localNombre}
                                                </span>
                                            </div>

                                            {/* SEPARADOR VS */}
                                            <div className="px-3 md:px-6 text-center">
                                                <span className="font-bebas text-sm md:text-xl text-[#c9a84c] italic bg-black/40 px-2 py-1 rounded">
                                                    VS
                                                </span>
                                            </div>

                                            {/* VISITA */}
                                            <div className="flex items-center gap-2 md:gap-4 justify-end overflow-hidden text-right">
                                                <span className="font-bebas text-lg md:text-2xl uppercase tracking-tighter truncate order-2 md:order-1">
                                                    {p.visitaNombre}
                                                </span>
                                                <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 order-1 md:order-2">
                                                    <Image src={escV} alt={p.visitaNombre} fill className="object-contain" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-12 border border-dashed border-white/5 text-center text-gray-600 font-barlow uppercase tracking-[4px] text-xs italic">
                                    No hay enfrentamientos para esta jornada.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RESULTADOS */}
                    <div className="space-y-8">
                        <h3 className="font-bebas text-4xl uppercase italic tracking-tighter border-l-4 border-[#c9a84c] pl-4">
                            Resultados <span className="text-[#c9a84c]">Oficiales</span>
                        </h3>
                        <div className="grid gap-6">
                            {reportesFecha.length > 0 ? (
                                reportesFecha.map((rep) => (
                                    <div key={rep.id} className="bg-[#111] p-8 border border-white/5 hover:border-[#c9a84c]/30 transition-all relative overflow-hidden group">
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="flex-1 flex flex-col items-center gap-3">
                                                <div className="relative w-16 h-16 grayscale group-hover:grayscale-0 transition-all">
                                                    <Image src={equipos.find(e => e.id === (rep.equipoId))?.escudo || "/img/default-shield.png"} alt="" fill className="object-contain" />
                                                </div>
                                                <p className="font-bebas text-2xl uppercase tracking-tighter">{rep.local}</p>
                                            </div>

                                            <div className="px-10">
                                                <div className="bg-black border border-white/10 px-8 py-3 font-bebas text-5xl text-[#c9a84c] skew-x-[-10deg]">
                                                    <div className="skew-x-[10deg]">{rep.score}</div>
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col items-center gap-3">
                                                <div className="relative w-16 h-16 grayscale group-hover:grayscale-0 transition-all">
                                                    <Image src={equipos.find(e => e.id === (rep.rivalId))?.escudo || "/img/default-shield.png"} alt="" fill className="object-contain" />
                                                </div>
                                                <p className="font-bebas text-2xl uppercase tracking-tighter">{rep.visita}</p>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                                            <div className="font-barlow text-[10px] tracking-[3px] uppercase text-gray-500 italic">
                                                DT: {rep.nombreDT} <span className="mx-2 text-gray-800">/</span> {rep.comentario || "Sin comentarios"}
                                            </div>
                                            <div className="flex gap-2">
                                                {[rep.captura1, rep.captura2, rep.captura3].filter(Boolean).map((cap, i) => (
                                                    <a key={i} href={cap} target="_blank" className="font-bebas text-xs bg-white/5 px-4 py-1 hover:bg-[#c9a84c] hover:text-black transition-all uppercase">Cap {i + 1}</a>
                                                ))}
                                                {userData?.rol === 'admin' && (
                                                    <button onClick={() => eliminarReporte(rep.id)} className="ml-4 text-red-900 hover:text-red-500 transition-colors">
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
                </section>

                {/* LATERAL (ASIDE) */}
                <aside className="space-y-12">

                    {/* SECCIÓN REPORTE */}
                    <div className={`p-8 border-t-4 bg-[#111] transition-all shadow-2xl ${!cargandoConfig && estaAbierta ? 'border-[#c9a84c]' : 'border-red-900 opacity-60'}`}>
                        <h4 className="font-bebas text-3xl mb-6 italic uppercase">Cargar <span className="text-[#c9a84c]">Resultado</span></h4>
                        {cargandoConfig ? (
                            <div className="py-10 text-center animate-pulse font-barlow text-xs tracking-widest">Sincronizando...</div>
                        ) : estaAbierta ? (
                            userData?.rol === "dt" ? (
                                <FormularioReporte
                                    fechaNumero={fechaActiva}
                                    rivales={equipos.filter(e => e.id !== equipoIdActivo)}
                                    equipoNombre={equipos.find(e => e.id === equipoIdActivo)?.nombre || "Mi Equipo"}
                                />
                            ) : (
                                <div className="py-10 text-center border border-dashed border-white/10 italic text-gray-600 font-barlow text-xs uppercase tracking-widest">Solo DTs autorizados</div>
                            )
                        ) : (
                            <div className="py-12 text-center">
                                <div className="text-red-700 text-5xl font-bebas italic leading-none mb-2">CERRADO</div>
                                <p className="text-gray-600 text-[9px] uppercase tracking-[5px] font-bold">Jornada Inactiva</p>
                            </div>
                        )}
                    </div>

                    {/* HORARIOS */}
                    <div className="bg-[#0d0d0d] p-8 border border-white/5">
                        <h4 className="font-bebas text-3xl mb-8 uppercase italic border-b border-white/10 pb-4">Disponibilidad <span className="text-[#c9a84c]">DTs</span></h4>
                        <div className="space-y-6 max-h-[500px] overflow-y-auto no-scrollbar">
                            {listaHorarios.length > 0 ? (
                                listaHorarios.map(h => (
                                    <div key={h.id} className="group border-b border-white/5 pb-4 last:border-0">
                                        <p className="text-xs font-bold uppercase tracking-[3px] text-[#c9a84c] mb-2">{h.nombreEquipo}</p>
                                        <p className="text-gray-500 text-sm italic font-barlow leading-relaxed group-hover:text-gray-300 transition-colors">"{h.texto}"</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-700 text-[10px] uppercase tracking-[4px] italic">Sin horarios publicados.</p>
                            )}
                        </div>
                    </div>

                    {/* ACCIÓN DISPONIBILIDAD */}
                    {userData?.rol === "dt" && (
                        <div className="bg-[#c9a84c] p-1 skew-x-[-10deg]">
                            <div className="bg-black p-6 skew-x-[10deg]">
                                <SeccionDisponibilidad
                                    equipoId={equipoIdActivo!}
                                    nombreEquipo={nombreEquipoActivo!}
                                    fechaActiva={fechaActiva}
                                />
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}