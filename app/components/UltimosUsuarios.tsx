"use client";
import { useEffect, useState } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function UltimosUsuarios() {
    const [usuarios, setUsuarios] = useState<any[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, "users"),
            orderBy("fechaRegistro", "desc"),
            limit(3)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setUsuarios(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => unsub();
    }, []);

    return (
        <aside className="w-full lg:w-72">
            {/* Título con luz verde */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                <h3 className="font-bebas text-xl text-white tracking-widest uppercase">
                    Últimos Usuarios
                </h3>
            </div>

            {/* Lista solo de nombres */}
            <div className="space-y-3">
                {usuarios.map((u) => (
                    <div key={u.id} className="text-gray-400 font-barlow-condensed text-sm uppercase tracking-wider hover:text-[#c9a84c] transition-colors cursor-default border-b border-[#1a1a1a] pb-2">
                        {u.nombre}
                    </div>
                ))}
            </div>
        </aside>
    );
}