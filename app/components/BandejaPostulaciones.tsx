"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import {
    collection, query, onSnapshot, orderBy, doc,
    deleteDoc, writeBatch, Timestamp
} from "firebase/firestore";

interface Postulacion {
    id: string;
    uid: string;
    nombre: string;
    equipoNombre: string;
    equipoId: string;
    discord: string;
    pais: string;
    experiencia: string;
    fecha: Timestamp;
    speedtestUrl: string;
    whatsapp: string;
    edad: number;
}

export default function BandejaPostulaciones() {
    const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);

    useEffect(() => {
        const q = query(collection(db, "postulaciones"), orderBy("fecha", "desc"));
        const unsub = onSnapshot(q, (snapshot) => {
            setPostulaciones(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Postulacion)));
        });
        return () => unsub();
    }, []);

    const aceptarDT = async (postu: Postulacion) => {
        // Verificación de seguridad de datos
        if (!postu.equipoId || !postu.uid || !postu.id) {
            return alert("Faltan datos críticos (ID de equipo o usuario) para procesar.");
        }

        const confirmar = confirm(`¿Vincular a ${postu.nombre} como DT de ${postu.equipoNombre}?`);
        if (!confirmar) return;

        try {
            const batch = writeBatch(db);

            // Referencias
            const userRef = doc(db, "users", postu.uid.trim());
            const equipoRef = doc(db, "equipos", postu.equipoId.trim());
            const postuRef = doc(db, "postulaciones", postu.id);

            // 1. Actualizar Usuario
            batch.update(userRef, {
                rol: "dt",
                equipoId: postu.equipoId,
                nombreEquipo: postu.equipoNombre,
                discord: postu.discord || "No provisto",
                whatsapp: postu.whatsapp || "No provisto"
            });

            // 2. Actualizar Equipo (Usamos dtUid que es el que usa tu base de datos)
            batch.update(equipoRef, {
                estado: "Ocupado",
                dt: postu.nombre,
                dtId: postu.uid, // Mantenemos dtId por compatibilidad
                dtUid: postu.uid  // Agregamos dtUid que vimos en tus capturas
            });

            // 3. Borrar Postulación procesada
            batch.delete(postuRef);

            // Ejecutar operación atómica
            await batch.commit();

            alert("¡DT Vinculado y equipo actualizado con éxito!");
        } catch (error: any) {
            console.error("Error detallado:", error);
            // Si el error es 'not-found', es que el documento en 'users' no existe con ese UID
            if (error.code === 'not-found') {
                alert("Error: No se encontró el documento del usuario o del equipo en la base de datos.");
            } else {
                alert(`Error al procesar: ${error.message}`);
            }
        }
    };

    const rechazar = async (id: string) => {
        if (confirm("¿Rechazar solicitud?")) {
            try {
                await deleteDoc(doc(db, "postulaciones", id));
            } catch (error) {
                console.error(error);
                alert("No se pudo eliminar la postulación.");
            }
        }
    };

    if (postulaciones.length === 0) return null;

    return (
        <div className="bg-[#111] border border-[#c9a84c] p-6 mb-10 shadow-2xl animate-in fade-in">
            <h3 className="font-bebas text-3xl text-white mb-6 italic uppercase tracking-widest border-b border-[#c9a84c]/20 pb-2">
                Postulaciones Pendientes
            </h3>
            <div className="space-y-4">
                {postulaciones.map((p) => (
                    <div key={p.id} className="bg-[#0a0a0a] border border-[#222] p-4 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-[#c9a84c]/30 transition-all gap-4">
                        <div className="text-left space-y-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <p className="text-[#c9a84c] font-bebas text-2xl uppercase italic leading-none">{p.nombre}</p>
                                <span className={`text-[9px] px-2 py-0.5 font-bold rounded-sm tracking-tighter ${p.experiencia === "SI"
                                    ? "bg-green-900/30 text-green-500 border border-green-800/50"
                                    : "bg-orange-900/30 text-orange-500 border border-orange-800/50"
                                    }`}>
                                    {p.experiencia === "SI" ? "CON EXPERIENCIA LM" : "SIN EXPERIENCIA LM"}
                                </span>
                            </div>

                            <p className="text-gray-400 text-xs uppercase tracking-widest">Club: <span className="text-white font-bold">{p.equipoNombre}</span></p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-[#555] font-mono uppercase mt-2">
                                <p>DISCORD: <span className="text-gray-300">{p.discord}</span></p>
                                <p>PAIS: <span className="text-gray-300">{p.pais}</span></p>
                                <p>WHATSAPP: <span className="text-gray-300">{p.whatsapp}</span></p>
                                <p>EDAD: <span className="text-gray-300">{p.edad}</span></p>
                                <p>SPEEDTEST: <a href={p.speedtestUrl} target="_blank" className="text-[#c9a84c] underline">VER TEST</a></p>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => rechazar(p.id)} className="flex-1 md:flex-none border border-red-900 text-red-600 px-4 py-2 font-bebas text-lg hover:bg-red-600 hover:text-white transition-all italic">
                                RECHAZAR
                            </button>
                            <button onClick={() => aceptarDT(p)} className="flex-1 md:flex-none bg-[#c9a84c] text-black px-6 py-2 font-bebas text-lg hover:bg-white transition-all italic">
                                ACEPTAR
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}