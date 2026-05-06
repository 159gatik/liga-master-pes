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
                division: "A", // ← INYECTA AUTOMÁTICAMENTE LA DIVISIÓN
                texto: horario,
                timestamp: serverTimestamp()
            });
            alert("Horario actualizado correctamente");
        } catch (e) {
            alert("Error al guardar el horario");
        } finally {
            setCargando(false);
        }
    };


    return (
        <div className="bg-[#111] border-l-4 border-[#c9a84c] p-6 space-y-4 shadow-2xl relative overflow-hidden group">
            {/* Decoración sutil de fondo */}
            <div className="absolute top-0 right-0 p-2 opacity-5 font-bebas text-4xl select-none">SCHEDULE</div>

            <h4 className="font-bebas text-2xl text-[#c9a84c] uppercase italic tracking-tighter">
                Mi Disponibilidad <span className="text-white">/ Fecha {fechaActiva}</span>
            </h4>

            <textarea
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                placeholder="Ej: Lunes a Jueves después de las 20hs. Finde coordinar..."
                className="w-full bg-[#0a0a0a] border border-white/5 p-4 text-sm text-gray-300 h-24 outline-none focus:border-[#c9a84c]/50 transition-all font-barlow italic resize-none"
            />

            <button
                onClick={guardarHorario}
                disabled={cargando}
                className="w-full bg-[#c9a84c] text-black font-bebas text-xl py-3 uppercase hover:bg-white transition-all disabled:opacity-50 skew-x-[-15deg]"
            >
                <span className="inline-block skew-x-[15deg]">
                    {cargando ? "Procesando..." : "Subir mis horarios"}
                </span>
            </button>

            <p className="text-[9px] text-gray-600 uppercase tracking-[3px] font-bold text-center">
                Visible para todos los DTs de la División A
            </p>
        </div>
    );
}