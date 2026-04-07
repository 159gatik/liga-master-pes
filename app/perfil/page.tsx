"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import Image from "next/image";

// 1. Interfaces estrictas
export interface UserData {
    nombre: string;
    rol: string;
    equipoId?: string;
    nombreEquipo?: string;
    discord?: string; // Sincronizado con la bandeja
    wins?: number;
    losses?: number;
}

interface Jugador {
    id: string;
    nombre: string;
    posicion?: string;
    media?: number | string;
}

interface Equipo {
    id: string;
    nombre: string;
    presupuesto: number;
    dt: string;
    escudo?: string;
}

export default function PerfilDT() {
    const { user, userData, loading: authLoading } = useAuth();
    const [equipoDoc, setEquipoDoc] = useState<Equipo | null>(null);
    const [plantilla, setPlantilla] = useState<Jugador[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!userData?.equipoId) {
            const timer = setTimeout(() => setLoadingData(false), 0);
            return () => clearTimeout(timer);
        }

        const unsubEquipo = onSnapshot(doc(db, "equipos", userData.equipoId), (docSnap) => {
            if (docSnap.exists()) {
                setEquipoDoc({ id: docSnap.id, ...docSnap.data() } as Equipo);
            }
        });

        const q = query(
            collection(db, "equipos", userData.equipoId, "plantilla"),
            orderBy("nombre", "asc")
        );

        const unsubPlantilla = onSnapshot(q, (snapshot) => {
            const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Jugador));
            setPlantilla(lista);
            setLoadingData(false);
        });

        return () => {
            unsubEquipo();
            unsubPlantilla();
        };
    }, [userData?.equipoId, authLoading]);

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
                <div className="text-[#c9a84c] animate-pulse font-bebas text-4xl tracking-widest uppercase">
                    Accediendo a la Oficina...
                </div>
            </div>
        );
    }

    if (!user || !userData) return null; // Protección básica

    // Vista para Invitados
    if (userData.rol === "invitado" || !userData.equipoId) {
        return (
            <main className="min-h-screen bg-[#0a0a0a] p-10 flex items-center justify-center font-barlow-condensed">
                <div className="bg-[#111] border-2 border-[#c9a84c] p-12 max-w-xl text-center shadow-[0_0_50px_rgba(201,168,76,0.1)] relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#c9a84c]"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#c9a84c]"></div>
                    <h2 className="font-bebas text-6xl text-[#c9a84c] mb-6 uppercase italic tracking-tighter">En Revisión</h2>
                    <p className="text-gray-400 text-2xl uppercase tracking-widest leading-tight">
                        Hola, <span className="text-white font-bold">{userData.nombre}</span>.<br />
                        Tu contrato está siendo procesado por el comisionado.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-barlow-condensed">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* HEADER DINÁMICO */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#222] pb-10 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            {equipoDoc?.escudo && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={equipoDoc.escudo}
                                    className="w-16 h-16 object-contain"
                                    alt="Escudo"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "/escudos/default.png" }}
                                />
                            )}
                            <h1 className="font-bebas text-8xl md:text-9xl leading-none tracking-tighter italic text-white uppercase">
                                {equipoDoc?.nombre || "Cargando..."}
                            </h1>
                        </div>
                        <p className="text-[#c9a84c] text-3xl uppercase tracking-[8px] italic ml-2">
                            MÁNAGER: {userData.nombre}
                        </p>
                    </div>

                    <div className="bg-[#111] p-6 border-r-8 border-[#27ae60] min-w-[300px] shadow-xl">
                        <p className="text-gray-500 text-xs uppercase tracking-[4px] font-bold mb-2 italic">Presupuesto Disponible</p>
                        <p className="font-bebas text-6xl text-[#27ae60] tabular-nums">
                            ${equipoDoc?.presupuesto?.toLocaleString()}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* PLANTILLA (Mantenemos tu lógica de grilla) */}
                    <section className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b border-[#222] pb-4">
                            <h3 className="font-bebas text-4xl uppercase tracking-widest italic text-white">
                                Nómina de Jugadores
                            </h3>
                            <span className="text-[#c9a84c] text-xl italic font-bold">
                                {plantilla.length} / 23
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plantilla.map((jugador) => (
                                <div key={jugador.id} className="bg-[#111] border border-[#222] p-5 flex justify-between items-center hover:border-[#c9a84c] transition-all group">
                                    <div>
                                        <p className="text-white font-bold text-2xl uppercase group-hover:text-[#c9a84c] transition-colors leading-none">{jugador.nombre}</p>
                                        <p className="text-[10px] text-[#555] uppercase tracking-[3px] mt-2 font-bold italic">
                                            {jugador.posicion || "General"}
                                        </p>
                                    </div>
                                    <div className="font-bebas text-4xl text-[#c9a84c]/40 group-hover:text-[#c9a84c] transition-colors">
                                        {jugador.media || "--"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* IDENTIDAD VISUAL (CARNET DE DT) */}
                    <aside className="space-y-10">
                        <div className="bg-[#111] border-2 border-[#c9a84c] p-8 relative overflow-hidden shadow-2xl">
                            {/* Decoración Esquinas */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#c9a84c]"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#c9a84c]"></div>

                            <h4 className="font-bebas text-3xl mb-8 text-[#c9a84c] tracking-widest uppercase italic border-b border-[#c9a84c]/20 pb-2">
                                credencial
                            </h4>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="text-[10px] text-[#555] uppercase font-bold tracking-[2px]">Director Técnico</label>
                                    <p className="text-3xl font-bebas italic text-white leading-none">{userData.nombre}</p>
                                </div>

                                <div>
                                    <label className="text-[10px] text-[#555] uppercase font-bold tracking-[2px]">Discord de Contacto</label>
                                    <p className="text-xl text-[#c9a84c] font-bold italic truncate">{userData.discord || "NO VINCULADO"}</p>
                                </div>

                                {/* ESTADÍSTICAS ESTILO PES */}
                                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[#222]">
                                    <div className="text-center">
                                        <p className="text-[10px] text-green-500 font-bold uppercase mb-1">Victorias</p>
                                        <p className="text-5xl font-bebas italic leading-none">{(userData as UserData).wins || 0}</p>
                                    </div>
                                    <div className="text-center border-l border-[#222]">
                                        <p className="text-[10px] text-red-500 font-bold uppercase mb-1">Derrotas</p>
                                        <p className="text-5xl font-bebas italic leading-none">{(userData as UserData).losses || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Marca de agua de fondo */}
                            {/* 2. En la Credencial (Marca de agua) */}
                            {equipoDoc?.escudo && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={equipoDoc.escudo}
                                    alt=""
                                    className="absolute -right-0 bottom-31 w-48 h-48 object-contain pointer-events-none"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                />
                            )}
                        </div>

                        <div className="bg-gradient-to-r from-[#c9a84c]/10 to-transparent p-6 border-l-2 border-[#c9a84c] italic">
                            <p className="text-sm text-gray-500 font-barlow-condensed leading-snug tracking-wider uppercase">

                            </p>
                        </div>
                    </aside>

                </div>
            </div>
        </main>
    );
}