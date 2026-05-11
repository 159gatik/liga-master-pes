"use client";
import { useState, useEffect } from "react";
import { db } from "../../src/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc } from "firebase/firestore";

// --- INTERFACES ---
interface Jugador {
    id?: string;
    nombre: string;
    pos: string;
    edad: number;
    dorsal: number;
    valor: number;
}

interface EquipoProps {
    equipo: {
        id: string;
        nombre: string;
        dt: string;
        dtUid?: string;
        presupuesto: number;
        valor_plantilla: number;
        titulos?: string[];
        copas?: string[];
    };
}

export default function DetalleEquipo({ equipo }: EquipoProps) {
    const [activeTab, setActiveTab] = useState("plantilla");

    return (
        <div className="w-full bg-[#0a0a0a] border border-[#2a2a2a] shadow-2xl animate-fadeIn italic">

            {/* 1. HEADER: INFO BAR (Estilo Oficina DT) */}
            <div className="p-8 border-b border-[#222] flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-[#111] to-[#050505] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                <div className="flex flex-col gap-1 relative z-10">
                    <h2 className="font-bebas text-6xl text-white tracking-tighter uppercase leading-none">
                        {equipo.nombre}
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-[1px] bg-[#c9a84c]"></span>
                        <p className="font-barlow-condensed text-[#c9a84c] uppercase tracking-[4px] text-xs font-bold">
                            Director Técnico: <span className="text-white ml-1">{equipo.dt || "SIN ASIGNAR"}</span>
                        </p>
                    </div>
                </div>

                <div className="mt-6 md:mt-0 relative z-10">
                    <div className="bg-[#050505] p-4 border-l-4 border-[#c9a84c] shadow-xl skew-x-[-10deg]">
                        <div className="skew-x-[10deg]">
                            <p className="text-[10px] text-[#555] uppercase tracking-[3px] mb-1 font-bold">Balance de Caja</p>
                            <p className="font-bebas text-4xl text-[#27ae60] leading-none">
                                ${equipo.presupuesto?.toLocaleString('es-AR') || "0"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. TABS: NAVEGACIÓN TÁCTICA */}
            <nav className="flex bg-[#050505] border-b border-[#222] overflow-x-auto scrollbar-hide">
                <TabButton label="Plantilla" active={activeTab === "plantilla"} onClick={() => setActiveTab("plantilla")} />
                <TabButton label="Pizarra Táctica" active={activeTab === "alineacion"} onClick={() => setActiveTab("alineacion")} />
                <TabButton label="Vitrina" active={activeTab === "stats"} onClick={() => setActiveTab("stats")} />
            </nav>

            {/* 3. CONTENIDO DINÁMICO */}
            <div className="p-8 min-h-[500px]">
                {activeTab === "plantilla" && <SeccionPlantilla equipoId={equipo.id} />}
                {activeTab === "alineacion" && <SeccionAlineacion equipoId={equipo.id} />}
                {activeTab === "stats" && <SeccionPalmares equipo={equipo} />}
            </div>
        </div>
    );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-10 py-5 font-bebas text-2xl tracking-[2px] uppercase transition-all border-b-2 whitespace-nowrap ${active ? "text-[#c9a84c] border-[#c9a84c] bg-[#111]/50" : "text-[#333] border-transparent hover:text-gray-400"}`}
        >
            {label}
        </button>
    );
}

function SeccionPlantilla({ equipoId }: { equipoId: string }) {
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "equipos", equipoId, "plantilla"), orderBy("dorsal", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            setJugadores(snapshot.docs.map(doc => ({ ...doc.data() } as Jugador)));
            setLoading(false);
        });
        return () => unsub();
    }, [equipoId]);

    const valorTotalPlantilla = jugadores.reduce((acc, j) => acc + (j.valor || 0), 0);
    const totalSueldos = valorTotalPlantilla * 0.10;

    if (loading) return <div className="py-20 text-center font-bebas text-[#c9a84c] text-3xl animate-pulse uppercase tracking-widest italic">Sincronizando Archivos...</div>;

    return (
        <div className="animate-fadeIn">
            <div className="mb-10 flex flex-wrap justify-end gap-6">
                <div className="bg-[#111] border-r-4 border-[#27ae60] p-4 shadow-2xl min-w-[220px]">
                    <span className="text-[10px] text-[#444] uppercase tracking-widest block font-bold mb-1">Activos en Jugadores</span>
                    <span className="text-[#27ae60] font-bebas text-4xl">${valorTotalPlantilla.toLocaleString('es-AR')}</span>
                </div>
                <div className="bg-[#111] border-r-4 border-orange-600 p-4 shadow-2xl min-w-[220px]">
                    <span className="text-[10px] text-[#444] uppercase tracking-widest block font-bold mb-1 italic">Masa Salarial (10%)</span>
                    <span className="text-orange-600 font-bebas text-4xl">${totalSueldos.toLocaleString('es-AR')}</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left font-barlow-condensed">
                    <thead>
                        <tr className="text-[#555] text-[11px] uppercase tracking-[4px] border-b border-[#222]">
                            <th className="pb-4 font-bold">#</th>
                            <th className="pb-4 font-bold">Jugador</th>
                            <th className="pb-4 font-bold text-center">Posición</th>
                            <th className="pb-4 font-bold text-center">Compra (100%)</th>
                            <th className="pb-4 font-bold text-center text-blue-400">Préstamo (30%)</th>
                            <th className="pb-4 font-bold text-right text-orange-500 italic">Sueldo (10%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {jugadores.map((j, i) => {
                            const vBase = j.valor || 0;
                            return (
                                <tr key={i} className="hover:bg-white/[0.02] group transition-all italic">
                                    <td className="py-5 font-mono text-[#c9a84c] text-xl">#{j.dorsal}</td>
                                    <td className="py-5">
                                        <p className="font-bold text-white uppercase text-lg group-hover:text-[#c9a84c] transition-colors">{j.nombre}</p>
                                        <p className="text-[10px] text-gray-600 uppercase tracking-tighter">{j.edad} años</p>
                                    </td>
                                    <td className="py-5 text-center text-gray-500 text-sm font-bold uppercase">{j.pos}</td>
                                    <td className="py-5 text-center font-bebas text-2xl text-[#27ae60]">${vBase.toLocaleString('es-AR')}</td>
                                    <td className="py-5 text-center font-bebas text-2xl text-blue-400/70">${(vBase * 0.30).toLocaleString('es-AR')}</td>
                                    <td className="py-5 text-right font-bebas text-2xl text-orange-500/70">${(vBase * 0.10).toLocaleString('es-AR')}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SeccionAlineacion({ equipoId }: { equipoId: string }) {
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [titularesIds, setTitularesIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Escuchar los titulares oficiales guardados en el documento del equipo
        const unsubEquipo = onSnapshot(doc(db, "equipos", equipoId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Limpiamos strings vacíos si los hay
                setTitularesIds((data.titulares || []).filter((t: string) => t !== ""));
            }
        });

        // 2. Escuchar la plantilla completa
        const q = query(collection(db, "equipos", equipoId, "plantilla"), orderBy("pos", "asc"));
        const unsubPlantilla = onSnapshot(q, (snapshot) => {
            setJugadores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
            setLoading(false);
        });

        return () => {
            unsubEquipo();
            unsubPlantilla();
        };
    }, [equipoId]);

    // Filtrado: Los que están en el array de titulares van a la pizarra
    const elegidos = jugadores.filter(j => titularesIds.includes(j.id!));

    // Filtrado: Los que NO están en el array son los Suplentes/Convocados
    const suplentes = jugadores.filter(j => !titularesIds.includes(j.id!));

    // Clasificación para la pizarra (usando tus siglas en español e inglés)
    const porteros = elegidos.filter(j => j.pos.toUpperCase().includes("GK") || j.pos.toUpperCase().includes("POR"));
    const defensas = elegidos.filter(j => ["CT", "LB", "RB", "SB", "LI", "LD", "DFC"].some(p => j.pos.toUpperCase().includes(p)));
    const medios = elegidos.filter(j => ["CM", "AM", "DM", "LM", "RM", "MC", "MO", "MI", "MD"].some(p => j.pos.toUpperCase().includes(p)));
    const delanteros = elegidos.filter(j => ["CF", "WF", "ST", "SS", "DC", "EI", "ED"].some(p => j.pos.toUpperCase().includes(p)));

    if (loading) return <div className="py-20 text-center font-bebas text-[#c9a84c] text-3xl animate-pulse italic">Sincronizando Táctica...</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-16 items-start animate-fadeIn italic">
            {/* PIZARRA TÁCTICA */}
            <div className="relative w-[340px] h-[500px] bg-[#0509] border-2 border-[#1a1a1a] shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden shrink-0 mx-auto lg:mx-0">
                {/* Marcado de cancha */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 w-full h-1/2 border-b border-white"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-white"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-x border-b border-white"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-x border-t border-white"></div>
                </div>

                <div className="relative h-full w-full p-8 flex flex-col justify-between z-10">
                    <div className="flex justify-around min-h-[40px]">{delanteros.map((j) => <PlayerCircle key={j.id} j={j} />)}</div>
                    <div className="flex justify-around min-h-[40px]">{medios.map((j) => <PlayerCircle key={j.id} j={j} />)}</div>
                    <div className="flex justify-around min-h-[40px]">{defensas.map((j) => <PlayerCircle key={j.id} j={j} />)}</div>
                    <div className="flex justify-center min-h-[40px]">{porteros.map((j) => <PlayerCircle key={j.id} j={j} isGK />)}</div>
                </div>

                <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 border border-white/10">
                    <span className="font-bebas text-[10px] text-[#c9a84c] tracking-widest">{titularesIds.length} / 11 TITULARES</span>
                </div>
            </div>

            {/* LISTA DE SUPLENTES / CONVOCADOS */}
            <div className="w-full">
                <div className="border-b border-[#c9a84c]/30 mb-6 pb-2">
                    <h3 className="font-bebas text-4xl text-white uppercase tracking-tighter">Banquillo de <span className="text-[#c9a84c]">Suplentes</span></h3>
                    <p className="font-barlow-condensed text-[10px] text-[#444] uppercase tracking-[3px] font-bold">Jugadores disponibles para cambios</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {suplentes.length > 0 ? (
                        suplentes.map((j) => (
                            <div
                                key={j.id}
                                className="flex justify-between items-center p-4 bg-[#111] border-l-2 border-gray-800 opacity-70 hover:opacity-100 transition-all group shadow-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="font-bebas text-3xl text-[#222] group-hover:text-white transition-colors">#{j.dorsal}</span>
                                    <div>
                                        <p className="font-bold uppercase text-sm tracking-widest leading-none text-white group-hover:text-[#c9a84c] transition-colors">{j.nombre}</p>
                                        <p className="text-gray-500 text-[9px] font-bold uppercase mt-1 italic">{j.pos}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-[#333] font-bebas text-xl uppercase italic">No hay suplentes registrados</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function PlayerCircle({ j, isGK }: { j: Jugador, isGK?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-1 group">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shadow-2xl transition-all ${isGK ? 'bg-[#c9a84c] border-white text-black' : 'bg-black border-[#222] text-[#c9a84c]'}`}>
                <span className="text-[10px] font-bold font-mono">{j.dorsal}</span>
            </div>
            <span className="text-[8px] text-white font-bold uppercase bg-black/80 px-1 rounded truncate max-w-[65px]">{j.nombre}</span>
        </div>
    );
}

