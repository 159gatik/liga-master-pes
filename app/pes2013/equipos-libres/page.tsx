"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/src/lib/hooks/useAuht";
import FormularioPostulacion from "../../components/FormularioPostulacion";
import Image from "next/image";

interface Equipo {
    id: string;
    nombre: string;
    escudo?: string;
    disponible?: boolean;
}

export default function EquiposLibresPes2013() {
    const { user, userData } = useAuth();
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);

    useEffect(() => {
        const q = query(collection(db, "pes2013_equipos"), orderBy("nombre", "asc"));
        return onSnapshot(q, (snap) => {
            setEquipos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Equipo)));
        });
    }, []);

    return (
        <main className="min-h-screen bg-[#0a1628] text-[#e8f4ff] p-6 md:p-10 font-barlow-condensed">

            <div className="max-w-6xl mx-auto mb-10 border-l-4 border-[#00aaff] pl-5">
                <p className="text-[#00aaff] text-xs tracking-[5px] uppercase mb-2">PES 2013</p>
                <h1 className="font-bebas text-5xl md:text-7xl tracking-[5px] uppercase text-white">
                    Equipos <span className="text-[#00aaff]">Disponibles</span>
                </h1>
            </div>

            {/* GRILLA DE EQUIPOS */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
                {equipos.map((equipo) => (
                    <button
                        key={equipo.id}
                        onClick={() => setEquipoSeleccionado(equipo)}
                        className="bg-[#0d1f3c] border border-[#1a3a5c] p-4 flex flex-col items-center gap-3 hover:border-[#00aaff] transition-all group"
                        style={equipoSeleccionado?.id === equipo.id
                            ? { borderColor: '#00aaff', background: '#0a1f3a' }
                            : {}}
                    >
                        {equipo.escudo && (
                            <div className="relative w-12 h-12">
                                <Image src={equipo.escudo} alt={equipo.nombre} fill className="object-contain" />
                            </div>
                        )}
                        <span className="font-bebas text-sm text-white uppercase tracking-wider text-center group-hover:text-[#00aaff] transition-colors">
                            {equipo.nombre}
                        </span>
                        {equipoSeleccionado?.id === equipo.id && (
                            <span className="text-[9px] text-[#00aaff] uppercase tracking-widest font-bold">
                                Seleccionado
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* FORMULARIO */}
            {equipoSeleccionado && user && (
                <FormularioPostulacion
                    equipoPreseleccionado={equipoSeleccionado.nombre}
                    equipoIdPreseleccionado={equipoSeleccionado.id}
                    coleccionPostulacion="pes2013_postulaciones"
                    tituloLiga="PES 2013"
                />
            )}

            {!user && (
                <div className="max-w-2xl mx-auto text-center py-10 border border-[#1a3a5c] bg-[#0d1f3c]">
                    <p className="font-bebas text-3xl text-[#00aaff]">INICIÁ SESIÓN PARA POSTULARTE</p>
                </div>
            )}
        </main>
    );
}