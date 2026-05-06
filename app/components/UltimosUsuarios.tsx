"use client";
import { useEffect, useState } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, where, limit, onSnapshot } from "firebase/firestore";

export default function UsuariosActivos() {
    const [usuarios, setUsuarios] = useState<any[]>([]);

    useEffect(() => {
        // Consultamos los usuarios cuyo estado sea 'online' o activos
        const q = query(
            collection(db, "users"),
            where("estado", "==", "online"), // Filtra por usuarios activos
            limit(5) // Aumenté un poco el límite para que se vea más concurrido
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setUsuarios(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => unsub();
    }, []);

    return (
        <aside className="w-full lg:w-72 bg-[#0d0d0d]/50 p-4 border border-white/5">
            {/* Título con luz verde de actividad */}
            <div className="flex items-center gap-3 mb-6">
                <div className="relative flex">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                    <div className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                </div>
                <h3 className="font-bebas text-xl text-white tracking-widest uppercase italic">
                    Usuarios <span className="text-[#c9a84c]">En Línea</span>
                </h3>
            </div>

            {/* Lista de nombres activos */}
            <div className="space-y-4">
                {usuarios.length > 0 ? (
                    usuarios.map((u) => (
                        <div
                            key={u.id}
                            className="flex justify-between items-center text-gray-400 font-barlow-condensed text-sm uppercase tracking-[2px] border-b border-[#1a1a1a] pb-2 group"
                        >
                            <span className="group-hover:text-white transition-colors">{u.nombre}</span>
                            <span className="text-[9px] text-green-500/50 italic font-bold">ACTIVO</span>
                        </div>
                    ))
                ) : (
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest italic">
                        No hay Dts conectados en este momento
                    </p>
                )}
            </div>
        </aside>
    );
}