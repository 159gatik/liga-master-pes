"use client";
import { useState, useEffect } from "react";
import { db } from "../../src/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
interface Jugador {
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
        <div className="w-full bg-[#111] border border-[#2a2a2a] shadow-2xl animate-fadeIn">

            {/* 1. INFO BAR (DT y Presupuesto) */}
            <div className="p-6 border-b border-[#222] flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-[#151515] to-[#111]">
                <div className="flex flex-col gap-1">
                    <h2 className="font-bebas text-5xl text-white tracking-widest uppercase">
                        {equipo.nombre}
                    </h2>
                    <p className="font-barlow-condensed text-[#c9a84c] uppercase tracking-[4px] text-sm">
                        DT:
                        <span className="text-white ml-2">{equipo.dt || "SIN ASIGNAR"}</span>

                    </p>
                </div>

                <div className="flex gap-4">
                    {/* BILLETERA (Dinero real para fichajes) */}
                    <div className="text-right bg-[#0a0a0a] p-3 border border-[#c9a84c]/30">
                        <p className="text-[10px] text-[#c9a84c] uppercase tracking-[2px] mb-1 font-bold">Presupuesto Disponible</p>
                        <p className="font-bebas text-3xl text-[#27ae60] leading-none">
                            ${equipo.presupuesto?.toLocaleString('es-AR') || "0"}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. TABS NAVIGATION */}
            <nav className="flex bg-[#050505] border-b border-[#222]">
                <TabButton
                    label="Plantilla"
                    active={activeTab === "plantilla"}
                    onClick={() => setActiveTab("plantilla")}
                />
                <TabButton
                    label="Alineación"
                    active={activeTab === "alineacion"}
                    onClick={() => setActiveTab("alineacion")}
                />
                <TabButton
                    label="Palmarés"
                    active={activeTab === "stats"}
                    onClick={() => setActiveTab("stats")}
                />
            </nav>

            {/* 3. CONTENIDO DINÁMICO */}
            <div className="p-8 min-h-[400px]">
                {activeTab === "plantilla" && <SeccionPlantilla equipoId={equipo.id} />}
                {activeTab === "alineacion" && <SeccionAlineacion />}
                {activeTab === "stats" && <SeccionPalmares equipo={equipo} />}
            </div>
        </div>
    );
}

// --- SUB-COMPONENTES INTERNOS ---

interface TabButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

function TabButton({ label, active, onClick }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`px-8 py-4 font-bebas text-xl tracking-[3px] uppercase transition-all border-b-2 ${active
                ? "text-[#c9a84c] border-[#c9a84c] bg-[#111]"
                : "text-[#444] border-transparent hover:text-gray-300"
                }`}
        >
            {label}
        </button>
    );
}

