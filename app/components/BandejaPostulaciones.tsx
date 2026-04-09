"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, writeBatch, Timestamp } from "firebase/firestore";

// 1. Definimos la interfaz para la Postulación (Actualizada con experiencia)
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
        if (!postu.equipoId || !postu.uid) return alert("Datos insuficientes.");
        const confirmar = confirm(`¿Vincular a ${postu.nombre} como DT de ${postu.equipoNombre}?`);
        if (!confirmar) return;

        try {
            const batch = writeBatch(db);
            const userRef = doc(db, "users", postu.uid);
            const equipoRef = doc(db, "equipos", postu.equipoId);

            batch.update(userRef, {
                rol: "dt",
                equipoId: postu.equipoId,
                nombreEquipo: postu.equipoNombre,
                discord: postu.discord || "No provisto"
            });

            batch.update(equipoRef, {
                estado: "Ocupado",
                dt: postu.nombre,
                dtUid: postu.uid
            });

            batch.delete(doc(db, "postulaciones", postu.id));
            await batch.commit();
            alert("¡DT Vinculado con éxito!");
        } catch (error) {
            console.error(error);
            alert("Error al procesar.");
        }
    };

    const rechazar = async (id: string) => {
        if (confirm("¿Rechazar solicitud?")) await deleteDoc(doc(db, "postulaciones", id));
    };

    if (postulaciones.length === 0) return null;

    return (
        <div className="bg-[#111] border border-[#c9a84c] p-6 mb-10 shadow-2xl">
            <h3 className="font-bebas text-3xl text-white mb-6 italic uppercase tracking-widest text-left border-b border-[#c9a84c]/20 pb-2">
                Postulaciones Pendientes
            </h3>
            <div className="space-y-4">
                {postulaciones.map((p) => (
                    <div key={p.id} className="bg-[#0a0a0a] border border-[#222] p-4 flex justify-between items-center group hover:border-[#c9a84c]/30 transition-all">
                        <div className="text-left space-y-1">
                            <div className="flex items-center gap-3">
                                <p className="text-[#c9a84c] font-bebas text-2xl uppercase italic">{p.nombre}</p>

                                {/* BADGE DE EXPERIENCIA LIGAMASTER ONLINE */}
                                <span className={`text-[9px] px-2 py-0.5 font-bold rounded-sm tracking-tighter ${p.experiencia === "SI"
                                    ? "bg-green-900/30 text-green-500 border border-green-800/50"
                                    : "bg-orange-900/30 text-orange-500 border border-orange-800/50"
                                    }`}>
                                    {p.experiencia === "SI" ? "CON EXPERIENCIA LM" : "SIN EXPERIENCIA LM"}
                                </span>
                            </div>

                            <p className="text-gray-500 text-xs uppercase tracking-widest">Club: <span className="text-white font-bold">{p.equipoNombre}</span></p>
                            <p className="text-[10px] text-[#444] font-mono uppercase">
                                DISCORD: <span className="text-gray-300">{p.discord}</span> | PAIS: <span className="text-gray-300">{p.pais}</span>
                            </p>
                            <p className="text-[10px] text-[#444] font-mono uppercase">
                                TEST INTERNET: <span className="text-gray-300">{p.speedtestUrl}</span>
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => rechazar(p.id)} className="border border-red-900 text-red-600 px-4 py-1 font-bebas text-lg hover:bg-red-600 hover:text-white transition-all italic">
                                RECHAZAR
                            </button>
                            <button onClick={() => aceptarDT(p)} className="bg-[#c9a84c] text-black px-6 py-1 font-bebas text-lg hover:bg-white transition-all italic shadow-[0_0_15px_rgba(201,168,76,0.1)]">
                                ACEPTAR
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}