"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    doc, onSnapshot, collection, query, orderBy,
    writeBatch, serverTimestamp, updateDoc,
    arrayUnion, arrayRemove,
    Timestamp
} from "firebase/firestore";
import Image from "next/image";
import { Alert } from "@/src/lib/alerts";

// 1. INTERFAZ CORREGIDA (Agregamos 'any' para evitar que TypeScript se queje)
export interface UserData {
    nombre: string;
    rol: string;
    equipoId?: string;
    nombreEquipo?: string;
    discord?: string;
    wins?: number;
    losses?: number;
    fechaRegistro?: any; // Cambiado a any para que acepte el objeto de Firebase sin errores
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
    valor_plantilla: number;
    dt: string;
    escudo?: string;
    titulares?: string[];
}

interface ConfigMercado {
    liberacionesAbiertas: boolean;
    fichajesAbiertos: boolean;
}

export default function PerfilDT() {
    const { user, userData, loading: authLoading, equipoIdActivo, nombreEquipoActivo } = useAuth();
    const [equipoDoc, setEquipoDoc] = useState<Equipo | null>(null);
    const [plantilla, setPlantilla] = useState<Jugador[]>([]);
    const [configMercado, setConfigMercado] = useState<ConfigMercado>({ liberacionesAbiertas: false, fichajesAbiertos: false });
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);

    const limiteSueldos = (equipoDoc?.valor_plantilla || 0) * 0.10;
    const enRiesgo = (equipoDoc?.presupuesto || 0) < limiteSueldos;

    useEffect(() => {
        if (authLoading || !equipoIdActivo) return;

        const unsubEquipo = onSnapshot(doc(db, "equipos", equipoIdActivo), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const titularesLimpios = (data.titulares || []).filter((t: string) => t !== "");
                setEquipoDoc({ id: docSnap.id, ...data, titulares: titularesLimpios } as Equipo);
            }
        });

        const unsubConfig = onSnapshot(doc(db, "configuracion", "mercado"), (snap) => {
            if (snap.exists()) setConfigMercado(snap.data() as ConfigMercado);
        });

        const q = query(collection(db, "equipos", equipoIdActivo, "plantilla"), orderBy("nombre", "asc"));
        const unsubPlantilla = onSnapshot(q, (snapshot) => {
            setPlantilla(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Jugador)));
            setLoadingData(false);
        });

        return () => { unsubEquipo(); unsubConfig(); unsubPlantilla(); };
    }, [equipoIdActivo, authLoading]);

    const toggleTitular = async (id: string) => {
        if (!equipoIdActivo) return;
        const equipoRef = doc(db, "equipos", equipoIdActivo);
        const actuales = equipoDoc?.titulares || [];
        const esTitular = actuales.includes(id);
        setSaving(true);
        try {
            if (esTitular) {
                await updateDoc(equipoRef, { titulares: arrayRemove(id) });
            } else {
                if (actuales.length >= 11) {
                    setSaving(false);
                    return Alert.fire({ icon: 'warning', title: 'CUPO LLENO', text: 'Ya tienes 11 titulares elegidos.' });
                }
                await updateDoc(equipoRef, { titulares: arrayUnion(id) });
            }
        } catch (error) {
            console.error("Error al guardar táctica:", error);
        } finally {
            setSaving(false);
        }
    };

    const titulares = plantilla.filter(j => equipoDoc?.titulares?.includes(j.id));
    const gk = titulares.filter(j => j.pos.toUpperCase().includes("POR") || j.pos.toUpperCase().includes("GK"));
    const df = titulares.filter(j => ["CT", "LB", "RB", "SB", "LI", "LD", "DFC"].some(p => j.pos.toUpperCase().includes(p)));
    const md = titulares.filter(j => ["CM", "AM", "DM", "LM", "RM", "MC", "MO", "MI", "MD"].some(p => j.pos.toUpperCase().includes(p)));
    const dl = titulares.filter(j => ["CF", "WF", "ST", "SS", "DC", "EI", "ED"].some(p => j.pos.toUpperCase().includes(p)));

    if (authLoading || loadingData) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-bebas text-[#c9a84c] text-4xl animate-pulse italic">Accediendo a la Oficina...</div>
    );

    if (!user || !userData || (userData.rol !== "admin" && !equipoIdActivo)) return null;

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-barlow-condensed italic">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#222] pb-10 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            {equipoDoc?.escudo && <Image src={equipoDoc.escudo} alt="Escudo" width={64} height={64} className="object-contain" />}
                            <h1 className="font-bebas text-8xl md:text-5xl leading-none tracking-tighter text-white uppercase">{equipoDoc?.nombre}</h1>
                        </div>
                    </div>
                    <div className={`p-6 border-r-8 min-w-[300px] shadow-xl ${enRiesgo ? 'bg-red-900/10 border-red-600' : 'bg-[#111] border-[#27ae60]'}`}>
                        <p className="text-gray-500 text-xs uppercase tracking-[4px] font-bold mb-2">Presupuesto Disponible</p>
                        <p className={`font-bebas text-6xl ${enRiesgo ? 'text-red-500' : 'text-[#27ae60]'}`}>${equipoDoc?.presupuesto?.toLocaleString()}</p>
                    </div>
                </header>

                {/* TARJETA DE IDENTIDAD DT */}
                <section className="bg-[#111] border-2 border-[#222] relative overflow-hidden mb-12 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#c9a84c]/5 to-transparent pointer-events-none"></div>
                    <div className="absolute -bottom-10 -right-10 font-bebas text-9xl text-white/[0.02] select-none uppercase italic">MANAGER</div>

                    <div className="flex flex-col md:flex-row items-stretch relative z-10">
                        <div className="p-8 border-b md:border-b-0 md:border-r border-[#222] flex-grow">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 bg-black border-2 border-[#c9a84c] flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.2)]">
                                    <span className="font-bebas text-5xl text-[#c9a84c] italic">DT</span>
                                </div>
                                <div>
                                    <h3 className="font-bebas text-5xl text-white leading-none tracking-tighter italic uppercase">{userData.nombre}</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] text-[#555] uppercase font-bold tracking-[3px] mb-1">Contacto Oficial</p>
                                    <p className="text-white font-bold italic text-lg uppercase tracking-widest truncate">{userData.discord || "SIN VINCULAR"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#555] uppercase font-bold tracking-[3px] mb-1">Registro desde</p>
                                    <p className="text-white font-bold italic text-lg uppercase tracking-widest">
                                        {/* SOLUCIÓN AL ERROR DE FECHA REGISTRO */}
                                        {(() => {
                                            const uData = userData as any; // Forzamos a any para evitar el error de "no reconoce"
                                            const fecha = uData.fechaRegistro;
                                            if (!fecha) return "---";
                                            try {
                                                const d = typeof fecha.toDate === "function" ? fecha.toDate() : new Date(fecha);
                                                return isNaN(d.getTime()) ? "---" : d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
                                            } catch { return "---"; }
                                        })()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row md:flex-col divide-x md:divide-x-0 md:divide-y divide-[#222] min-w-[200px]">
                            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-green-500/5 group hover:bg-green-500/10 transition-colors">
                                <p className="font-bebas text-6xl text-[#27ae60] leading-none group-hover:scale-110 transition-transform">{userData.wins || 0}</p>
                                <p className="text-[10px] text-[#27ae60] font-bold uppercase tracking-[3px] mt-2 italic">Victorias</p>
                            </div>
                            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-red-500/5 group hover:bg-red-500/10 transition-colors">
                                <p className="font-bebas text-6xl text-red-600 leading-none group-hover:scale-110 transition-transform">{userData.losses || 0}</p>
                                <p className="text-[10px] text-red-600 font-bold uppercase tracking-[3px] mt-2 italic">Derrotas</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <section className="lg:col-span-5 space-y-6">
                        <div className="flex justify-between items-end border-b border-[#c9a84c]/30 pb-2">
                            <h3 className="font-bebas text-4xl uppercase text-white tracking-tighter">
                                Pizarra de <span className="text-[#c9a84c]">Estrategia</span>
                            </h3>
                            <span className="text-xs font-bold text-[#c9a84c] tracking-widest">
                                {saving ? "GUARDANDO..." : `${equipoDoc?.titulares?.length || 0}/11`}
                            </span>
                        </div>

                        {/* LA CANCHA */}
                        <div className="relative w-full aspect-[3/4] max-w-[380px] mx-auto bg-[#0509] border-2 border-[#1a1a1a] overflow-hidden shadow-2xl">

                            {/* LÍNEAS DEL CAMPO (DISEÑO TÁCTICO) */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                {/* Área Grande Superior */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-x border-b border-white"></div>
                                {/* Área Chica Superior */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 border-x border-b border-white"></div>

                                {/* Línea Central y Círculo */}
                                <div className="absolute top-1/2 w-full h-[1px] bg-white"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-white"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full"></div>

                                {/* Área Grande Inferior */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-x border-t border-white"></div>
                                {/* Área Chica Inferior */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 border-x border-t border-white"></div>
                            </div>

                            {/* JUGADORES (Z-10 PARA ESTAR SOBRE LAS LÍNEAS) */}
                            <div className="relative h-full w-full p-8 flex flex-col justify-between z-10">
                                {/* Línea de Ataque */}
                                <div className="flex justify-around min-h-[50px]">
                                    {dl.map(j => <PlayerCircle key={j.id} j={j} onRemove={() => toggleTitular(j.id)} />)}
                                </div>

                                {/* Línea de Mediocampo */}
                                <div className="flex justify-around min-h-[50px]">
                                    {md.map(j => <PlayerCircle key={j.id} j={j} onRemove={() => toggleTitular(j.id)} />)}
                                </div>

                                {/* Línea de Defensa */}
                                <div className="flex justify-around min-h-[50px]">
                                    {df.map(j => <PlayerCircle key={j.id} j={j} onRemove={() => toggleTitular(j.id)} />)}
                                </div>

                                {/* Portero */}
                                <div className="flex justify-center min-h-[50px]">
                                    {gk.map(j => <PlayerCircle key={j.id} j={j} isGK onRemove={() => toggleTitular(j.id)} />)}
                                </div>
                            </div>

                            {/* Sombreado de los bordes para dar profundidad */}
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]"></div>
                        </div>
                    </section>

                    <section className="lg:col-span-7 space-y-6">
                        <h3 className="font-bebas text-4xl uppercase text-white border-b border-[#222] pb-2">Plantilla <span className="text-[#c9a84c]">Oficial</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {plantilla.map((j) => {
                                const esTitular = equipoDoc?.titulares?.includes(j.id);
                                return (
                                    <div key={j.id} onClick={() => toggleTitular(j.id)} className={`p-4 border-l-2 cursor-pointer transition-all flex justify-between items-center group ${esTitular ? 'bg-[#c9a84c]/10 border-[#c9a84c]' : 'bg-[#111] border-transparent hover:border-gray-600 shadow-lg'}`}>
                                        <div className="leading-tight">
                                            <p className={`font-bold text-lg uppercase transition-colors ${esTitular ? 'text-[#c9a84c]' : 'text-white group-hover:text-[#c9a84c]'}`}>{j.nombre}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{j.pos}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bebas text-3xl transition-colors ${esTitular ? 'text-white' : 'text-[#1a1a1a] group-hover:text-white'}`}>#{j.dorsal}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

function PlayerCircle({ j, isGK, onRemove }: { j: Jugador, isGK?: boolean, onRemove: () => void }) {
    return (
        <div className="flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform animate-fadeIn" onClick={onRemove}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-2xl ${isGK ? 'bg-[#c9a84c] border-white text-black' : 'bg-black border-[#222] text-[#c9a84c]'}`}>
                <span className="text-[11px] font-bold font-mono">{j.dorsal}</span>
            </div>
            <span className="text-[8px] text-white font-bold uppercase bg-black/80 px-1 rounded truncate max-w-[65px]">{j.nombre}</span>
        </div>
    );
}