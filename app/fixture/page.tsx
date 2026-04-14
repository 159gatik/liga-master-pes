"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import {
    collection, query, onSnapshot, orderBy,
    doc, where, Timestamp, deleteDoc
} from "firebase/firestore";
import { useAuth } from "@/src/lib/hooks/useAuht";
import FormularioReporte from "../components/FormularioReporte";
import SeccionDisponibilidad from "../components/SeccionDisponibilidad";
import Image from "next/image";

// Interfaces
interface Equipo { id: string; nombre: string; escudo?: string; }
interface Reporte { id: string; local: string; visita: string; equipoId: string; rivalId: string; score: string; dtUid: string; nombreDT: string; resultado: string; comentario: string; captura1: string; captura2: string; captura3: string; fechaTorneo: number; fecha: Timestamp; }
interface Disponibilidad { id: string; equipoId: string; nombreEquipo: string; fechaTorneo: number; texto: string; fecha: Timestamp; }
interface PartidoProgramado { id: string; localNombre: string; visitaNombre: string; fechaTorneo: number; localId: string; visitaId: string; }

export default function FixturePage() {
    const { userData } = useAuth();
    const [fechaActiva, setFechaActiva] = useState(1);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [reportesFecha, setReportesFecha] = useState<Reporte[]>([]);
    const [fechasAbiertas, setFechasAbiertas] = useState<Record<string, boolean>>({});
    const [listaHorarios, setListaHorarios] = useState<Disponibilidad[]>([]);
    const [partidosProgramados, setPartidosProgramados] = useState<PartidoProgramado[]>([]);
    const totalFechas = 18;

    // 1. Carga de datos iniciales (Equipos y Config)
    useEffect(() => {
        const qEquipos = query(collection(db, "equipos"), orderBy("nombre", "asc"));
        const unsubEquipos = onSnapshot(qEquipos,
            (snap) => {
                setEquipos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Equipo)));
            },
            (error) => {
                console.warn("Fixture: Error en equipos (Modo invitado)", error);
            }
        );

        const unsubEstado = onSnapshot(doc(db, "torneo", "configuracion"),
            (docSnap) => {
                if (docSnap.exists()) {
                    setFechasAbiertas(docSnap.data().fechasStatus || {});
                }
            },
            (error) => {
                console.warn("Fixture: Error en config (Modo invitado)", error);
            }
        );

        return () => { unsubEquipos(); unsubEstado(); };
    }, []);

    // 2. Carga de Partidos Programados (Cruces) y Reportes
    useEffect(() => {
        const numFecha = Number(fechaActiva);

        // Carga de cruces programados
        const qCruces = query(collection(db, "partidos"), where("fechaTorneo", "==", numFecha));
        const unsubCruces = onSnapshot(qCruces, (snap) => {
            setPartidosProgramados(snap.docs.map(d => ({ id: d.id, ...d.data() } as PartidoProgramado)));
        });

        // Carga de reportes procesados
        const qReportes = query(
            collection(db, "reportes"),
            where("fechaTorneo", "==", numFecha),
            orderBy("fecha", "desc")
        );

        const unsubReportes = onSnapshot(qReportes,
            (snap) => {
                setReportesFecha(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reporte)));
            },
            (err) => {
                const qFallBack = query(collection(db, "reportes"), where("fechaTorneo", "==", numFecha));
                onSnapshot(qFallBack, (s) => {
                    setReportesFecha(s.docs.map(d => ({ id: d.id, ...d.data() } as Reporte)));
                });
            }
        );

        return () => { unsubCruces(); unsubReportes(); };
    }, [fechaActiva]);

    // 3. Disponibilidad
    useEffect(() => {
        const q = query(
            collection(db, "disponibilidad"),
            where("fechaTorneo", "==", fechaActiva)
        );
        const unsub = onSnapshot(q,
            (snap) => {
                setListaHorarios(snap.docs.map(d => ({ id: d.id, ...d.data() } as Disponibilidad)));
            },
            (error) => {
                console.warn("Fixture: Acceso denegado a disponibilidad");
            }
        );
        return () => unsub();
    }, [fechaActiva]);

    const estaAbierta = fechasAbiertas[`fecha_${fechaActiva}`] === true;

    const eliminarReporte = async (reporteId: string) => {
        if (window.confirm("¿Estás seguro de eliminar este reporte?")) {
            try {
                await deleteDoc(doc(db, "reportes", reporteId));
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-10 font-barlow-condensed text-white">
            <div className="max-w-6xl mx-auto space-y-10">
                <div className="border-l-4 border-[#c9a84c] pl-6">
                    <h1 className="font-bebas text-7xl italic tracking-tighter uppercase leading-none">
                        Calendario <span className="text-[#c9a84c]">Oficial</span>
                    </h1>
                    <p className="text-gray-500 uppercase tracking-[4px] text-sm italic">Temporada 1 · El Legado PES 6</p>
                </div>

                {/* NAVEGACIÓN (Carrusel) */}
                <div className="relative group bg-[#111] border-y border-[#222] py-2">
                    <button onClick={() => document.getElementById('carrusel-fechas')?.scrollBy({ left: -200, behavior: 'smooth' })} className="absolute left-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-r from-[#111] to-transparent text-[#c9a84c]"><span className="font-bebas text-4xl">‹</span></button>
                    <div id="carrusel-fechas" className="flex overflow-x-auto gap-4 px-10 no-scrollbar scroll-smooth items-center" style={{ scrollbarWidth: 'none' }}>
                        {Array.from({ length: totalFechas }, (_, i) => i + 1).map((f) => (
                            <button key={f} onClick={() => setFechaActiva(f)} className={`px-8 py-3 font-bebas text-3xl transition-all flex-shrink-0 italic tracking-widest relative ${fechaActiva === f ? "text-[#c9a84c] scale-110" : "text-[#333] hover:text-gray-400"}`}>
                                FECHA {f}
                                {fechaActiva === f && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c9a84c]"></div>}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => document.getElementById('carrusel-fechas')?.scrollBy({ left: 200, behavior: 'smooth' })} className="absolute right-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-l from-[#111] to-transparent text-[#c9a84c]"><span className="font-bebas text-4xl">›</span></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <section className="lg:col-span-2 space-y-12">

                        {/* CRONOGRAMA DE PARTIDOS (Lo que agregamos) */}
                        <div className="space-y-6">
                            <h3 className="font-bebas text-3xl text-[#c9a84c] uppercase italic tracking-widest border-b border-[#222] pb-2">
                                Partidos Programados
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {partidosProgramados.length > 0 ? (
                                    partidosProgramados.map((p) => {
                                        // Buscamos los escudos en el array de equipos cargado en el estado
                                        const escudoLocal = equipos.find(e => e.id === p.localId)?.escudo || "/escudo-default.png";
                                        const escudoVisita = equipos.find(e => e.id === p.visitaId)?.escudo || "/escudo-default.png";

                                        return (
                                            <div key={p.id} className="bg-[#050505] border border-[#222] p-4 flex justify-between items-center px-6 italic hover:border-[#c9a84c]/30 transition-all shadow-lg">
                                                {/* LOCAL */}
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="relative w-8 h-8 flex-shrink-0">
                                                        <Image src={escudoLocal} alt={p.localNombre} fill className="object-contain" />
                                                    </div>
                                                    <span className="font-bebas text-xl text-white uppercase truncate">{p.localNombre}</span>
                                                </div>

                                                {/* SEPARADOR */}
                                                <span className="text-[#c9a84c] font-bebas text-xl mx-4">VS</span>

                                                {/* VISITA */}
                                                <div className="flex items-center gap-3 flex-1 justify-end text-right">
                                                    <span className="font-bebas text-xl text-white uppercase truncate">{p.visitaNombre}</span>
                                                    <div className="relative w-8 h-8 flex-shrink-0">
                                                        <Image src={escudoVisita} alt={p.visitaNombre} fill className="object-contain" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="col-span-2 text-center text-gray-700 italic text-sm py-4 border border-dashed border-[#222]">
                                        No hay enfrentamientos cargados para esta fecha.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* RESULTADOS PROCESADOS */}
                        <div className="space-y-6">
                            <h3 className="font-bebas text-3xl text-[#c9a84c] uppercase italic tracking-widest border-b border-[#222] pb-2">Resultados Procesados</h3>
                            <div className="grid gap-4">
                                {reportesFecha.length > 0 ? (
                                    reportesFecha.map((rep) => (
                                        <div key={rep.id} className="bg-[#111] border border-[#222] p-6 flex flex-col group hover:border-[#c9a84c]/40 transition-all shadow-xl">
                                            <div className="flex justify-between items-center mb-6 text-center">
                                                <div className="flex-1 flex flex-col items-center gap-2">
                                                    <div className="relative w-12 h-12 flex-shrink-0 bg-black/40 rounded-full p-2 border border-[#222] overflow-hidden">
                                                        <Image src={equipos.find(e => e.id === rep.equipoId)?.escudo || "/escudo-default.png"} alt="Local" fill className="object-contain p-2" />
                                                    </div>
                                                    <p className="font-bebas text-2xl text-white uppercase italic tracking-wider line-clamp-1">{rep.local}</p>
                                                </div>
                                                <div className="px-4">
                                                    <div className="bg-black border border-[#333] px-6 py-2 font-bebas text-4xl text-[#c9a84c] rounded">{rep.score}</div>
                                                </div>
                                                <div className="flex-1 flex flex-col items-center gap-2">
                                                    <div className="relative w-12 h-12 flex-shrink-0 bg-black/40 rounded-full p-2 border border-[#222] overflow-hidden">
                                                        <Image src={equipos.find(e => e.id === rep.rivalId)?.escudo || "/escudo-default.png"} alt="Visita" fill className="object-contain p-2" />
                                                    </div>
                                                    <p className="font-bebas text-2xl text-white uppercase italic tracking-wider line-clamp-1">{rep.visita}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-[#222]/50 gap-4">
                                                <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest font-bold">
                                                    <div className="text-[#c9a84c]">DT {rep.nombreDT}</div>
                                                    <div className="text-gray-500 italic lowercase font-normal">{rep.comentario || "Sin comentarios"}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <a href={rep.captura1} target="_blank" className="bg-black hover:bg-[#c9a84c] hover:text-black text-gray-600 text-[10px] px-3 py-1 border border-[#222]">CAP 1</a>
                                                        <a href={rep.captura2} target="_blank" className="bg-black hover:bg-[#c9a84c] hover:text-black text-gray-600 text-[10px] px-3 py-1 border border-[#222]">CAP 2</a>
                                                        <a href={rep.captura3} target="_blank" className="bg-black hover:bg-[#c9a84c] hover:text-black text-gray-600 text-[10px] px-3 py-1 border border-[#222]">CAP 3</a>
                                                    </div>
                                                    {userData?.rol === 'admin' && (
                                                        <button onClick={() => eliminarReporte(rep.id)} className="ml-2 text-red-900 hover:text-red-500">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                        <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-16 text-center">
                                            <p className="text-gray-700 font-bebas text-2xl uppercase tracking-[5px] italic opacity-30">No hay resultados procesados aún</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <div className={`p-6 border-t-2 transition-all shadow-2xl ${estaAbierta ? "bg-[#0f0f0f] border-[#c9a84c]" : "bg-[#0f0f0f] border-red-900 opacity-60"}`}>
                            <h4 className="font-bebas text-3xl text-white mb-4 italic uppercase">Reportar partido</h4>
                            {estaAbierta ? (
                                userData?.rol === "dt" ? (
                                    <FormularioReporte fechaNumero={fechaActiva} rivales={equipos.filter(e => e.id !== userData.equipoId)} equipoNombre={equipos.find(e => e.id === userData.equipoId)?.nombre || "Mi Equipo"} />
                                ) : (
                                    <p className="text-[#c9a84c] font-bold text-xs uppercase text-center py-6 border border-dashed border-[#222]">Acceso restringido a DTs</p>
                                )
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="text-red-700 text-5xl font-bebas italic leading-none mb-2">Bloqueado</div>
                                    <p className="text-gray-600 text-[10px] uppercase tracking-[3px]">Jornada no habilitada</p>
                                </div>
                            )}
                        </div>
                        <div className="bg-[#0f0f0f] border border-[#222] p-5 space-y-4">
                            <h4 className="font-bebas text-2xl text-white uppercase italic border-b border-[#222] pb-2">Horarios de los DTs</h4>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {listaHorarios.length > 0 ? (
                                    listaHorarios.map(h => (
                                        <div key={h.id} className="border-b border-[#222]/50 pb-2 last:border-0">
                                            <p className="text-[#c9a84c] text-[13px] font-bold uppercase tracking-wider">{h.nombreEquipo}</p>
                                            <p className="text-gray-400 text-[13px] leading-tight mt-1 italic font-light">{h.texto}</p>
                                        </div>
                                    ))
                                ) : (
                                        <p className="text-gray-600 text-xs italic">Nadie cargó horarios todavía para esta fecha.</p>
                                )}
                            </div>
                        </div>
                        {userData?.rol === "dt" && (
                            <SeccionDisponibilidad equipoId={userData.equipoId!} nombreEquipo={userData.nombreEquipo!} fechaActiva={fechaActiva} />
                        )}
                    </aside>
                </div>
            </div>
        </main>
    );
}