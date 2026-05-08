"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "../../src/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import DetalleEquipo from "./DetalleEquipos";
import Link from "next/link";

// 1. Interfaz actualizada con dtId
interface Equipo {
    id: string;
    nombre: string;
    escudo: string;
    dt: string;
    dtUid?: string; // ID de Firebase del DT para el enlace al perfil
    presupuesto: number;
    valor_plantilla: number;
    division?: string;
    juego?: string;
    titulos?: string[];
    copas?: string[];
}

export default function EquiposPage() {
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabActiva, setTabActiva] = useState<"A" | "B">("A");

    useEffect(() => {
        const q = query(collection(db, "equipos"), orderBy("nombre", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Equipo[];

            setEquipos(docs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Filtrar equipos según la división seleccionada y que sean de PES 6
    const equiposFiltrados = equipos.filter(
        (e) => e.division === tabActiva && e.juego === "pes6"
    );

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans p-6 md:p-10 pt-20">
            {/* CABECERA */}
            <div className="max-w-6xl mx-auto mb-10 border-l-4 border-[#c9a84c] pl-5">
                <h1 className="font-bebas text-5xl md:text-7xl tracking-[5px] uppercase text-white">
                    INFORMACIÓN <span className="text-[#c9a84c]">CLUBES</span>
                </h1>
                <p className="font-barlow-condensed text-sm tracking-[3px] text-[#c9a84c] uppercase italic">
                    Temporada I · Plantillas · Estadísticas
                </p>
            </div>

            {/* SELECTOR DE DIVISIONES (TABS) */}
            <div className="max-w-6xl mx-auto mb-8 flex gap-2">
                {["A", "B"].map((div) => (
                    <button
                        key={div}
                        onClick={() => {
                            setTabActiva(div as "A" | "B");
                            setEquipoSeleccionado(null);
                        }}
                        className={`px-8 py-3 font-bebas text-2xl tracking-widest transition-all ${tabActiva === div
                            ? "bg-[#c9a84c] text-black italic scale-105"
                            : "bg-[#111] text-gray-500 border border-white/5 hover:text-white"
                            }`}
                    >
                        DIVISIÓN {div}
                    </button>
                ))}
            </div>

            {/* GRILLA DE SELECCIÓN DE EQUIPOS */}
            {loading ? (
                <div className="text-center font-bebas text-2xl text-[#c9a84c] animate-pulse py-20">
                    Cargando base de datos de El Legado...
                </div>
            ) : (
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                    {equiposFiltrados.length > 0 ? (
                        equiposFiltrados.map((equipo) => (
                            <div
                                key={equipo.id}
                                className={`relative bg-[#111] border-2 p-4 flex flex-col items-center transition-all duration-300 cursor-pointer ${equipoSeleccionado?.id === equipo.id
                                    ? 'border-[#c9a84c] bg-[#1a1a1a] scale-105 z-10 shadow-[0_0_15px_rgba(201,168,76,0.2)]'
                                    : 'border-white/5'
                                    }`}
                                onClick={() => setEquipoSeleccionado(equipo)}
                            >
                                {/* Contenedor del escudo */}
                                <div className="relative w-16 h-16 mb-2 transition-all">
                                    <Image
                                        src={equipo.escudo || "/img/escudos/default.jpg"}
                                        alt={equipo.nombre}
                                        fill
                                        className="object-contain p-1"
                                        unoptimized
                                    />
                                </div>

                                {/* Nombre del equipo */}
                                <h3 className={`font-bebas text-lg tracking-wider text-center leading-tight uppercase transition-colors ${equipoSeleccionado?.id === equipo.id ? 'text-[#c9a84c]' : 'text-white'
                                    }`}>
                                    {equipo.nombre}
                                </h3>

                                {/* LINK AL PERFIL DEL DT */}
                                <span className="text-[12px] text-[#88] uppercase tracking-widest mt-1 z-20 relative">
                                    {equipo.dtUid ? (
                                        <Link
                                            href={`/perfil/ver?id=${equipo.dtUid}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="hover:text-[#c9a84c] transition-colors duration-200 cursor-pointer underline decoration-[#c9a84c]/20 underline-offset-2"
                                        >
                                            {equipo.dt}
                                        </Link>
                                    ) : (
                                        <span className="opacity-40 italic">Vacante</span>
                                    )}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-10 text-center border border-dashed border-white/10">
                            <p className="font-bebas text-xl text-gray-600 tracking-widest">
                                No hay equipos registrados en la División {tabActiva}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* SECCIÓN DINÁMICA: DETALLE DEL EQUIPO SELECCIONADO */}
            <div className="max-w-6xl mx-auto">
                {equipoSeleccionado ? (
                    <DetalleEquipo equipo={equipoSeleccionado} />
                ) : (
                    <div className="h-48 border border-white/5 bg-[#0f0f0f] flex items-center justify-center rounded-sm">
                        <p className="font-barlow-condensed text-[#444] uppercase tracking-[4px] text-center px-4">
                            Seleccioná un club de la <span className="text-gray-600">División {tabActiva}</span> para ver su información
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}