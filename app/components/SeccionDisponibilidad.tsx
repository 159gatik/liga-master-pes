"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

interface Props {
    equipoId: string;
    nombreEquipo: string;
    fechaActiva: number;
}

export default function SeccionDisponibilidad({ equipoId, nombreEquipo, fechaActiva }: Props) {
    const [horario, setHorario] = useState("");
    const [cargando, setCargando] = useState(false);

    // ID único para que cada equipo tenga solo un horario por fecha
    const docId = `${equipoId}_fecha${fechaActiva}`;

    // Escuchar si ya cargó algo antes
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "disponibilidad", docId), (snap) => {
            if (snap.exists()) setHorario(snap.data().texto);
            else setHorario("");
        });
        return () => unsub();
    }, [docId]);

    const guardarHorario = async () => {
        if (!horario.trim()) return alert("Escribí algo primero");
        setCargando(true);
        try {
            await setDoc(doc(db, "disponibilidad", docId), {
                equipoId,
                nombreEquipo,
                fechaTorneo: fechaActiva,
                texto: horario,
                timestamp: serverTimestamp()
            });
            alert("Horario actualizado");
        } catch (e) {
            alert("Error al guardar");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="bg-[#111] border-l-2 border-[#c9a84c] p-4 space-y-3">
            <h4 className="font-bebas text-xl text-[#c9a84c] uppercase italic tracking-widest">
                Mi Disponibilidad - Fecha {fechaActiva}
            </h4>
            <textarea
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                placeholder="Ej: Lunes a Jueves después de las 20hs. Finde coordinar. Dejo mi Discord o Steam abajo: ..."
                className="w-full bg-[#0a0a0a] border border-[#222] p-2 text-xs text-white h-16 outline-none focus:border-[#c9a84c] transition-all"
            />
            <button
                onClick={guardarHorario}
                disabled={cargando}
                className="w-full bg-[#c9a84c] text-black font-bold text-[15px] py-2 uppercase hover:bg-white transition-all disabled:opacity-50"
            >
                {cargando ? "Guardando..." : "subir mis horarios"}
            </button>
        </div>
    );
}