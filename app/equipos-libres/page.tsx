"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "../../src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht"; // Importamos el hook
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
    presupuesto?: number;
}

export default function EquiposLibresPage() {
    const { user, loading: authLoading } = useAuth();
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [loading, setLoading] = useState(true);
    const [yaPostulado, setYaPostulado] = useState(false);

    // 1. VERIFICAR SI EL USUARIO YA SE POSTULÓ (BASADO EN UID)
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
        const q = query(collection(db, "equipos"), orderBy("nombre", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const listaEquipos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Equipo[]; // <--- AGREGÁ ESTO AQUÍ

            setEquipos(listaEquipos);
            setLoading(false);
        }, (error) => {
            console.error("Error al obtener equipos:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (authLoading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-bebas text-[#c9a84c] text-2xl animate-pulse">
            COMPROBANDO REGISTROS...
        </div>
    );

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans p-6 md:p-10">
            {/* HEADER */}
            <div className="max-w-6xl mx-auto mb-10 border-l-4 border-[#c9a84c] pl-5">
                <h1 className="font-bebas text-5xl md:text-7xl tracking-[5px] uppercase text-white">Equipos Libres</h1>
                <span className="font-barlow-condensed text-sm tracking-[3px] text-[#c9a84c] uppercase italic">
                    Temporada I · Inscripciones Abiertas
                </span>
            </div>

            {/* GRILLA DE EQUIPOS */}
            {loading ? (
                <div className="flex justify-center items-center h-64 font-bebas text-[#c9a84c] text-xl animate-bounce">
                    Cargando base de datos...
                </div>
            ) : (
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
                        {equipos.map((equipo) => {
                            const isLibre = equipo.estado === 'Libre';
                            const isSelected = equipo.nombre === selectedTeam;

                            return (
                                <div
                                    key={equipo.id}
                                    className={`relative bg-[#111] border-2 p-4 flex flex-col items-center group transition-all duration-300 ${isSelected
                                        ? 'border-white scale-105 z-10 shadow-[0_0_25px_rgba(201,168,76,0.2)]'
                                        : (isLibre && !yaPostulado)
                                            ? 'border-[#27ae60]/30 cursor-pointer hover:border-[#27ae60]'
                                            : 'border-[#2a2a2a] opacity-40 grayscale pointer-events-none'
                                        }`}
                                    onClick={() => !yaPostulado && isLibre && setSelectedTeam(equipo.nombre)}
                                >
                                    <div className="relative w-24 h-24 mb-4">
                                        <Image
                                            src={equipo.escudo}
                                            alt={equipo.nombre}
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>
                                    <h3 className="font-bebas text-xl tracking-wider text-center text-white italic">
                                        {equipo.nombre}
                                    </h3>
                                    <div className="mt-2 text-center">
                                        <span className={`text-[10px] font-bold uppercase px-3 py-0.5 tracking-tighter ${isLibre ? 'bg-[#27ae60] text-black' : 'bg-[#333] text-gray-400'
                                            }`}>
                                            {isLibre ? 'Disponible' : `DT: ${equipo.dt}`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}

            {/* SECCIÓN DINÁMICA: FORMULARIO O CARTEL DE YA POSTULADO */}
            <div className="max-w-xl mx-auto">
                {yaPostulado ? (
                    <div className="bg-[#111] border border-[#c9a84c] p-12 text-center shadow-[0_0_50px_rgba(201,168,76,0.1)] animate-fade-in">
                        <div className="text-6xl mb-6">📬</div>
                        <h2 className="font-bebas text-4xl text-[#c9a84c] mb-4 tracking-widest uppercase italic">
                            ¡Postulación ya enviada!
                        </h2>
                        <p className="font-barlow-condensed text-gray-400 uppercase tracking-[2px] text-sm leading-relaxed">
                            Tu solicitud para unirte a El Legado está siendo procesada.
                            No puedes enviar más de una postulación por temporada.
                            Pronto recibirás noticias vía Discord o Email.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="font-bebas text-4xl tracking-[3px] text-[#c9a84c] uppercase">
                                Formulario de Ingreso
                            </h2>
                            <div className="h-1 w-20 bg-[#c9a84c] mx-auto mt-2"></div>
                                {!selectedTeam && (
                                    <p className="text-[#555] font-barlow-condensed uppercase text-xs mt-4 tracking-widest">
                                        Selecciona un equipo de arriba para habilitar el formulario
                                    </p>
                                )}
                            </div>
                            <FormularioPostulacion
                                key={selectedTeam}
                                equipoPreseleccionado={selectedTeam}
                            />
                    </>
                )}
            </div>
        </main>
    );
}