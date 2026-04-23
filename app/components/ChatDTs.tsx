"use client";
import { useState, useEffect, useRef } from "react";
import { db, auth } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";



interface Mensaje {
    id: string;
    text: string;
    dtName: string;
    role: string;
    nombreEquipo?: string;
    uid: string;
}

export default function ChatDTs() {

    const { userData } = useAuth(); // ← datos del usuario ya disponibles
    const [messages, setMessages] = useState<Mensaje[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const isVerified = auth.currentUser?.emailVerified;

    // Escuchar mensajes
    useEffect(() => {
        if (!auth.currentUser) return;
        const q = query(collection(db, "chat"), orderBy("timestamp", "asc"), limit(50));
        const unsub = onSnapshot(q,
            (snapshot) => {
                setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Mensaje)));
            },
            (error) => {
                console.warn("Chat bloqueado:", error.message);
            }
        );
        return () => unsub();
    }, []);

    // Scroll automático cuando llegan mensajes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !auth.currentUser || !userData) return;

        try {
            await addDoc(collection(db, "chat"), {
                text: newMessage.trim(),
                dtName: userData.nombre,
                role: (userData.rol || "usuario").toUpperCase(),
                nombreEquipo: userData.nombreEquipo || "",
                timestamp: serverTimestamp(),
                uid: auth.currentUser.uid,
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error al enviar:", error);
        }
    };

    return (
        <div className="flex flex-col h-[85vh] bg-[#111] border border-[#222] shadow-2xl">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className="flex flex-col mb-1">
                        <div className="flex items-center gap-2 leading-none">
                            <span className="font-bebas text-lg text-[#c9a84c] tracking-wide uppercase">
                                {msg.dtName}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded border ${msg.role === 'ADMIN'
                                    ? 'bg-red-600 border-red-500 text-white'
                                    : 'bg-white/5 border-white/10 text-gray-400'
                                }`}>
                                {msg.role}
                            </span>
                            {msg.nombreEquipo && (
                                <span className="text-[10px] text-gray-500 italic uppercase">
                                    | {msg.nombreEquipo}
                                </span>
                            )}
                        </div>
                        <p className="text-sm mt-1 text-gray-200">{msg.text}</p>
                    </div>
                ))}
            </div>

            {isVerified ? (
                <form onSubmit={sendMessage} className="p-4 bg-[#0a0a0a] border-t border-[#222] flex gap-2 items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        maxLength={300}
                        placeholder="Escribí un mensaje..."
                        className="flex-1 bg-[#111] border border-[#333] text-white px-4 py-2 text-sm focus:outline-none focus:border-[#c9a84c]"
                    />
                    <span className="text-[10px] text-gray-600 w-10 text-right">{newMessage.length}/300</span>
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-[#c9a84c] text-black font-bebas px-6 py-2 hover:bg-[#b08d35] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Enviar
                    </button>
                </form>
            ) : (
                <div className="p-4 bg-yellow-900/20 text-yellow-500 text-xs border border-yellow-500/30 flex items-center gap-2">
                    <span>⚠️ Verificá tu email para participar en el chat.</span>
                    <button
                        onClick={() => { if (auth.currentUser) sendEmailVerification(auth.currentUser); }}
                        className="underline hover:text-yellow-300 transition-colors"
                    >
                        Reenviar mail
                    </button>
                </div>
            )}
        </div>
    );
}