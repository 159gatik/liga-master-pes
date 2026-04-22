"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    doc, onSnapshot, collection, query, orderBy,
    writeBatch, serverTimestamp
} from "firebase/firestore";
import Image from "next/image";
// 1. Interfaces
export interface UserData {
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
}

interface Equipo {
    id: string;
    nombre: string;
    presupuesto: number;
    valor_plantilla: number; // Agregamos este campo
    dt: string;
    escudo?: string;
}

interface ConfigMercado {
    liberacionesAbiertas: boolean;
    fichajesAbiertos: boolean;
}

export default function PerfilDT() {
    const { user, userData, loading: authLoading } = useAuth();
    const [equipoDoc, setEquipoDoc] = useState<Equipo | null>(null);
    const [plantilla, setPlantilla] = useState<Jugador[]>([]);
    const [configMercado, setConfigMercado] = useState<ConfigMercado>({ liberacionesAbiertas: false, fichajesAbiertos: false });
    const [loadingData, setLoadingData] = useState(true);
    const limiteSueldos = (equipoDoc?.valor_plantilla || 0) * 0.10;
    const enRiesgo = (equipoDoc?.presupuesto || 0) < limiteSueldos;


    useEffect(() => {
        if (authLoading) return;
        if (!userData?.equipoId) {
            const timer = setTimeout(() => setLoadingData(false), 0);
            return () => clearTimeout(timer);
        }

        // Listener: Datos del Equipo
        const unsubEquipo = onSnapshot(doc(db, "equipos", userData.equipoId), (docSnap) => {
            if (docSnap.exists()) {
                setEquipoDoc({ id: docSnap.id, ...docSnap.data() } as Equipo);
            }
        });

        // Listener: Configuración de Mercado (Admin)
        const unsubConfig = onSnapshot(doc(db, "configuracion", "mercado"), (snap) => {
            if (snap.exists()) setConfigMercado(snap.data() as ConfigMercado);
        });

        // Listener: Plantilla
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
            unsubConfig();
            unsubPlantilla();
        };
    }, [userData?.equipoId, authLoading]);

    // --- FUNCIÓN PARA LIBERAR JUGADOR ---
    const liberarJugador = async (jugador: Jugador) => {
        if (!configMercado.liberacionesAbiertas) {
            return alert("El periodo de bajas está cerrado por la organización.");
        }

        if (plantilla.length <= 18) {
            return alert("REGLAMENTO: No puedes tener menos de 18 jugadores en tu plantilla.");
        }

        const confirmar = confirm(`¿Estás seguro de rescindir el contrato de ${jugador.nombre}? El jugador pasará a la lista de LIBRES.`);

        if (confirmar && userData?.equipoId) {
            try {
                const batch = writeBatch(db);

                // A. Referencia para eliminar del equipo
                const jugadorRef = doc(db, "equipos", userData.equipoId, "plantilla", jugador.id);
                batch.delete(jugadorRef);

                // B. Referencia para añadir a Jugadores Libres
                const libreRef = doc(collection(db, "jugadores_libres"));
                batch.set(libreRef, {
                    ...jugador,
                    exEquipo: userData.nombreEquipo,
                    fechaLiberacion: serverTimestamp(),
                    tipo: "Rescindió contrato"
                });

                await batch.commit();
                alert(`${jugador.nombre} ha sido enviado al mercado de libres.`);
            } catch (error) {
                console.error("Error al liberar:", error);
                alert("Error de conexión con el servidor.");
            }
        }
    };

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
                <div className="text-[#c9a84c] animate-pulse font-bebas text-4xl tracking-widest uppercase">
                    Accediendo a la Oficina...
                </div>
            </div>
        );
    }

    if (!user || !userData) return null;

    // Vista para Invitados / Sin Equipo (Mismo diseño tuyo)
    if (userData.rol === "invitado" || !userData.equipoId) {
        return (
            <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-10 flex flex-col items-center justify-center font-barlow-condensed">
                <div className="bg-[#111] border-2 border-[#c9a84c] p-8 md:p-16 max-w-3xl w-full text-center shadow-[0_0_60px_rgba(201,168,76,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#c9a84c]"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#c9a84c]"></div>
                    <div className="relative z-10 space-y-8">
                        <h2 className="font-bebas text-7xl md:text-8xl text-[#c9a84c] mb-2 uppercase italic tracking-tighter leading-none">OFICINA VACANTE</h2>
                        <div className="h-1 w-24 bg-[#c9a84c] mx-auto mb-6"></div>
                        <p className="text-gray-400 text-xl md:text-2xl uppercase tracking-widest leading-snug max-w-lg mx-auto">
                            Hola, <span className="text-white font-bold">{userData.nombre}</span>. Actualmente no tienes un club asignado.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                            <a href="/equipos-libres" className="group bg-white/5 border border-white/10 p-6 hover:border-[#c9a84c] transition-all text-center">
                                <h4 className="font-bebas text-2xl text-[#c9a84c]">POSTULARSE</h4>
                            </a>
                            <a href="/reglamento" className="group bg-white/5 border border-white/10 p-6 hover:border-[#c9a84c] transition-all text-center">
                                <h4 className="font-bebas text-2xl text-[#c9a84c]">REGLAMENTO</h4>
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-barlow-condensed">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* ⚠️ BLOQUE DE ALERTA DE QUIEBRA (Solo aparece si está en riesgo) */}
                {enRiesgo && equipoDoc && (
                    <div className="bg-red-950/20 border-l-4 border-red-600 p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                        <div className="flex items-center gap-5">
                            <div>
                                <h3 className="font-bebas text-4xl text-red-500 tracking-wider leading-none uppercase italic">Aviso de Quiebra Inminente</h3>
                                <p className="text-gray-400 text-m uppercase tracking-widest mt-1">Fondos insuficientes para cubrir los sueldos de la temporada</p>
                                <p className="text-gray-400 text-sm uppercase tracking-widest mt-1">Sugerencia: Libera jugadores para reducir el valor de tu plantilla y bajar el costo de sueldos</p>

                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[15px] text-red-500/50 uppercase font-bold tracking-[3px]">Sueldos estimados (10%)</p>
                            <p className="font-bebas text-4xl text-white">${limiteSueldos.toLocaleString()}</p>
                        </div>
                    </div>
                )}
                {/* HEADER DINÁMICO */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#222] pb-10 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            {equipoDoc?.escudo && (
                                <Image
                                    src={equipoDoc.escudo}
                                    alt={`Escudo de ${equipoDoc.nombre}`}
                                    width={64} // Corresponde a w-16
                                    height={64} // Corresponde a h-16
                                    className="object-contain"
                                    priority // Agregamos priority porque está en el header (LCP)
                                />
                            )}
                            <h1 className="font-bebas text-8xl md:text-5xl leading-none tracking-tighter italic text-white uppercase">
                                {equipoDoc?.nombre || "Cargando..."}
                            </h1>
                        </div>
                        <p className="text-[#c9a84c] text-3xl uppercase tracking-[8px] italic ml-2">
                            MÁNAGER: {userData.nombre}
                        </p>
                    </div>

                    {/* Caja de Presupuesto (Cambia de color si hay riesgo) */}
                    <div className={`p-6 border-r-8 min-w-[300px] shadow-xl transition-all ${enRiesgo ? 'bg-red-900/10 border-red-600' : 'bg-[#111] border-[#27ae60]'
                        }`}>
                        <p className="text-gray-500 text-xs uppercase tracking-[4px] font-bold mb-2 italic">Presupuesto Disponible</p>
                        <p className={`font-bebas text-6xl tabular-nums ${enRiesgo ? 'text-red-500' : 'text-[#27ae60]'}`}>
                            ${equipoDoc?.presupuesto?.toLocaleString()}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* PLANTILLA CON ACCIÓN DE LIBERAR */}
                    <section className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b border-[#222] pb-4">
                            <h3 className="font-bebas text-4xl uppercase tracking-widest italic text-white">Nómina de Jugadores</h3>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-500 text-sm uppercase tracking-widest">Plantilla: {plantilla.length}/26</span>
                                <span className="text-[#c9a84c] text-xl italic font-bold tracking-tighter bg-[#c9a84c]/10 px-3">OFICIAL</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plantilla.map((jugador) => (
                                <div key={jugador.id} className="bg-[#111] border border-[#222] p-5 flex flex-col gap-4 hover:border-[#c9a84c] transition-all group relative">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white font-bold text-2xl uppercase group-hover:text-[#c9a84c] transition-colors leading-none">{jugador.nombre}</p>
                                            <p className="text-[10px] text-[#c9a84c] uppercase tracking-[3px] mt-2 font-bold italic">{jugador.pos || "General"}</p>
                                        </div>
                                        <div className="font-bebas text-4xl text-[#c9a84c]/40 group-hover:text-[#c9a84c] transition-colors">{jugador.media || "--"}</div>
                                    </div>

                                    {/* BOTÓN DE RESCISIÓN: Solo si el mercado está abierto */}
                                    {configMercado.liberacionesAbiertas && (
                                        <button
                                            onClick={() => liberarJugador(jugador)}
                                            className="w-full border border-red-900/50 text-red-500/50 hover:text-white hover:bg-red-600 hover:border-red-600 py-1 text-[10px] uppercase font-bold tracking-widest transition-all italic"
                                        >
                                            Rescindir Contrato
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* IDENTIDAD VISUAL (CARNET DE DT) */}
                    <aside className="space-y-10">
                        <div className="bg-[#111] border-2 border-[#c9a84c] p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#c9a84c]"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#c9a84c]"></div>

                            <h4 className="font-bebas text-3xl mb-8 text-[#c9a84c] tracking-widest uppercase italic border-b border-[#c9a84c]/20 pb-2">credencial</h4>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="text-[10px] text-[#555] uppercase font-bold tracking-[2px]">Director Técnico</label>
                                    <p className="text-3xl font-bebas italic text-white leading-none">{userData.nombre}</p>
                                </div>

                                <div>
                                    <label className="text-[10px] text-[#555] uppercase font-bold tracking-[2px]">Discord de Contacto</label>
                                    <p className="text-xl text-[#c9a84c] font-bold italic truncate">{userData.discord || "NO VINCULADO"}</p>
                                </div>

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
                        </div>

                        {/* ESTADO DEL MERCADO (AVISO) */}
                        <div className={`p-6 border-l-2 italic flex flex-col gap-1 ${configMercado.liberacionesAbiertas ? 'bg-green-900/10 border-green-500' : 'bg-red-900/10 border-red-500'}`}>
                            <p className="text-xs uppercase font-bold tracking-widest text-white">Ventana de Bajas</p>
                            <p className={`text-[10px] uppercase tracking-widest ${configMercado.liberacionesAbiertas ? 'text-green-500' : 'text-red-500'}`}>
                                {configMercado.liberacionesAbiertas ? 'Abierta - Puedes liberar jugadores' : 'Cerrada - Plantilla bloqueada'}
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}