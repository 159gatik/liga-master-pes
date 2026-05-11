"use client";
import { useEffect, useState } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, where, limit, onSnapshot, orderBy } from "firebase/firestore";

export default function UsuariosActivos() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // IMPORTANTE: Asegúrate de que en Firebase el campo sea "estado" y el valor "online"
        const q = query(
            collection(db, "users"),
            where("estado", "==", "online"),
            limit(10)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            setUsuarios(docs);
            setLoading(false);
        }, (error) => {
            console.error("Error en Snapshot:", error);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    return (
        <aside className="w-full lg:w-72 bg-[#0d0d0d]/80 p-5 border border-white/5 backdrop-blur-md shadow-2xl">
            {/* Título con luz verde de actividad */}
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="relative flex h-3 w-3">
                    <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></div>
                    <div className="relative inline-flex h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                </div>
                <h3 className="font-bebas text-2xl text-white tracking-widest uppercase italic leading-none">
                    DTs <span className="text-[#c9a84c]">En Línea</span>
                </h3>
            </div>
            {/* Contador rápido */}
            {usuarios.length > 0 && (
                <div >
                    <p className="text-[9px] text-gray-500 uppercase tracking-[3px] font-bold">
                        Total Conectados: <span className="text-white">{usuarios.length}</span>
                    </p>
                </div>
            )}
        </aside>
    );
}