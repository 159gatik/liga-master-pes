"use client";
import { useState, useEffect } from "react";
import { db } from "../../src/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp
} from "firebase/firestore";

interface Solicitud {
    id: string;
    vendedor: string;
    comprador: string;
    jugador: string;
    monto: number;
    estado: string;
    fecha?: Timestamp;
}

export default function SeccionTraspasos() {
    // Inicializamos con un array vacío para que el .map no falle
    const [traspasos, setTraspasos] = useState<Solicitud[]>([]);
    // Quitamos el estado de loading inicial para que no aparezca el mensaje de espera
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, "solicitudes_mercado"),
            where("estado", "==", "aprobado"),
            orderBy("fecha", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Solicitud[];
            setTraspasos(data);
            setHasLoaded(true); // Solo para saber que ya hubo una respuesta de Firebase
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="animate-fade-in space-y-6">
            {/* ENCABEZADO DE SECCIÓN */}
            <div className="flex items-center gap-4 mb-8">
                <h3 className="font-barlow-condensed text-[#888] uppercase tracking-[3px] text-sm whitespace-nowrap">
                    Movimientos Oficiales Confirmados
                </h3>
                <div className="h-[1px] w-full bg-gradient-to-r from-[#2a2a2a] to-transparent"></div>
            </div>

            {/* LÓGICA DE VISUALIZACIÓN DIRECTA */}
            {traspasos.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-[#1a1a1a] bg-[#0a0a0a]/50">
                    <p className="text-[#444] font-barlow-condensed uppercase tracking-[2px] italic">
                        {hasLoaded ? "No se registran traspasos oficiales en esta temporada" : "No se registran traspasos oficiales en esta temporada"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {traspasos.map((tras) => (
                        <div
                            key={tras.id}
                            className="bg-[#111] border border-[#2a2a2a] p-5 flex flex-col md:flex-row items-center justify-between group hover:border-[#27ae60] transition-all gap-6 border-l-4 border-l-[#27ae60]"
                        >
                            {/* INFO JUGADOR */}
                            <div className="flex flex-col w-full md:w-1/4 text-center md:text-left">
                                <span className="text-white font-bold text-2xl uppercase tracking-tighter group-hover:text-[#c9a84c] transition-colors leading-tight">
                                    {tras.jugador}
                                </span>
                                <span className="text-[9px] text-[#444] tracking-[3px] uppercase font-bold mt-1">
                                    Transferencia Exitosa
                                </span>
                            </div>

                            {/* RUTA DEL FICHAJE */}
                            <div className="flex items-center justify-around gap-2 md:gap-12 w-full md:flex-1 bg-black/40 py-3 px-6 rounded-sm border border-[#1a1a1a]">
                                <div className="text-center">
                                    <span className="block text-[8px] text-[#555] uppercase font-bold mb-1">Vendedor</span>
                                    <span className="text-sm md:text-base font-barlow-condensed text-gray-400 uppercase tracking-wider">
                                        {tras.vendedor}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <span className="text-[#27ae60] font-bebas text-4xl leading-none">→</span>
                                </div>

                                <div className="text-center">
                                    <span className="block text-[8px] text-[#555] uppercase font-bold mb-1">Comprador</span>
                                    <span className="text-sm md:text-base font-barlow-condensed text-white font-bold uppercase tracking-wider">
                                        {tras.comprador}
                                    </span>
                                </div>
                            </div>

                            {/* VALOR DE OPERACIÓN */}
                            <div className="w-full md:w-1/4 text-center md:text-right">
                                <div className="text-[9px] text-[#555] uppercase font-bold mb-1 tracking-widest italic">Monto Final</div>
                                <div className="font-bebas text-4xl text-[#27ae60] leading-none">
                                    ${tras.monto?.toLocaleString('es-AR')}
                                </div>
                                <div className="text-[10px] text-[#333] font-bold mt-2 font-mono">
                                    {tras.fecha?.toDate().toLocaleDateString('es-AR')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}