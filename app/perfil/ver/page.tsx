"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/src/lib/firebase";
import { doc, getDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Image from "next/image";

// Interfaces Locales
interface UserData {
    nombre: string;
    rol: string;
    equipoId?: string;
    nombreEquipo?: string;
    discord?: string;
    wins?: number;
    losses?: number;
}

interface Jugador {
    id: string;
    nombre: string;
    pos: string;
    media?: number | string;
    dorsal: number;
}

interface Equipo {
    id: string;
    nombre: string;
    presupuesto: number;
    dt: string;
    escudo?: string;
}

// 1. COMPONENTE PRINCIPAL (Con Suspense para evitar errores de Build)
export default function PaginaVerPerfil() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-bebas text-[#c9a84c] text-4xl animate-pulse uppercase">
                Iniciando Scanner...
            </div>
        }>
            <PerfilPublicoContenido />
        </Suspense>
    );
}

// 2. CONTENIDO DINÁMICO
function PerfilPublicoContenido() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id"); // Captura el ID de la URL (?id=...)

    const [visitadoData, setVisitadoData] = useState<UserData | null>(null);
    const [equipoDoc, setEquipoDoc] = useState<Equipo | null>(null);
    const [plantilla, setPlantilla] = useState<Jugador[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Si no hay ID en la URL, detenemos la carga
        if (!id) {
            console.error("No se detectó ID en la URL");
            setLoading(false);
            return;
        }

        const cargarPerfil = async () => {
            setLoading(true);
            try {
                // A. Obtener datos del Usuario
                const userSnap = await getDoc(doc(db, "users", id));

                if (userSnap.exists()) {
                    const data = userSnap.data() as UserData;
                    setVisitadoData(data);

                    // B. Si tiene equipo, cargar Escudo y Plantilla
                    if (data.equipoId) {
                        const equipoSnap = await getDoc(doc(db, "equipos", data.equipoId));
                        if (equipoSnap.exists()) {
                            setEquipoDoc({ id: equipoSnap.id, ...equipoSnap.data() } as Equipo);
                        }

                        const q = query(
                            collection(db, "equipos", data.equipoId, "plantilla"),
                            orderBy("nombre", "asc")
                        );

                        const unsubPlantilla = onSnapshot(q, (snapshot) => {
                            setPlantilla(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Jugador)));
                        });

                        return () => unsubPlantilla();
                    }
                } else {
                    console.error("El usuario no existe en Firebase");
                }
            } catch (error) {
                console.error("Error en la carga:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarPerfil();
    }, [id]);

    // Estados de Error / Carga
    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-bebas text-[#c9a84c] text-4xl animate-pulse uppercase italic">
            Sincronizando Perfil...
        </div>
    );

    if (!visitadoData) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-bebas text-3xl italic uppercase">
            Usuario no encontrado
        </div>
    );

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-barlow-condensed pt-32 italic">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* HEADER DINÁMICO */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#222] pb-10 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            {equipoDoc?.escudo && (
                                <div className="relative w-20 h-20">
                                    <Image src={equipoDoc.escudo} alt="" fill className="object-contain" unoptimized />
                                </div>
                            )}
                            <h1 className="font-bebas text-7xl md:text-8xl leading-none tracking-tighter text-white uppercase">
                                {equipoDoc?.nombre || "AGENTE LIBRE"}
                            </h1>
                        </div>
                        <p className="text-[#c9a84c] text-3xl uppercase tracking-[8px] italic ml-2 leading-none">
                            DT: {visitadoData.nombre}
                        </p>
                    </div>

                    <div className="bg-[#111] border-r-8 border-[#c9a84c] p-6 min-w-[250px] shadow-xl">
                        <p className="text-gray-500 text-xs uppercase tracking-[4px] font-bold mb-2 text-right">Estatus Oficial</p>
                        <p className="font-bebas text-4xl text-right text-white uppercase italic tracking-tighter leading-none">
                            {visitadoData.rol} de la liga
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* COLUMNA PLANTILLA */}
                    <section className="lg:col-span-2 space-y-8">
                        <h3 className="font-bebas text-4xl uppercase tracking-widest text-white border-b border-[#222] pb-4">Nómina Registrada</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plantilla.map((jugador) => (
                                <div key={jugador.id} className="bg-[#111] border border-white/5 p-5 flex justify-between items-center hover:border-[#c9a84c] transition-all group">
                                    <div>
                                        <p className="text-white font-bold text-2xl uppercase group-hover:text-[#c9a84c] transition-colors leading-none">{jugador.nombre}</p>
                                        <p className="text-[10px] text-[#c9a84c] uppercase tracking-[3px] mt-2 font-bold">{jugador.pos || "General"}</p>
                                    </div>
                                    <div className="font-bebas text-4xl text-[#c9a84c]/40 group-hover:text-[#c9a84c] transition-colors">{jugador.dorsal || "--"}</div>
                                </div>
                            ))}
                        </div>
                        {plantilla.length === 0 && <p className="text-gray-600 italic">No hay jugadores registrados en este club.</p>}
                    </section>

                    {/* COLUMNA CREDENCIAL */}
                    <aside className="space-y-10">
                        <div className="bg-[#111] border-2 border-[#c9a84c] p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#c9a84c]"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#c9a84c]"></div>
                            <h4 className="font-bebas text-3xl mb-8 text-[#c9a84c] tracking-widest uppercase border-b border-[#c9a84c]/20 pb-2">FICHA TÉCNICA</h4>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] text-[#555] uppercase font-bold tracking-[2px]">Nombre de Usuario</label>
                                    <p className="text-3xl font-bebas text-white leading-none uppercase italic">{visitadoData.nombre}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-[#555] uppercase font-bold tracking-[2px]">Discord ID</label>
                                    <p className="text-xl text-[#c9a84c] font-bold truncate uppercase">{visitadoData.discord || "NO VINCULADO"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[#222]">
                                    <div className="text-center">
                                        <p className="text-[10px] text-green-500 font-bold uppercase mb-1 font-barlow">Victorias</p>
                                        <p className="text-5xl font-bebas leading-none">{visitadoData.wins || 0}</p>
                                    </div>
                                    <div className="text-center border-l border-[#222]">
                                        <p className="text-[10px] text-red-500 font-bold uppercase mb-1 font-barlow">Derrotas</p>
                                        <p className="text-5xl font-bebas leading-none">{visitadoData.losses || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}