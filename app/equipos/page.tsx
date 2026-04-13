"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "../../src/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import DetalleEquipo from "./DetalleEquipos";

interface Equipo {
    id: string;
    nombre: string;
    escudo: string;
    dt: string;
    presupuesto: number;
    valor_plantilla: number;
    titulos?: string[];
    copas?: string[];
}

export default function EquiposPage() {
    // 2. Usamos la interfaz en el useState en lugar de 'any'
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);
    const [loading, setLoading] = useState(true);
    // 1. ESCUCHAR FIREBASE PARA TRAER TODOS LOS EQUIPOS
    useEffect(() => {
        const q = query(collection(db, "equipos"), orderBy("nombre", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Equipo[]; // <--- AGREGÁ ESTO AQUÍ

            setEquipos(docs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans p-6 md:p-10">
            {/* CABECERA */}
            <div className="max-w-6xl mx-auto mb-10 border-l-4 border-[#c9a84c] pl-5">
                <h1 className="font-bebas text-5xl md:text-7xl tracking-[5px] uppercase text-white">INFORMACIÓN</h1>
                <p className="font-barlow-condensed text-sm tracking-[3px] text-[#c9a84c] uppercase italic">
                    Clubes · Plantillas · Palmarés Histórico
                </p>
            </div>

            {/* GRILLA DE SELECCIÓN DE EQUIPOS */}
            {loading ? (
                <div className="text-center font-bebas text-2xl text-[#c9a84c] animate-pulse">Cargando base de datos...</div>
            ) : (
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                    {equipos.map((equipo) => (
                        <div
                            key={equipo.id}
                            className={`relative bg-[#111] border-2 p-4 flex flex-col items-center group transition-all duration-300 cursor-pointer ${equipoSeleccionado?.id === equipo.id
                                    ? 'border-[#c9a84c] bg-[#1a1a1a] scale-105 z-10'
                                    : 'border-[#2a2a2a] hover:border-[#444]'
                                }`}
                            onClick={() => setEquipoSeleccionado(equipo)}
                        >
                            <div className="relative w-16 h-16 mb-2">
                                <Image
                                    src={equipo.escudo}
                                    alt={equipo.nombre}
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                            <h3 className="font-bebas text-lg tracking-wider text-center leading-tight uppercase">
                                {equipo.nombre}
                            </h3>
                            <span className="text-[9px] text-[#888] uppercase tracking-widest mt-1">
                                DT: {equipo.dt || "Vacante"}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* SECCIÓN DINÁMICA: DETALLE DEL EQUIPO SELECCIONADO */}
            <div className="max-w-6xl mx-auto">
                {equipoSeleccionado ? (
                    <DetalleEquipo equipo={equipoSeleccionado} />
                ) : (
                    <div className="h-64 border-2 border-dashed border-[#222] flex items-center justify-center">
                        <p className="font-barlow-condensed text-[#444] uppercase tracking-[4px]">
                            Seleccioná un club para ver su información
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}