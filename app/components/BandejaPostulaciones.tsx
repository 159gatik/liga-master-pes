"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, writeBatch } from "firebase/firestore";

export default function BandejaPostulaciones() {
    const [postulaciones, setPostulaciones] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "postulaciones"), orderBy("fecha", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPostulaciones(docs);
        });
        return () => unsubscribe();
    }, []);

    const rechazarPostulacion = async (id: string, nombre: string) => {
        const confirmar = confirm(`¿Estás seguro de rechazar la postulación de ${nombre}?`);
        if (!confirmar) return;
        try {
            await deleteDoc(doc(db, "postulaciones", id));
            alert("Postulación rechazada.");
        } catch (error) {
            console.error("Error al rechazar:", error);
        }
    };

    const aceptarDT = async (postu) => {
        if (!postu.equipoId || !postu.uid) {
            console.error("DATOS INCOMPLETOS:", postu);
            alert("Error: Datos insuficientes. Rechaza esta solicitud y pide que se postulen de nuevo.");
            return;
        }

        const confirmar = confirm(`¿Aceptar a ${postu.nombreDT || postu.nombre} como DT?`);
        if (!confirmar) return;

        try {
            const batch = writeBatch(db);
            const userRef = doc(db, "users", postu.uid);
            const equipoRef = doc(db, "equipos", postu.equipoId);

            batch.update(userRef, {
                rol: "dt",
                equipoId: postu.equipoId,
                nombreEquipo: postu.equipoNombre || postu.equipo || "Sin Nombre"
            });

            batch.update(equipoRef, {
                estado: "Ocupado",
                dt: postu.nombreDT || postu.nombre
            });

            batch.delete(doc(db, "postulaciones", postu.id));

            await batch.commit();
            alert("¡Equipo asignado con éxito!");
        } catch (error) {
            console.error("Error en el Batch:", error);
            alert("Error: " + error.message);
        }
    };

    if (postulaciones.length === 0) return null;

    return (
        <div className="bg-[#111] border border-[#c9a84c] p-6 mb-10 shadow-2xl">
            <h3 className="font-bebas text-3xl text-white mb-4 italic tracking-widest uppercase">Nuevas Solicitudes de Ingreso</h3>
            <div className="space-y-4">
                {postulaciones.map((p) => (
                    <div key={p.id} className="bg-[#0a0a0a] border border-[#222] p-4 flex justify-between items-center hover:border-[#333] transition-all">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <p className="text-[#c9a84c] font-bold uppercase text-lg leading-none">
                                    {p.nombreDT || p.nombre || "Usuario"}
                                </p>
                                {/* BADGE DE EXPERIENCIA */}
                                <span className={`text-[9px] px-2 py-0.5 font-bold rounded-sm uppercase tracking-tighter ${p.experiencia === "SI"
                                    ? "bg-green-900/30 text-green-500 border border-green-900/50"
                                    : "bg-yellow-900/30 text-yellow-500 border border-yellow-900/50"
                                    }`}>
                                    {p.experiencia === "SI" ? "CON EXPERIENCIA" : "NUEVO"}
                                </span>
                            </div>

                            <p className="text-[11px] text-[#888] font-barlow-condensed tracking-widest uppercase leading-none">
                                Quiere dirigir al: <span className="text-white font-bold">{p.equipoNombre || p.equipo || "Sin definir"}</span>
                            </p>

                            {/* EXTRA: Info de contacto rápida */}
                            <p className="text-[10px] text-[#555] font-mono">
                                Discord: {p.discord || "N/A"} | País: {p.pais || "N/A"}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => rechazarPostulacion(p.id, p.nombreDT || p.nombre)}
                                className="border border-red-900/50 text-red-600 px-4 py-2 font-bebas text-lg hover:bg-red-600 hover:text-white transition-all tracking-widest"
                            >
                                RECHAZAR
                            </button>
                            <button
                                onClick={() => aceptarDT(p)}
                                className="bg-[#c9a84c] text-black px-6 py-2 font-bebas text-lg hover:bg-white transition-all shadow-[0_0_15px_rgba(201,168,76,0.1)] tracking-widest"
                            >
                                ACEPTAR DT
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}