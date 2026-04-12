"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import {
    collection, query, where, onSnapshot,
    doc, updateDoc, deleteDoc, orderBy,
    Timestamp
} from "firebase/firestore";


interface SolicitudFichaje {
    id: string;
    usuario: string;     // Nombre del equipo
    dtNombre: string;    // Nombre del DT
    texto: string;       // "Jugador - Ex Equipo"
    estado: "pendiente" | "aceptado";
    fecha: Timestamp;          // Timestamp de Firebase
    uid: string;
}

export default function BandejaMercadoLibre() {
    const [solicitudes, setSolicitudes] = useState<SolicitudFichaje[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, "pedidos_libres"),
            where("estado", "==", "pendiente"),
            orderBy("fecha", "asc")
        );
        return onSnapshot(q, (snap) => {
            setSolicitudes(snap.docs.map(d => ({ id: d.id, ...d.data() } as SolicitudFichaje)));
        });
    }, []);

    const aceptarFichaje = async (id: string) => {
        if (!confirm("¿Confirmar este fichaje como OFICIAL?")) return;
        try {
            await updateDoc(doc(db, "pedidos_libres", id), {
                estado: "aceptado",
                fechaAceptado: new Date()
            });
            // Nota: Aquí podrías agregar la lógica automática para meter el jugador 
            // a la plantilla del equipo si tuvieras los datos de media/pos.
        } catch (error) { console.error(error); }
    };

    const rechazarFichaje = async (id: string) => {
        if (!confirm("¿Rechazar solicitud? Se borrará de la lista.")) return;
        try {
            await deleteDoc(doc(db, "pedidos_libres", id));
        } catch (error) { console.error(error); }
    };

    return (
        <section className="bg-[#111] border border-[#222] p-6 shadow-2xl font-barlow-condensed">
            <h3 className="font-bebas text-3xl text-[#c9a84c] mb-6 italic uppercase tracking-widest">
                Solicitudes de Jugadores Libres
            </h3>

            <div className="space-y-4">
                {solicitudes.length === 0 && <p className="text-gray-500 italic uppercase text-xs">No hay solicitudes pendientes.</p>}

                {solicitudes.map((sol) => (
                    <div key={sol.id} className="bg-black border border-[#222] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex-1">
                            <p className="text-[#c9a84c] font-bold text-xs uppercase">{sol.usuario} (DT: {sol.dtNombre})</p>
                            <p className="text-white font-bebas text-3xl uppercase">{sol.texto}</p>
                            <p className="text-[10px] text-gray-600 italic">Recibido: {sol.fecha?.toDate().toLocaleTimeString()}</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => rechazarFichaje(sol.id)}
                                className="border border-red-600 text-red-600 px-4 py-2 font-bebas text-xl hover:bg-red-600 hover:text-white transition-all"
                            >
                                RECHAZAR
                            </button>
                            <button
                                onClick={() => aceptarFichaje(sol.id)}
                                className="bg-[#27ae60] text-white px-6 py-2 font-bebas text-xl hover:bg-white hover:text-[#27ae60] transition-all"
                            >
                                ACEPTAR FICHASJE
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}