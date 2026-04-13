"use client";
import { useState, useEffect } from "react";
import { db } from "../../src/lib/firebase"; // Ajustá la ruta a tu config
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    Timestamp,
    orderBy,
    writeBatch, increment, serverTimestamp
} from "firebase/firestore";

import { Alert } from "@/src/lib/alerts";


interface Solicitud {
    id: string;
    vendedor: string;
    vendedorId: string; // ID del documento del equipo vendedor
    comprador: string;
    compradorId: string; // ID del documento del equipo comprador
    jugador: string;
    jugadorId: string;  // ID del documento del jugador
    monto: number;
    estado: string;
    fecha?: Timestamp;
}

export default function SeccionAdminMercado() {
    const [pendientes, setPendientes] = useState<Solicitud[]>([]);
    const [procesando, setProcesando] = useState<string | null>(null);

    // 1. Escuchar solo las solicitudes "pendientes"
    useEffect(() => {
        const q = query(
            collection(db, "solicitudes_mercado"),
            where("estado", "==", "pendiente"),
            orderBy("fecha", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Solicitud[];
            setPendientes(data);
        });

        return () => unsubscribe();
    }, []);

    // 2. Función para Aprobar o Rechazar
    const gestionarSolicitud = async (solId: string, nuevoEstado: 'aprobado' | 'rechazado') => {
        setProcesando(solId);

        // Buscamos la solicitud completa en nuestro estado local
        const solicitud = pendientes.find(s => s.id === solId);
        if (!solicitud) return;

        try {
            if (nuevoEstado === 'rechazado') {
                await updateDoc(doc(db, "solicitudes_mercado", solId), { estado: 'rechazado' });
                return;
            }

            // --- INICIO DE OPERACIÓN AUTOMÁTICA ---
            const batch = writeBatch(db);

            // 1. Marcar solicitud como aprobada
            const solRef = doc(db, "solicitudes_mercado", solId);
            batch.update(solRef, {
                estado: 'aprobado',
                fechaValidacion: serverTimestamp()
            });

            // 2. Mover Dinero (incremento positivo y negativo)
            const compradorRef = doc(db, "equipos", solicitud.compradorId);
            const vendedorRef = doc(db, "equipos", solicitud.vendedorId);

            batch.update(compradorRef, { presupuesto: increment(-solicitud.monto) });
            batch.update(vendedorRef, { presupuesto: increment(solicitud.monto) });

            // 3. Transferencia de Jugador (Baja y Alta)
            // Referencia en la plantilla del que vende
            const refOrigen = doc(db, `equipos/${solicitud.vendedorId}/plantilla`, solicitud.jugadorId);
            // Referencia en la plantilla del que compra
            const refDestino = doc(db, `equipos/${solicitud.compradorId}/plantilla`, solicitud.jugadorId);

            // Clonamos el jugador al nuevo equipo y lo borramos del anterior
            // Nota: Aquí se asume que pasas los datos básicos, puedes expandir según tu DB
            batch.set(refDestino, {
                nombre: solicitud.jugador,
                id: solicitud.jugadorId,
                fechaFichaje: serverTimestamp()
            });

            batch.delete(refOrigen);

            // Ejecutar todos los cambios juntos
            await batch.commit();

        } catch (error) {
            console.error("Error en la validación automática:", error);
            Alert.fire({
                icon: 'warning',
                title: 'ERROR CRÍTICO',
                text: 'No se pudo realizar el traspaso.',
            });
        } finally {
            setProcesando(null);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
                <h3 className="font-bebas text-3xl text-[#c9a84c] tracking-widest uppercase">
                    Bandeja de Entrada Admin
                </h3>
                <span className="bg-[#c9a84c] text-black px-3 py-1 font-bebas text-sm">
                    {pendientes.length} Pendientes
                </span>
            </div>

            <div className="grid gap-4">
                {pendientes.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-[#1a1a1a]">
                        <p className="text-[#444] font-barlow-condensed uppercase tracking-[2px]">
                            No hay operaciones esperando validación
                        </p>
                    </div>
                ) : (
                    pendientes.map((sol) => (
                        <div
                            key={sol.id}
                            className="bg-[#111] border border-[#2a2a2a] p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#444] transition-all"
                        >
                            <div className="font-barlow-condensed flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] bg-[#222] text-[#888] px-2 py-0.5 rounded uppercase">Solicitud ID: {sol.id.slice(0, 5)}</span>
                                </div>
                                <p className="text-white text-2xl font-bold uppercase tracking-tight leading-none mb-1">
                                    {sol.jugador}
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-[#c9a84c] font-bold">{sol.vendedor}</span>
                                    <span className="text-[#444]">➔</span>
                                    <span className="text-[#c9a84c] font-bold">{sol.comprador}</span>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-[#27ae60] font-bebas text-3xl mb-2">
                                    ${sol.monto.toLocaleString()}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={procesando === sol.id}
                                        onClick={() => gestionarSolicitud(sol.id, 'rechazado')}
                                        className="border border-red-600 text-red-600 font-bold px-4 py-2 hover:bg-red-600 hover:text-white transition-all text-[10px] uppercase tracking-widest"
                                    >
                                        ❌ Rechazar
                                    </button>
                                    <button
                                        disabled={procesando === sol.id}
                                        onClick={() => gestionarSolicitud(sol.id, 'aprobado')} // La función ahora busca 'sol' por su ID
                                        className="..."
                                    >
                                        {procesando === sol.id ? "Procesando..." : "✅ Validar Fichaje"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <p className="text-[10px] text-[#444] italic text-center">
                * Al validar, la operación aparecerá como aprobada en el feed público de todos los usuarios.
            </p>
        </div>
        
        
    );

    
}