function SeccionPlantilla({ equipoId }: { equipoId: string }) {
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const plantillaRef = collection(db, "equipos", equipoId, "plantilla");
        const q = query(plantillaRef, orderBy("dorsal", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                ...doc.data()
            })) as Jugador[];
            setJugadores(docs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [equipoId]);

    // --- CÁLCULOS FINANCIEROS TOTALES ---
    const valorTotalPlantilla = jugadores.reduce((acc, j) => acc + (j.valor || 0), 0);
    const totalSueldos = valorTotalPlantilla * 0.10; // 10% del total

    if (loading) return <p className="text-[#c9a84c] font-bebas tracking-widest animate-pulse">Cargando plantel...</p>;

    return (
        <div className="animate-fadeIn">
            {/* RESUMEN FINANCIERO DEL PLANTEL */}
            <div className="mb-8 flex flex-wrap justify-end gap-4">
                <div className="bg-[#1a1a1a] border-l-2 border-[#27ae60] px-6 py-3 shadow-lg min-w-[200px]">
                    <span className="text-[10px] text-[#555] uppercase tracking-widest block font-bold">Valor Total Plantilla</span>
                    <span className="text-[#27ae60] font-bebas text-3xl">${valorTotalPlantilla.toLocaleString('es-AR')}</span>
                </div>
                <div className="bg-[#1a1a1a] border-l-2 border-orange-500 px-6 py-3 shadow-lg min-w-[200px]">
                    <span className="text-[10px] text-[#555] uppercase tracking-widest block font-bold italic">Presupuesto p/ Sueldos (10%)</span>
                    <span className="text-orange-500 font-bebas text-3xl">${totalSueldos.toLocaleString('es-AR')}</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left font-barlow-condensed border-collapse">
                    <thead>
                        <tr className="text-[#555] text-[11px] uppercase tracking-[3px] border-b border-[#222]">
                            <th className="pb-4 font-bold">#</th>
                            <th className="pb-4 font-bold">Jugador</th>
                            <th className="pb-4 font-bold">Posición</th>
                            <th className="pb-4 font-bold text-center">Compra (100%)</th>
                            <th className="pb-4 font-bold text-center text-blue-400">Préstamo (30%)</th>
                            <th className="pb-4 font-bold text-right text-orange-500 italic">Sueldo (10%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a]">
                        {jugadores.length > 0 ? (
                            jugadores.map((j, i) => {
                                // CÁLCULOS POR JUGADOR
                                const vBase = j.valor || 0;
                                const vPrestamo = vBase * 0.30;
                                const vSueldo = vBase * 0.10;

                                return (
                                    <tr key={i} className="hover:bg-[#ffffff03] group transition-colors">
                                        <td className="py-4 font-mono text-[#c9a84c] text-lg">#{j.dorsal}</td>
                                        <td className="py-4 font-bold text-white uppercase tracking-wider group-hover:text-[#c9a84c]">
                                            {j.nombre}
                                            <span className="block text-[10px] text-gray-600 font-normal">{j.edad} años</span>
                                        </td>
                                        <td className="py-4 text-gray-400 text-sm uppercase">{j.pos}</td>

                                        {/* VALOR COMPRA */}
                                        <td className="py-4 text-center font-bebas text-xl text-[#27ae60]">
                                            ${vBase.toLocaleString('es-AR')}
                                        </td>

                                        {/* VALOR PRÉSTAMO */}
                                        <td className="py-4 text-center font-bebas text-xl text-blue-400/80">
                                            ${vPrestamo.toLocaleString('es-AR')}
                                        </td>

                                        {/* VALOR SUELDO */}
                                        <td className="py-4 text-right font-bebas text-xl text-orange-500/80">
                                            ${vSueldo.toLocaleString('es-AR')}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-[#333] italic uppercase tracking-widest">
                                    No hay jugadores registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="mt-6 text-[10px] text-[#444] uppercase tracking-widest text-center italic">
                * Los valores de préstamo y sueldo son calculados automáticamente sobre la cotización base.
            </p>
        </div>
    );
}

function SeccionAlineacion() {
    return (
        <div className="flex flex-col items-center justify-center py-10 border border-[#222] bg-[#0c0c0c] relative overflow-hidden">
            <div className="w-[300px] h-[450px] border-2 border-[#222] relative opacity-30">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-2 border-[#222]"></div>
                </div>
                <div className="absolute top-0 w-full h-1/2 border-b-2 border-[#222]"></div>
            </div>

            <p className="absolute font-bebas text-2xl text-[#c9a84c] uppercase tracking-[5px]">
                Vista Táctica
            </p>
            <p className="mt-4 text-[#888] font-barlow-condensed text-[10px] uppercase tracking-[2px]">
                Módulo en desarrollo para Temporada I
            </p>
        </div>
    );
}

function SeccionPalmares({ equipo }: EquipoProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
                <h4 className="font-bebas text-2xl text-[#c9a84c] tracking-widest uppercase">Ligas Ganadas</h4>
                <div className="flex flex-wrap gap-3">
                    {equipo.titulos && equipo.titulos.length > 0 ? (
                        equipo.titulos.map((t: string, i: number) => (
                            <div key={i} className="bg-[#c9a84c] text-black px-3 py-1 font-bold text-[10px] uppercase flex items-center gap-2">
                                🏆 {t}
                            </div>
                        ))
                    ) : (
                        <span className="text-[#333] italic text-sm">Sin títulos oficiales</span>
                    )}
                </div>
            </div>
            <div className="space-y-4">
                <h4 className="font-bebas text-2xl text-white tracking-widest uppercase">Copas y Otros</h4>
                <div className="flex flex-wrap gap-3">
                    {equipo.copas && equipo.copas.length > 0 ? (
                        equipo.copas.map((c: string, i: number) => (
                            <div key={i} className="bg-white text-black px-3 py-1 font-bold text-[10px] uppercase flex items-center gap-2">
                                🥇 {c}
                            </div>
                        ))
                    ) : (
                        <span className="text-[#333] italic text-sm">Vitrina vacía</span>
                    )}
                </div>
            </div>
        </div>
    );
}