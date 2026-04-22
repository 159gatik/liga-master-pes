"use client";
import { useState, useEffect } from "react";
import ChatDTs from "../components/ChatDTs";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/hooks/useAuht";
import { db } from "@/src/lib/firebase";
import { collection, onSnapshot, query, orderBy, where, limit } from "firebase/firestore";
import TarjetaDT from "../components/TarjetaDT";
import ChatPrivadoFlotante from "../components/ChatPrivadoFlotante";

interface Usuario {
    uid: string;
    nombre: string;
    nombreEquipo: string;
    rol: string;
}

export default function ComunidadPage({ equipoUsuario }) {
    const { user } = useAuth();
    const router = useRouter();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [chatAbierto, setChatAbierto] = useState<string | null>(null);
    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("nombre", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            setUsuarios(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Usuario)));
        });
        return () => unsub();
    }, []);

    const contactarDT = (rivalUid: string) => {
        if (!user) return alert("Debes iniciar sesión");
        if (user.uid === rivalUid) return alert("No puedes chatear contigo mismo");
        const chatId = user.uid < rivalUid
            ? `${user.uid}_${rivalUid}`
            : `${rivalUid}_${user.uid}`;
        setChatAbierto(chatId);
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-10 font-barlow-condensed">
            <div className="max-w-7xl mx-auto mb-10 border-l-4 border-[#c9a84c] pl-6">
                <h1 className="font-bebas text-6xl italic text-white uppercase tracking-tighter">
                    Zona de <span className="text-[#c9a84c]">Comunidad</span>
                </h1>
                <p className="text-gray-500 uppercase tracking-[4px] text-xs">Foro General y Mensajería Directa</p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="space-y-6 lg:col-span-1">
                    <div className="bg-[#111] border border-[#222] p-6 border-t-2 border-t-[#c9a84c]">
                        <h2 className="font-bebas text-2xl text-[#c9a84c] mb-4 italic tracking-widest">REGLAS</h2>
                        <ul className="text-gray-400 text-xs space-y-3 italic leading-relaxed uppercase">
                            <li className="flex gap-2"><span className="text-[#c9a84c]">01.</span> Respeto mutuo en el foro.</li>
                            <li className="flex gap-2"><span className="text-[#c9a84c]">02.</span> Prohibido el spam de otros sitios.</li>
                            <li className="flex gap-2"><span className="text-[#c9a84c]">03.</span> Coordinar partidos por privado.</li>
                        </ul>
                    </div>

                    <div className="bg-[#111] border border-[#222] p-6">
                        <h2 className="font-bebas text-2xl text-white mb-4 italic tracking-widest">DIRECTORES TÉCNICOS</h2>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
                            {usuarios.filter(u => u.uid !== user?.uid).map((dt) => (
                                <TarjetaDT
                                    key={dt.uid}
                                    dt={dt}
                                    currentUserId={user?.uid || ""}
                                    onContact={contactarDT}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-[#111] border border-[#222] flex flex-col h-[700px]">
                    <div className="p-4 bg-[#1a1a1a] border-b border-[#222] flex justify-between items-center">
                        <h3 className="font-bebas text-2xl text-white italic tracking-widest">FORO GENERAL DE DTs</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">En Vivo</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <ChatDTs />
                        {chatAbierto && (
                            <ChatPrivadoFlotante
                                chatId={chatAbierto}
                                onCerrar={() => setChatAbierto(null)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}