function SeccionPalmares({ equipo }: EquipoProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fadeIn italic">
            <div className="space-y-6">
                <h4 className="font-bebas text-3xl text-[#c9a84c] tracking-widest uppercase border-b border-[#c9a84c]/20 pb-2">Títulos de Liga</h4>
                <div className="flex flex-wrap gap-4">
                    {equipo.titulos?.length ? equipo.titulos.map((t, i) => (
                        <div key={i} className="bg-[#c9a84c] text-black px-4 py-2 font-bold text-xs uppercase flex items-center gap-3 skew-x-[-10deg]">
                            <span className="skew-x-[10deg]">🏆 {t}</span>
                        </div>
                    )) : <span className="text-[#333] text-sm uppercase tracking-widest font-bold">Vitrina por inaugurar</span>}
                </div>
            </div>
            <div className="space-y-6">
                <h4 className="font-bebas text-3xl text-white tracking-widest uppercase border-b border-white/20 pb-2">Copas y Distinciones</h4>
                <div className="flex flex-wrap gap-4">
                    {equipo.copas?.length ? equipo.copas.map((c, i) => (
                        <div key={i} className="bg-white text-black px-4 py-2 font-bold text-xs uppercase flex items-center gap-3 skew-x-[-10deg]">
                            <span className="skew-x-[10deg]">🥇 {c}</span>
                        </div>
                    )) : <span className="text-[#333] text-sm uppercase tracking-widest font-bold">Sin copas registradas</span>}
                </div>
            </div>
        </div>
    );
}