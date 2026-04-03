"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, writeBatch } from "firebase/firestore";

export default function BandejaPostulaciones() {
    const [postulaciones, setPostulaciones] = useState([]);

    useEffect(() => {
        // Escuchamos la colección de postulaciones
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
            // Simplemente borramos el documento de la colección 'postulaciones'
            await deleteDoc(doc(db, "postulaciones", id));
            alert("Postulación rechazada y eliminada.");
        } catch (error) {
            console.error("Error al rechazar:", error);
            alert("No se pudo eliminar la postulación.");
        }
    };

    const aceptarDT = async (postu) => {
        const confirmar = confirm(`¿Aceptar a ${postu.nombreDT} como DT del ${postu.equipoNombre}?`);
        if (!confirmar) return;

        try {
            const batch = writeBatch(db);

            // 1. Cambiar el rol del usuario a 'dt' y asignarle el equipo
            const userRef = doc(db, "users", postu.uid);
            batch.update(userRef, {
                rol: "dt",
                equipoId: postu.equipoId,
                nombreEquipo: postu.equipoNombre
            });

            // 2. Cambiar el estado del equipo a 'Ocupado'
            const equipoRef = doc(db, "equipos", postu.equipoId);
            batch.update(equipoRef, {
                estado: "Ocupado",
                dt: postu.nombreDT
            });

            // 3. Borrar la postulación ya procesada
            const postuRef = doc(db, "postulaciones", postu.id);
            batch.delete(postuRef);

            await batch.commit();
            alert("¡Nuevo DT asignado correctamente!");
        } catch (error) {
            console.error("Error al aceptar DT:", error);
        }
    };

    if (postulaciones.length === 0) return null; // No mostramos nada si no hay gente esperando

    return (
        <div className="bg-[#111] border border-[#c9a84c] p-6 mb-10 shadow-2xl">
            <h3 className="font-bebas text-3xl text-white mb-4">Nuevas Solicitudes de Ingreso</h3>
            <div className="space-y-4">
                {postulaciones.map((p) => (
                    <div key={p.id} className="bg-[#0a0a0a] border border-[#222] p-4 flex justify-between items-center">
                        <div>
                            <p className="text-[#c9a84c] font-bold uppercase">{p.nombre}</p>
                            <p className="text-xs text-[#888]">Quiere dirigir al: <span className="text-white">{p.equipo}</span></p>
                        </div>
                        <div className="flex gap-2">
                            {/* BOTÓN RECHAZAR */}
                            <button
                                onClick={() => rechazarPostulacion(p.id, p.nombre)}
                                className="flex-1 md:flex-none border border-red-900/50 text-red-600 px-4 py-2 font-bebas text-lg hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest"
                            >
                                RECHAZAR
                            </button>
                            <button
                                onClick={() => aceptarDT(p)}
                                className="bg-[#c9a84c] text-black px-4 py-2 font-bebas text-lg hover:bg-white transition-all"
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