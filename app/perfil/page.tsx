"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    doc, onSnapshot, collection, query, orderBy,
    updateDoc, arrayUnion, arrayRemove,
    Timestamp
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { Alert } from "@/src/lib/alerts";

// --- INTERFACES ---
export interface UserData {
    nombre: string;
    rol: string;
    equipoId?: string;
    nombreEquipo?: string;
    discord?: string;
    wins?: number;
    losses?: number;
    fechaRegistro?: any;
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
    const { user, userData, loading: authLoading, equipoIdActivo } = useAuth();
    const [equipoDoc, setEquipoDoc] = useState<Equipo | null>(null);
    const [plantilla, setPlantilla] = useState<Jugador[]>([]);
    const [configMercado, setConfigMercado] = useState<ConfigMercado>({ liberacionesAbiertas: false, fichajesAbiertos: false });
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);

    const limiteSueldos = (equipoDoc?.valor_plantilla || 0) * 0.10;
    const enRiesgo = (equipoDoc?.presupuesto || 0) < limiteSueldos;

    useEffect(() => {
        // Si terminó de cargar la auth y no hay equipo, dejamos de cargar para mostrar el aviso
        if (!authLoading && !equipoIdActivo) {
            setLoadingData(false);
            return;
        }

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
                    return Alert.fire({ icon: 'warning', title: 'CUPO LLENO', text: 'Ya tienes 11 titulares.' });
                }
                await updateDoc(equipoRef, { titulares: arrayUnion(id) });
            }
        } catch (error) { console.error(error); } finally { setSaving(false); }
    };

    if (authLoading || loadingData) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-bebas text-[#c9a84c] text-4xl animate-pulse italic">Accediendo a la Oficina...</div>
    );

    // --- CARTEL PARA USUARIOS SIN CLUB ---
    if (user && userData && !equipoIdActivo && userData.rol !== "admin") {
        return (
            <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center font-barlow-condensed">
                <div className="bg-[#111] border-2 border-[#c9a84c]/20 p-12 max-w-2xl shadow-2xl relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 font-bebas text-9xl text-white/[0.02] select-none uppercase italic">VACANTE</div>
                    <div className="w-24 h-24 bg-black border-2 border-[#c9a84c] flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(201,168,76,0.1)]">
                        <span className="font-bebas text-5xl text-[#c9a84c] italic">!</span>
                    </div>
                    <h2 className="font-bebas text-6xl text-white mb-4 italic uppercase leading-none">Sin Equipo Asignado</h2>
                    <p className="text-[#555] uppercase tracking-[3px] text-sm mb-10 leading-relaxed">
                        Detectamos que aún no formas parte del cuerpo técnico de ningún club oficial.
                        Debes enviar tu solicitud para comenzar tu carrera como DT.
                    </p>
                    <Link href="/equipos-libres" className="inline-block bg-[#c9a84c] text-black px-12 py-4 font-bebas text-3xl uppercase tracking-tighter hover:bg-white transition-all shadow-lg skew-x-[-15deg]">
                        <span className="inline-block skew-x-[15deg]">Postularme a un Club</span>
                    </Link>
                </div>
            </main>
        );
    }

    if (!user || !userData) return null;

    const titulares = plantilla.filter(j => equipoDoc?.titulares?.includes(j.id));
    const gk = titulares.filter(j => j.pos.toUpperCase().includes("POR") || j.pos.toUpperCase().includes("GK"));
    const df = titulares.filter(j => ["CT", "LB", "RB", "SB", "LI", "LD", "DFC"].some(p => j.pos.toUpperCase().includes(p)));
    const md = titulares.filter(j => ["CM", "AM", "DM", "LM", "RM", "MC", "MO", "MI", "MD"].some(p => j.pos.toUpperCase().includes(p)));
    const dl = titulares.filter(j => ["CF", "WF", "ST", "SS", "DC", "EI", "ED"].some(p => j.pos.toUpperCase().includes(p)));

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-barlow-condensed italic">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#222] pb-10 gap-8">
                    <div className="flex items-center gap-4">
                        {equipoDoc?.escudo && <Image src={equipoDoc.escudo} alt="Escudo" width={64} height={64} className="object-contain" />}
                        <h1 className="font-bebas text-8xl md:text-5xl leading-none tracking-tighter text-white uppercase">{equipoDoc?.nombre}</h1>
                    </div>
                    <div className={`p-6 border-r-8 min-w-[300px] shadow-xl ${enRiesgo ? 'bg-red-900/10 border-red-600' : 'bg-[#111] border-[#27ae60]'}`}>
                        <p className="text-gray-500 text-xs uppercase tracking-[4px] font-bold mb-2">Presupuesto Disponible</p>
                        <p className={`font-bebas text-6xl ${enRiesgo ? 'text-red-500' : 'text-[#27ae60]'}`}>${equipoDoc?.presupuesto?.toLocaleString()}</p>
                    </div>
                </header>

                {/* TARJETA DT */}
                <section className="bg-[#111] border-2 border-[#222] relative overflow-hidden mb-12 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-stretch relative z-10">
                        <div className="p-8 border-b md:border-b-0 md:border-r border-[#222] flex-grow">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 bg-black border-2 border-[#c9a84c] flex items-center justify-center">
                                    <span className="font-bebas text-5xl text-[#c9a84c] italic">DT</span>
                                </div>
                                <h3 className="font-bebas text-5xl text-white italic uppercase">{userData.nombre}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] text-[#555] uppercase tracking-[3px] mb-1">Contacto</p>
                                    <p className="text-white font-bold italic text-lg uppercase">{userData.discord || "SIN VINCULAR"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#555] uppercase tracking-[3px] mb-1">Registro</p>
                                    <p className="text-white font-bold italic text-lg uppercase">
                                        {(() => {
                                            const fecha = (userData as any).fechaRegistro;
                                            if (!fecha) return "---";
                                            const d = typeof fecha.toDate === "function" ? fecha.toDate() : new Date(fecha);
                                            return isNaN(d.getTime()) ? "---" : d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
                                        })()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row md:flex-col divide-x md:divide-x-0 md:divide-y divide-[#222] min-w-[200px]">
                            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-green-500/5">
                                <p className="font-bebas text-6xl text-[#27ae60]">{userData.wins || 0}</p>
                                <p className="text-[10px] text-[#27ae60] font-bold uppercase tracking-[3px]">Victorias</p>
                            </div>
                            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-red-500/5">
                                <p className="font-bebas text-6xl text-red-600">{userData.losses || 0}</p>
                                <p className="text-[10px] text-red-600 font-bold uppercase tracking-[3px]">Derrotas</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PIZARRA Y PLANTILLA */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <section className="lg:col-span-5 space-y-6">
                        <div className="flex justify-between items-end border-b border-[#c9a84c]/30 pb-2">
                            <h3 className="font-bebas text-4xl uppercase text-white tracking-tighter">Pizarra de <span className="text-[#c9a84c]">Estrategia</span></h3>
                            <span className="text-xs font-bold text-[#c9a84c] tracking-widest">{saving ? "GUARDANDO..." : `${equipoDoc?.titulares?.length || 0}/11`}</span>
                        </div>
                        <div className="relative w-full aspect-[3/4] max-w-[380px] mx-auto bg-[#0509] border-2 border-[#1a1a1a] shadow-2xl">
                            {/* JUGADORES EN CANCHA */}
                            <div className="relative h-full w-full p-8 flex flex-col justify-between z-10">
                                <div className="flex justify-around">{dl.map(j => <PlayerCircle key={j.id} j={j} onRemove={() => toggleTitular(j.id)} />)}</div>
                                <div className="flex justify-around">{md.map(j => <PlayerCircle key={j.id} j={j} onRemove={() => toggleTitular(j.id)} />)}</div>
                                <div className="flex justify-around">{df.map(j => <PlayerCircle key={j.id} j={j} onRemove={() => toggleTitular(j.id)} />)}</div>
                                <div className="flex justify-center">{gk.map(j => <PlayerCircle key={j.id} j={j} isGK onRemove={() => toggleTitular(j.id)} />)}</div>
                            </div>
                        </div>
                    </section>

                    <section className="lg:col-span-7 space-y-6">
                        <h3 className="font-bebas text-4xl uppercase text-white border-b border-[#222] pb-2">Plantilla <span className="text-[#c9a84c]">Oficial</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {plantilla.map((j) => {
                                const esTitular = equipoDoc?.titulares?.includes(j.id);
                                return (
                                    <div key={j.id} onClick={() => toggleTitular(j.id)} className={`p-4 border-l-2 cursor-pointer transition-all flex justify-between items-center ${esTitular ? 'bg-[#c9a84c]/10 border-[#c9a84c]' : 'bg-[#111] border-transparent shadow-lg'}`}>
                                        <div>
                                            <p className={`font-bold text-lg uppercase ${esTitular ? 'text-[#c9a84c]' : 'text-white'}`}>{j.nombre}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{j.pos}</p>
                                        </div>
                                        <p className={`font-bebas text-3xl ${esTitular ? 'text-white' : 'text-[#1a1a1a]'}`}>#{j.dorsal}</p>
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
        <div className="flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform" onClick={onRemove}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isGK ? 'bg-[#c9a84c] border-white text-black' : 'bg-black border-[#222] text-[#c9a84c]'}`}>
                <span className="text-[11px] font-bold font-mono">{j.dorsal}</span>
            </div>
            <span className="text-[8px] text-white font-bold uppercase bg-black/80 px-1 rounded truncate max-w-[65px]">{j.nombre}</span>
        </div>
    );
}