"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    collection, addDoc, query, orderBy,
    onSnapshot, serverTimestamp, doc, getDoc,
    writeBatch, Timestamp
} from "firebase/firestore";

interface Mensaje {
    id: string;
    emisorId: string;
    texto: string;
    leido: boolean;
    fecha: Timestamp;
}

interface Props {
    chatId: string;
    onCerrar: () => void;
}

export default function ChatPrivadoFlotante({ chatId, onCerrar }: Props) {
    const { user } = useAuth();
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [nuevoMsg, setNuevoMsg] = useState("");
    const [nombreRival, setNombreRival] = useState("...");
    const [minimizado, setMinimizado] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Cargar nombre del rival
    useEffect(() => {
        if (!user || !chatId) return;
        const rivalUid = chatId.split("_").find(uid => uid !== user.uid);
        if (rivalUid) {
            getDoc(doc(db, "users", rivalUid)).then(snap => {
                if (snap.exists()) setNombreRival(snap.data().nombre);
            });
        }
    }, [chatId, user]);

    // Escuchar mensajes
    useEffect(() => {
        if (!chatId) return;
        const q = query(
            collection(db, "chats_privados", chatId, "mensajes"),
            orderBy("fecha", "asc")
        );
        const unsub = onSnapshot(q, (snap) => {
            setMensajes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Mensaje)));
        }, (err) => console.warn("Error:", err));
        return () => unsub();
    }, [chatId]);

    // Scroll automático
    useEffect(() => {
        if (!minimizado && scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [mensajes, minimizado]);

    // Marcar como leídos
    useEffect(() => {
        if (!user || !chatId || mensajes.length === 0) return;
        const noLeidos = mensajes.filter(m => m.emisorId !== user.uid && !m.leido);
        if (noLeidos.length === 0) return;
        const batch = writeBatch(db);
        noLeidos.forEach(m => {
            batch.update(doc(db, "chats_privados", chatId, "mensajes", m.id), { leido: true });
        });
        batch.commit().catch(console.error);
    }, [mensajes, user, chatId]);

    const enviarMensaje = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoMsg.trim() || !user || !chatId) return;
        const texto = nuevoMsg.trim();
        setNuevoMsg("");
        try {
            await addDoc(collection(db, "chats_privados", chatId, "mensajes"), {
                emisorId: user.uid,
                texto,
                leido: false,
                fecha: serverTimestamp(),
            });
        } catch (err) {
            console.error("Error al enviar:", err);
        }
    };

    const noLeidos = mensajes.filter(m => m.emisorId !== user?.uid && !m.leido).length;

    return (
        <div className="fixed bottom-0 right-6 z-50 w-80 flex flex-col shadow-2xl font-barlow-condensed">

            {/* HEADER — siempre visible */}
            <div
                className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border border-[#333] border-b-2 border-b-[#c9a84c] cursor-pointer select-none"
                onClick={() => setMinimizado(!minimizado)}
            >
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center font-bebas text-sm text-black">
                        {nombreRival[0]?.toUpperCase()}
                    </div>
                    <span className="font-bebas text-lg text-white tracking-widest uppercase">
                        {nombreRival}
                    </span>
                    {noLeidos > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {noLeidos}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setMinimizado(!minimizado); }}
                        className="text-gray-500 hover:text-white transition-colors text-lg leading-none pb-1"
                    >
                        {minimizado ? "▲" : "▼"}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onCerrar(); }}
                        className="text-gray-500 hover:text-red-400 transition-colors text-sm font-bold"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* BODY — se oculta si está minimizado */}
            {!minimizado && (
                <>
                    <div
                        ref={scrollRef}
                        className="h-80 overflow-y-auto bg-[#0f0f0f] p-3 space-y-3 no-scrollbar border-x border-[#333]"
                    >
                        {mensajes.length === 0 && (
                            <p className="text-center text-[#444] text-xs uppercase tracking-widest italic pt-10">
                                Iniciá la conversación
                            </p>
                        )}
                        {mensajes.map((m) => {
                            const esMio = m.emisorId === user?.uid;
                            return (
                                <div key={m.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] px-3 py-2 text-sm ${esMio
                                            ? "bg-[#c9a84c] text-black font-bold"
                                            : "bg-[#1a1a1a] text-gray-200 border-l-2 border-[#c9a84c]"
                                        }`}>
                                        <p className="leading-snug">{m.texto}</p>
                                        <span className="text-[8px] opacity-40 block mt-1 text-right">
                                            {m.fecha?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <form
                        onSubmit={enviarMensaje}
                        className="flex border border-t-0 border-[#333] bg-[#111]"
                    >
                        <input
                            type="text"
                            value={nuevoMsg}
                            onChange={(e) => setNuevoMsg(e.target.value)}
                            maxLength={300}
                            placeholder="Escribí un mensaje..."
                            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white focus:outline-none placeholder-[#444]"
                        />
                        <button
                            type="submit"
                            disabled={!nuevoMsg.trim()}
                            className="bg-[#c9a84c] text-black font-bebas px-4 text-lg hover:bg-white transition-colors disabled:opacity-30"
                        >
                            →
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}