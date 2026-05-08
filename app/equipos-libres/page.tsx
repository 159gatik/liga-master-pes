"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "../../src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    where,
    getDocs
} from "firebase/firestore";
import FormularioPostulacion from "../components/FormularioPostulacion";

interface Equipo {
    id: string;
    nombre: string;
    escudo: string;
    dt?: string;
    estado: string;
    division: string; // Campo necesario para el filtrado
    presupuesto?: number;
}

export default function EquiposLibresPage({ juego = 'pes6' }: { juego?: 'pes6' | 'pes2013' }) {
    const { user, userData, loading: authLoading } = useAuth();
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [loading, setLoading] = useState(true);
    const [yaPostulado, setYaPostulado] = useState(false);
    const [tabActiva, setTabActiva] = useState<"A" | "B">("A");

    // 1. VERIFICAR SI EL USUARIO YA SE POSTULÓ
    useEffect(() => {
        const verificarPostulacion = async () => {
            if (!user?.uid) return;
            try {
                const q = query(
                    collection(db, "postulaciones"),
                    where("uid", "==", user.uid)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setYaPostulado(true);
                }
            } catch (error) {
                console.error("Error verificando postulación:", error);
            }
        };

        if (!authLoading && user) {
            verificarPostulacion();
        }
    }, [user, authLoading]);

    // 2. ESCUCHAR EQUIPOS EN TIEMPO REAL
    useEffect(() => {
        const q = query(
            collection(db, "equipos"),
            where("juego", "==", juego),
            orderBy("nombre", "asc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const listaEquipos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Equipo[];

            setEquipos(listaEquipos);
            setLoading(false);
        }, (error) => {
            console.error("Error al obtener equipos:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [juego]);

    const equiposFiltrados = equipos.filter(e => e.division === tabActiva);

    if (authLoading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-bebas text-[#c9a84c] text-3xl animate-pulse uppercase tracking-widest">
            Comprobando Credenciales...
        </div>
    );

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 pt-32 italic">
            {/* HEADER */}
            <div className="max-w-6xl mx-auto mb-12 border-l-4 border-[#c9a84c] pl-6">
                <h1 className="font-bebas text-6xl md:text-8xl tracking-tighter uppercase text-white leading-none">
                    Equipos <span className="text-[#c9a84c]">Libres</span>
                </h1>
                <p className="font-barlow-condensed text-sm tracking-[5px] text-[#c9a84c] uppercase italic mt-2">
                    Temporada I · Postulaciones de Ingreso
                </p>
            </div>

            {/* SELECTOR DE DIVISIONES */}
            <div className="max-w-6xl mx-auto mb-10 flex gap-4">
                {["A", "B"].map((div) => (
                    <button
                        key={div}
                        onClick={() => {
                            setTabActiva(div as "A" | "B");
                            setSelectedTeam("");
                        }}
                        className={`font-bebas text-3xl px-12 py-3 skew-x-[-15deg] transition-all duration-300 ${tabActiva === div
                                ? "bg-[#c9a84c] text-black shadow-[0_0_20px_rgba(201,168,76,0.2)]"
                                : "bg-white/5 text-gray-500 hover:text-white"
                            }`}
                    >
                        <span className="inline-block skew-x-[15deg]">DIVISIÓN {div}</span>
                    </button>
                ))}
            </div>

            {/* GRILLA DE EQUIPOS */}
            <div className="max-w-6xl mx-auto min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-64 font-bebas text-[#c9a84c] text-2xl animate-pulse">
                        Sincronizando Base de Datos...
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {equiposFiltrados.map((equipo) => {
                            const isLibre = equipo.estado !== 'Ocupado';
                            const isSelected = equipo.nombre === selectedTeam;

                            return (
                                <div
                                    key={equipo.id}
                                    className={`relative bg-[#111] p-6 border-2 flex flex-col items-center transition-all duration-300 ${isSelected
                                            ? "border-white bg-[#1a1a1a] scale-105 z-10 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                            : (isLibre && !yaPostulado)
                                                ? "border-white/5 cursor-pointer hover:border-[#27ae60]/50"
                                                : "border-white/5 opacity-30 grayscale pointer-events-none"
                                        }`}
                                    onClick={() => !yaPostulado && isLibre && setSelectedTeam(equipo.nombre)}
                                >
                                    <div className="relative w-20 h-20 mb-4">
                                        <Image
                                            src={equipo.escudo || "/img/escudos/default.jpg"}
                                            alt={equipo.nombre}
                                            fill
                                            className="object-contain p-1"
                                            unoptimized
                                        />
                                    </div>
                                    <h3 className="font-bebas text-xl tracking-tight text-center text-white leading-none mb-4">
                                        {equipo.nombre}
                                    </h3>

                                    <div className="w-full">
                                        <span className={`text-[10px] font-bold uppercase px-3 py-1 tracking-[2px] block text-center ${isLibre ? 'bg-[#27ae60] text-black' : 'bg-red-900/20 text-red-500'
                                            }`}>
                                            {isLibre ? 'DISPONIBLE' : `DT: ${equipo.dt || 'OCUPADO'}`}
                                        </span>
                                    </div>

                                    {userData && equipo.dt === userData.nombre && (
                                        <div className="absolute -top-2 -right-2 bg-[#c9a84c] text-black text-[8px] font-bold px-2 py-1 shadow-lg z-20 italic">
                                            TU CLUB
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* SECCIÓN DINÁMICA */}
            <div className="max-w-2xl mx-auto mt-20 border-t border-white/5 pt-16">
                {yaPostulado ? (
                    <div className="bg-[#111] border-l-8 border-[#c9a84c] p-10 shadow-2xl">
                        <h2 className="font-bebas text-5xl text-[#c9a84c] mb-4 italic tracking-tighter uppercase">
                            Registro en Proceso
                        </h2>
                        <p className="font-barlow-condensed text-gray-400 uppercase tracking-[2px] text-sm leading-relaxed italic">
                            Tu solicitud ya ha sido enviada a los servidores centrales.
                            La administración revisará tu perfil técnico y te notificará por Discord.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="font-bebas text-5xl tracking-tighter text-white uppercase italic">
                                Formulario de <span className="text-[#c9a84c]">Ingreso</span>
                            </h2>
                            {!selectedTeam && (
                                <p className="text-gray-600 font-barlow-condensed uppercase text-xs mt-4 tracking-[3px] animate-pulse">
                                    -- Selecciona un equipo de la División {tabActiva} --
                                </p>
                            )}
                        </div>

                        <div className={`${!selectedTeam ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
                            <FormularioPostulacion
                                key={selectedTeam}
                                equipoPreseleccionado={selectedTeam}
                                equipoIdPreseleccionado={equipos.find(e => e.nombre === selectedTeam)?.id}
                                coleccionPostulacion="postulaciones"
                                tituloLiga="PES 6"
                            />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}