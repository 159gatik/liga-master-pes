"use client";
import { useEffect, useState } from "react";
import { collection, where, limit, query, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import Image from "next/image";

// Definimos la interfaz para que TypeScript no tire error
interface Usuario {
    uid: string;
    nombre: string;
    nombreEquipo: string;
    escudo?: string;
    rol: string;
}

interface TarjetaDTProps {
    dt: Usuario;
    currentUserId: string;
    onContact: (uid: string) => void;
}

export default function TarjetaDT({ dt, currentUserId, onContact }: TarjetaDTProps) {
    const [hayMensajeNuevo, setHayMensajeNuevo] = useState(false);
    const [cargando, setCargando] = useState(!!currentUserId && !!dt.uid);

    useEffect(() => {
        // Si falta algún ID, no ejecutamos nada (ya cargando es false por el estado inicial)
        if (!currentUserId || !dt.uid) return;


        const chatId = currentUserId < dt.uid
            ? `${currentUserId}_${dt.uid}`
            : `${dt.uid}_${currentUserId}`;

        const q = query(
            collection(db, "chats_privados", chatId, "mensajes"),
            where("emisorId", "==", dt.uid),
            where("leido", "==", false),
            limit(1)
        );

        const unsub = onSnapshot(q, (snap) => {
            setHayMensajeNuevo(!snap.empty);
            setCargando(false);
        }, (err) => {
            console.warn(err);
            setCargando(false);
        });

        return () => unsub();
    }, [dt.uid, currentUserId]);

    return (
        <div className={`flex flex-col p-3 bg-black/40 border transition-all group relative overflow-hidden ${hayMensajeNuevo ? "border-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.1)]" : "border-[#222] hover:border-[#c9a84c]/50"
            }`}>

            {/* GLOBITO DE NOTIFICACIÓN ANIMADO */}
            {hayMensajeNuevo && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9a84c] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c9a84c]"></span>
                    </span>
                    <span className="text-[9px] text-[#c9a84c] font-black tracking-tighter uppercase animate-pulse">
                        Nuevo mensaje
                    </span>
                </div>
            )}

            <div className="flex items-center gap-3 mb-2">
                {/* Mini Escudo o Inicial */}
                <div className="relative w-8 h-8 bg-[#1a1a1a] border border-[#333] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {dt.escudo ? (
                        <Image src={dt.escudo} alt="Escudo" fill className="object-contain p-1" />
                    ) : (
                        <span className="text-[10px] font-bebas text-gray-500">{dt.nombre[0]}</span>
                    )}
                </div>

                <div className="flex flex-col overflow-hidden">
                    <span className="text-white font-bold text-sm uppercase truncate leading-tight">
                        {dt.nombre}
                    </span>
                    <span className="text-[#c9a84c] text-[9px] uppercase tracking-widest truncate italic">
                        {dt.nombreEquipo || 'Sin equipo'}
                    </span>
                </div>
            </div>

            <button
                onClick={() => onContact(dt.uid)}
                disabled={cargando}
                className={`text-[10px] font-bold py-1.5 px-2 uppercase transition-all duration-300 ${hayMensajeNuevo
                        ? "bg-white text-black hover:bg-[#c9a84c] animate-pulse"
                        : "bg-[#c9a84c] text-black hover:bg-white active:scale-95"
                    } ${cargando ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {cargando ? "Cargando..." : hayMensajeNuevo ? "Leer Mensaje" : "Enviar Privado"}
            </button>

            {/* Decoración sutil de fondo para el que tiene mensaje nuevo */}
            {hayMensajeNuevo && (
                <div className="absolute -bottom-1 -right-1 font-bebas text-4xl text-[#c9a84c] opacity-[0.05] pointer-events-none italic">
                    MSG
                </div>
            )}
        </div>
    );
}