"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "../../src/lib/firebase";
import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "firebase/firestore";
import FormularioPostulacion from "../components/FormularioPostulacion";

export default function EquiposPage() {
    const [equipos, setEquipos] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [loading, setLoading] = useState(true);

    // 1. ESCUCHAR FIREBASE EN TIEMPO REAL
    useEffect(() => {
        // Traemos la colección 'equipos' ordenada por nombre
        const q = query(collection(db, "equipos"), orderBy("nombre", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const listaEquipos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEquipos(listaEquipos);
            setLoading(false);
        }, (error) => {
            console.error("Error al obtener equipos:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans p-6 md:p-10">
            {/* HEADER */}
            <div className="max-w-6xl mx-auto mb-10 border-l-4 border-[#c9a84c] pl-5">
                <h1 className="font-bebas text-5xl md:text-7xl tracking-[5px] uppercase text-white">Equipos</h1>
                <span className="font-barlow-condensed text-sm tracking-[3px] text-[#c9a84c] uppercase italic">
                    Temporada I · Inscripciones Abiertas
                </span>
            </div>

            {/* ESTADO DE CARGA */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a84c]"></div>
                </div>
            ) : (
                /* GRILLA DE ESCUDOS DESDE FIREBASE */
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
                    {equipos.map((equipo) => (
                        <div
                            key={equipo.id}
                            className={`relative bg-[#111] border-2 p-4 flex flex-col items-center group transition-all duration-300 ${equipo.nombre === selectedTeam
                                ? 'border-white scale-105 z-10 shadow-[0_0_25px_rgba(201,168,76,0.2)]'
                                : equipo.estado === 'Libre'
                                    ? 'border-[#27ae60] cursor-pointer hover:bg-[#1a2a1a]'
                                    : 'border-[#2a2a2a] opacity-50 grayscale'
                                }`}
                            onClick={() => equipo.estado === 'Libre' && setSelectedTeam(equipo.nombre)}
                        >
                            {/* Escudo */}
                            <div className="relative w-24 h-24 mb-4">
                                <Image
                                    src={equipo.escudo}
                                    alt={equipo.nombre}
                                    fill
                                    className="object-contain p-2"
                                />
                            </div>

                            {/* Info Equipo */}
                            <h3 className="font-bebas text-xl tracking-wider text-center leading-none mb-2 text-white">
                                {equipo.nombre}
                            </h3>

                            <div className="flex flex-col items-center gap-1">
                                <span className={`text-[10px] font-bold uppercase px-3 py-0.5 tracking-tighter ${equipo.estado === 'Libre' ? 'bg-[#27ae60] text-black' : 'bg-[#333] text-gray-400'
                                    }`}>
                                    {equipo.estado === 'Libre' ? 'Disponible' : `DT: ${equipo.dt}`}
                                </span>

                                {equipo.presupuesto !== undefined && (
                                    <span className="text-[11px] font-mono text-[#c9a84c]">
                                        ${equipo.presupuesto.toLocaleString('es-AR')}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SECCIÓN FORMULARIO */}
            <div className="max-w-xl mx-auto text-center mb-8">
                <h2 className="font-bebas text-4xl tracking-[3px] text-[#c9a84c] uppercase">
                    Formulario de Ingreso
                </h2>
                <div className="h-1 w-20 bg-[#c9a84c] mx-auto mt-2"></div>
            </div>

            {/* IMPORTANTE: La key={selectedTeam} hace que el formulario se resetee 
                automáticamente cuando el usuario elige un nuevo escudo.
            */}
            <FormularioPostulacion
                key={selectedTeam}
                equipoPreseleccionado={selectedTeam}
            />
        </main>
    );
}