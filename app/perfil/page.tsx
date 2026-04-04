"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase"; // Asegúrate que esta ruta sea correcta
import { useAuth } from "@/src/lib/hooks/useAuht";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";

// 1. Interfaces estrictas para evitar el error de "any"
export interface UserData {
    nombre: string;
    rol: string;
    equipoId?: string;
    wins?: number;   // <--- Agregalo acá
    losses?: number; // <--- Agregalo acá
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

    // Estados con tipos definidos
    const [equipoDoc, setEquipoDoc] = useState<Equipo | null>(null);
    const [plantilla, setPlantilla] = useState<Jugador[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        // 1. Si el sistema de autenticación está cargando, esperamos
        if (authLoading) return;

        // 2. Si terminó de cargar y no hay equipoId
        if (!userData?.equipoId) {
            // Usamos un pequeño timeout para evitar el error de "synchronous setState"
            const timer = setTimeout(() => {
                setLoadingData(false);
            }, 0);
            return () => clearTimeout(timer);
        }

        // 3. Si hay equipoId, iniciamos los listeners normales...
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
        }, (error) => {
            console.error("Error cargando plantilla:", error);
            setLoadingData(false);
        });

        return () => {
            unsubEquipo();
            unsubPlantilla();
        };
    }, [userData?.equipoId, authLoading]);

    // 2. Pantalla de carga estética
    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
                <div className="text-[#c9a84c] animate-pulse font-bebas text-4xl tracking-widest uppercase">
                    Accediendo a la Oficina...
                </div>
                <div className="w-48 h-1 bg-[#1a1a1a] mt-4 overflow-hidden">
                    <div className="w-full h-full bg-[#c9a84c] animate-load"></div>
                </div>
            </div>
        );
    }

    // 3. Protección si no hay sesión
    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <p className="text-white font-barlow-condensed text-xl uppercase tracking-widest">
                    Debes iniciar sesión para gestionar tu club.
                </p>
            </div>
        );
    }

    // 4. Vista para usuarios sin equipo (Invitados)
    if (userData?.rol === "invitado" || !userData?.equipoId) {
        return (
            <main className="min-h-screen bg-[#0a0a0a] p-10 flex items-center justify-center">
                <div className="bg-[#111] border border-[#c9a84c] p-10 max-w-lg text-center shadow-2xl">
                    <h2 className="font-bebas text-5xl text-[#c9a84c] mb-4 uppercase italic">Estado: En Revisión</h2>
                    <div className="h-px bg-[#222] w-full mb-6"></div>
                    <p className="text-gray-400 font-barlow-condensed text-xl uppercase tracking-widest leading-relaxed">
                        Bienvenido, <span className="text-white font-bold">{userData?.nombre}</span>.<br />
                        Tu solicitud de ingreso está en manos del comisionado.<br />
                        <span className="text-[#c9a84c] text-sm block mt-4 tracking-[4px]">Pronto recibirás tus credenciales de DT</span>
                    </p>
                </div>
            </main>
        );
    }

    // 5. Vista principal del Perfil del DT
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* HEADER DE EL LEGADO */}
                <header className="flex flex-col md:flex-row justify-between items-end border-b-2 border-[#222] pb-8 gap-8">
                    <div className="space-y-2">
                        <h1 className="font-bebas text-8xl leading-none tracking-tighter italic text-white">
                            {equipoDoc?.nombre || "Cargando..."}
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="h-4 w-1 bg-[#c9a84c]"></span>
                            <p className="font-barlow-condensed text-[#c9a84c] text-2xl uppercase tracking-[6px]">
                                MANAGER: {userData?.nombre}
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#111] p-4 border-r-4 border-[#27ae60] min-w-[250px]">
                        <p className="text-gray-500 text-[10px] uppercase tracking-[3px] font-bold mb-1">Presupuesto para Fichajes</p>
                        <p className="font-bebas text-5xl text-[#27ae60] tabular-nums">
                            ${equipoDoc?.presupuesto?.toLocaleString()}
                        </p>
                    </div>
                </header>

                {/* CUERPO DEL PERFIL */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* LISTA DE JUGADORES */}
                    <section className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between border-b border-[#222] pb-2">
                            <h3 className="font-bebas text-3xl uppercase tracking-widest text-white">
                                Plantilla del Club
                            </h3>
                            <span className="font-barlow-condensed text-[#c9a84c] uppercase tracking-widest">
                                {plantilla.length} Jugadores registrados
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plantilla.length > 0 ? (
                                plantilla.map((jugador) => (
                                    <div key={jugador.id} className="group bg-[#111] border border-[#222] p-5 flex justify-between items-center hover:bg-[#1a1a1a] hover:border-[#c9a84c] transition-all cursor-default">
                                        <div className="font-barlow-condensed">
                                            <p className="text-white font-bold text-xl uppercase group-hover:text-[#c9a84c] transition-colors">{jugador.nombre}</p>
                                            <p className="text-[11px] text-[#666] uppercase tracking-[2px] mt-1">
                                                {jugador.posicion || "Posición no definida"}
                                            </p>
                                        </div>
                                        <div className="text-[#c9a84c] font-bebas text-3xl opacity-80 group-hover:opacity-100">
                                            {jugador.media || "--"}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[#444] uppercase font-barlow-condensed tracking-widest py-10 italic">
                                    No hay jugadores en la plantilla actualmente.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* ASIDE DE ESTADÍSTICAS */}
                    <aside className="space-y-8">
                        <div className="bg-[#111] p-8 border border-[#222] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#c9a84c]/5 rotate-45 translate-x-8 -translate-y-8"></div>
                            <h4 className="font-bebas text-2xl mb-6 text-[#c9a84c] tracking-widest uppercase italic">Registro Oficial</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0a0a0a] p-4 border-b-2 border-[#c9a84c]">
                                   
                                    <p className="text-4xl font-bebas font-bold text-white">
                                        {(userData as { wins?: number })?.wins || 0}
                                    </p>
                                    <p className="text-4xl font-bebas font-bold text-white">
                                        {(userData as { losses?: number })?.losses || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* MENSAJE DE ESTILO PES */}
                        <div className="border-l-2 border-[#c9a84c] p-6 bg-gradient-to-r from-[#111] to-transparent italic">
                            <p className="text-sm text-gray-400 font-barlow-condensed leading-relaxed tracking-wider">
                                La disciplina es el puente entre las metas y los logros. Gestiona tu presupuesto con sabiduría para alcanzar la gloria eterna en El Legado.
                            </p>
                        </div>
                    </aside>

                </div>
            </div>
        </main>
    );
}