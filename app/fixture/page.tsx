"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, orderBy, doc, where, Timestamp, deleteDoc } from "firebase/firestore";
import { useAuth } from "@/src/lib/hooks/useAuht";
import FormularioReporte from "../components/FormularioReporte";
import SeccionDisponibilidad from "../components/SeccionDisponibilidad";

// Interfaces para que no rompa las bolas el any
interface Equipo {
    id: string;
    nombre: string;
}

interface Reporte {
    id: string;
    dtUid: string;
    equipoId: string;
    nombreDT: string;
    rivalId: string;
    resultado: 'victoria' | 'empate' | 'derrota';
    comentario: string;
    captura1: string;
    captura2: string;
    captura3: string;
    fechaTorneo: number;
    timestamp: Timestamp;
}

interface Disponibilidad {
    id: string;
    equipoId: string;
    nombreEquipo: string;
    fechaTorneo: number;
    texto: string;
    timestamp: Timestamp; //
}

export default function FixturePage() {
    const { userData } = useAuth();
    const [fechaActiva, setFechaActiva] = useState(1);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [reportesFecha, setReportesFecha] = useState<Reporte[]>([]); // Solución al any
    const [fechasAbiertas, setFechasAbiertas] = useState<Record<string, boolean>>({});
    const [listaHorarios, setListaHorarios] = useState<Disponibilidad[]>([]);
    const totalFechas = 19;

    // 1. Carga de datos iniciales (Equipos y Estado de Fechas)
    useEffect(() => {
        const qEquipos = query(collection(db, "equipos"), orderBy("nombre", "asc"));
        const unsubEquipos = onSnapshot(qEquipos, (snap) => {
            setEquipos(snap.docs.map(d => ({ id: d.id, nombre: d.data().nombre } as Equipo)));
        });

        const unsubEstado = onSnapshot(doc(db, "torneo", "configuracion"), (docSnap) => {
            if (docSnap.exists()) {
                setFechasAbiertas(docSnap.data().fechasStatus || {});
            }
        });

        return () => {
            unsubEquipos();
            unsubEstado();
        };
    }, []);

    // 2. Reportes en Tiempo Real (Filtrado por fecha activa)
    useEffect(() => {
        // Forzamos que sea número para evitar errores de tipo
        const numFecha = Number(fechaActiva);

        const qReportes = query(
            collection(db, "reportes"),
            where("fechaTorneo", "==", numFecha),
            orderBy("timestamp", "desc") 
        );

        const unsubReportes = onSnapshot(qReportes, (snap) => {
            setReportesFecha(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reporte)));
        }, (err) => {
            console.error("Error en reporte: ", err);
            // Si hay error de índice, al menos traemos los datos sin orden para que no quede vacío
            const qFallBack = query(collection(db, "reportes"), where("fechaTorneo", "==", numFecha));
            onSnapshot(qFallBack, (s) => {
                setReportesFecha(s.docs.map(d => ({ id: d.id, ...d.data() } as Reporte)));
            });
        });

        return () => unsubReportes();
    }, [fechaActiva]);

    useEffect(() => {
        const q = query(
            collection(db, "disponibilidad"),
            where("fechaTorneo", "==", fechaActiva)
        );
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({
                id: d.id,
                ...d.data()
            } as Disponibilidad));
            setListaHorarios(data);
        });
        return () => unsub();
    }, [fechaActiva]);

    const estaAbierta = fechasAbiertas[`fecha_${fechaActiva}`] === true;

    const eliminarReporte = async (reporteId: string) => {
        const confirmar = window.confirm("¿Estás seguro de eliminar este reporte? Esto no restará los puntos automáticamente de la tabla, deberás ajustarlos manualmente en la sección de Equipos.");

        if (confirmar) {
            try {
                await deleteDoc(doc(db, "reportes", reporteId));
                alert("Reporte eliminado correctamente.");
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("No tenés permisos para eliminar o hubo un error de conexión.");
            }
        }
    };

    const eliminarDisponibilidad = async (id: string) => {
        const confirmar = window.confirm("¿Estás seguro de eliminar este horario?");
        if (confirmar) {
            try {
                await deleteDoc(doc(db, "disponibilidad", id));
                alert("Disponibilidad eliminada.");
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("No tienes permisos para realizar esta acción.");
            }
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-10 font-barlow-condensed">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* CABECERA */}
                <div className="border-l-4 border-[#c9a84c] pl-6">
                    <h1 className="font-bebas text-7xl text-white italic tracking-tighter uppercase leading-none">
                        Calendario <span className="text-[#c9a84c]">Oficial</span>
                    </h1>
                    <p className="text-gray-500 uppercase tracking-[4px] text-sm italic">Temporada 1 · El Legado PES 6</p>
                </div>

                {/* NAVEGACIÓN DE FECHAS (CARRUSEL ELITE) */}
                <div className="relative group bg-[#111] border-y border-[#222] py-2">
                    <button
                        onClick={() => document.getElementById('carrusel-fechas')?.scrollBy({ left: -200, behavior: 'smooth' })}
                        className="absolute left-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-r from-[#111] to-transparent text-[#c9a84c] hover:text-white transition-all"
                    >
                        <span className="font-bebas text-4xl leading-none">‹</span>
                    </button>

                    <div
                        id="carrusel-fechas"
                        className="flex overflow-x-auto gap-4 px-10 no-scrollbar scroll-smooth items-center"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {Array.from({ length: totalFechas }, (_, i) => i + 1).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFechaActiva(f)}
                                className={`px-8 py-3 font-bebas text-3xl transition-all flex-shrink-0 italic tracking-widest relative ${fechaActiva === f ? "text-[#c9a84c] scale-110" : "text-[#333] hover:text-gray-400"}`}
                            >
                                FECHA {f}
                                {fechaActiva === f && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.6)]"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => document.getElementById('carrusel-fechas')?.scrollBy({ left: 200, behavior: 'smooth' })}
                        className="absolute right-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-l from-[#111] to-transparent text-[#c9a84c] hover:text-white transition-all"
                    >
                        <span className="font-bebas text-4xl leading-none">›</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    <section className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <h3 className="font-bebas text-3xl text-white uppercase italic tracking-widest">Cronograma de Partidos</h3>
                                {!estaAbierta && (
                                    <span className="bg-red-600/20 text-red-500 border border-red-600/50 px-3 py-0.5 text-[10px] font-bold uppercase italic">Cerrada</span>
                                )}
                            </div>

                            <div className="bg-[#111] border-l-4 border-[#c9a84c] p-5 flex justify-between items-center opacity-80">
                                <div className="text-right flex-1"><p className="font-bebas text-2xl text-white italic uppercase tracking-wider">Arsenal</p></div>
                                <div className="px-8 text-[#c9a84c] font-bebas text-3xl italic">VS</div>
                                <div className="text-left flex-1"><p className="font-bebas text-2xl text-white italic uppercase tracking-wider">Inter Milán</p></div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-10 border-t border-[#222]">
                            <h3 className="font-bebas text-3xl text-[#c9a84c] uppercase italic tracking-widest">Resultados Fecha {fechaActiva}</h3>
                            <div className="grid gap-3">
                                {reportesFecha.length > 0 ? (
                                    reportesFecha.map((rep) => (
                                        <div key={rep.id} className="bg-[#111] border border-[#222] p-4 flex flex-col md:flex-row justify-between items-center group hover:border-[#c9a84c]/40 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <p className="text-[#c9a84c] font-bebas text-2xl leading-none uppercase italic">{rep.nombreDT}</p>
                                                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">DT Reportante</span>
                                                </div>
                                                <div className="h-10 w-px bg-[#222]"></div>
                                                <div>
                                                    <p className="text-white text-sm font-bold uppercase">
                                                        Resultado: <span className={rep.resultado === 'victoria' ? 'text-green-500' : rep.resultado === 'derrota' ? 'text-red-500' : 'text-orange-500 italic'}>
                                                            {rep.resultado}
                                                        </span>
                                                    </p>
                                                    <p className="text-gray-500 text-[11px] italic mt-0.5">{rep.comentario || "Sin comentarios del mánager."}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2 mt-4 md:mt-0">
                                                <a href={rep.captura1} target="_blank" className="bg-[#0a0a0a] hover:bg-[#c9a84c] hover:text-black text-gray-500 text-[9px] px-3 py-1.5 font-bold uppercase transition-all border border-[#222]">Captura 1</a>
                                                <a href={rep.captura2} target="_blank" className="bg-[#0a0a0a] hover:bg-[#c9a84c] hover:text-black text-gray-500 text-[9px] px-3 py-1.5 font-bold uppercase transition-all border border-[#222]">Captura 2</a>
                                                <a href={rep.captura3} target="_blank" className="bg-[#0a0a0a] hover:bg-[#c9a84c] hover:text-black text-gray-500 text-[9px] px-3 py-1.5 font-bold uppercase transition-all border border-[#222]">Captura 3</a>
                                            </div>
                                            <div key={rep.id} className="bg-[#111] border border-[#222] p-4 ...">
                                                <div className="flex items-center gap-4">
                                                    {/* ... (info del reporte) ... */}
                                                </div>

                                                <div className="flex items-center gap-3 mt-4 md:mt-0">

                                                    {/* BOTÓN ELIMINAR (SOLO PARA ADMIN) */}
                                                    {userData?.rol === 'admin' && (
                                                        <button
                                                            onClick={() => eliminarReporte(rep.id)}
                                                            className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 p-1.5 transition-all group/btn"
                                                            title="Eliminar Reporte"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                    ))
                                ) : (
                                    <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-10 text-center">
                                        <p className="text-gray-700 font-bebas text-xl uppercase tracking-widest italic opacity-40">No hay resultados procesados aún.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-6">
                        {/* SECCIÓN DE DISPONIBILIDAD PERSONAL (Solo para DTs) */}
                        {userData?.rol === "dt" && (
                            <SeccionDisponibilidad
                                equipoId={userData.equipoId!}
                                nombreEquipo={userData.nombreEquipo!}
                                fechaActiva={fechaActiva}
                            />
                        )}

                        {/* LISTA DE DISPONIBILIDAD DE TODOS LOS DTs */}
                        <div className="bg-[#0f0f0f] border border-[#222] p-5 space-y-4">
                            <h4 className="font-bebas text-2xl text-white uppercase italic">Horarios de los DTs</h4>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {listaHorarios.length > 0 ? (
                                    listaHorarios.map(h => (
                                        <div key={h.id} className="border-b border-[#222] pb-2">
                                            <p className="text-[#c9a84c] text-[15px] font-bold uppercase tracking-wider">
                                                {h.nombreEquipo}
                                            </p>
                                            <p className="text-gray-400 text-[14px] leading-tight mt-1 italic">
                                                {h.texto}
                                            </p>
                                            {/* BOTÓN ELIMINAR (SOLO ADMIN) */}
                                            {userData?.rol === 'admin' && (
                                                <button
                                                    onClick={() => eliminarDisponibilidad(h.id)}
                                                    className="ml-2 p-1 text-gray-600 hover:text-red-500 transition-colors"
                                                    title="Eliminar disponibilidad"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600 text-xs italic">Nadie cargó horarios todavía.</p>
                                )}
                            </div>
                        </div>
                        <div className={`p-6 shadow-2xl transition-all border-t-2 ${estaAbierta ? "bg-[#0f0f0f] border-[#c9a84c]" : "bg-[#0f0f0f] border-red-900 opacity-60"}`}>
                            <h4 className="font-bebas text-3xl text-white mb-2 italic uppercase">Reportar partido</h4>
                            {estaAbierta ? (
                                userData?.rol === "dt" ? (
                                    <FormularioReporte
                                        fechaNumero={fechaActiva}
                                        rivales={equipos.filter(e => e.id !== userData.equipoId)}
                                    />
                                ) : (
                                    <p className="text-[#c9a84c] font-bold text-xs uppercase text-center py-6 border border-dashed border-[#222]">Acceso restringido a DTs</p>
                                )
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="text-red-700 text-5xl font-bebas italic leading-none mb-2">Bloqueado</div>
                                    <p className="text-gray-600 text-[10px] uppercase tracking-[3px] leading-tight">La jornada no ha sido habilitada por el Admin</p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}