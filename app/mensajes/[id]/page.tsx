"use client";
import { useState, useEffect, useRef } from "react";
import { db, auth } from "@/src/lib/firebase";
import {
    collection, addDoc, query, orderBy, onSnapshot,
    Timestamp, serverTimestamp, doc, getDoc, writeBatch // Añadimos writeBatch y doc
} from "firebase/firestore";
import { useParams } from "next/navigation";
import { useAuth } from "@/src/lib/hooks/useAuht";

interface Mensaje {
    id: string;
    emisorId: string;
    texto: string;
    leido: boolean; // Importante añadirlo a la interfaz
    fecha: Timestamp;
}

export default function ChatPrivado() {
    const { id: chatId } = useParams();
    const { user } = useAuth();
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [nuevoMsg, setNuevoMsg] = useState("");
    const [nombreRival, setNombreRival] = useState("Chat Privado");
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Cargar nombre del rival y escuchar mensajes
    // 1. Cargar nombre del rival y escuchar mensajes con Scroll Reforzado
    useEffect(() => {
        if (!user || !chatId) return;

        const uids = (chatId as string).split("_");
        const rivalUid = uids.find(uid => uid !== user.uid);

        if (rivalUid) {
            getDoc(doc(db, "users", rivalUid)).then(snap => {
                if (snap.exists()) setNombreRival(snap.data().nombre);
            });
        }

        const q = query(
            collection(db, "chats_privados", chatId as string, "mensajes"),
            orderBy("fecha", "asc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const nuevosMensajes = snap.docs.map(d => ({ id: d.id, ...d.data() } as Mensaje));
            setMensajes(nuevosMensajes);

            // SCROLL REFORZADO: 
            // Ejecutamos uno inmediato y otro con un pequeño delay para asegurar 
            // que el DOM ya renderizó las burbujas nuevas.
            
 // Intento 2 (por si tarda el render)
        }, (err) => console.warn("Error permisos:", err));

        return () => unsub();
    }, [chatId, user]);

    // 2. LÓGICA PARA MARCAR COMO LEÍDO (NUEVO)
    useEffect(() => {
        if (mensajes.length === 0 || !user || !chatId) return;

        // Filtramos mensajes: que NO sean míos y que estén SIN LEER (false)
        const mensajesParaMarcar = mensajes.filter(
            (m) => m.emisorId !== user.uid && m.leido === false
        );

        if (mensajesParaMarcar.length > 0) {
            const marcarComoLeidos = async () => {
                const batch = writeBatch(db);

                mensajesParaMarcar.forEach((m) => {
                    const msgRef = doc(db, "chats_privados", chatId as string, "mensajes", m.id);
                    batch.update(msgRef, { leido: true });
                });

                try {
                    await batch.commit();
                    // Al actualizarse en Firestore, el TarjetaDT de tu rival 
                    // se enterará solo y quitará el globito.
                } catch (error) {
                    console.error("Error al marcar leídos:", error);
                }
            };
            marcarComoLeidos();
        }
    }, [mensajes, user?.uid, chatId]);

    // 3. Enviar mensaje (Mantenemos tu lógica pero aseguramos leido: false)
    const enviarMensaje = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoMsg.trim() || !user) return;

        const textoTemp = nuevoMsg;
        setNuevoMsg("");

        try {
            await addDoc(collection(db, "chats_privados", chatId as string, "mensajes"), {
                emisorId: user.uid,
                texto: textoTemp,
                leido: false, // Siempre nace sin leer para el rival
                fecha: serverTimestamp()
            });
        } catch (error) {
            console.error("Error al enviar:", error);
        }
    };

    return (
        <main className="flex flex-col h-[calc(100vh-80px)] bg-[#0a0a0a] text-white font-barlow-condensed">
            {/* CABECERA */}
            <div className="p-4 border-b border-[#222] bg-[#111] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#c9a84c] flex items-center justify-center font-bebas text-xl text-black">
                    {nombreRival[0]}
                </div>
                <div>
                    <h2 className="font-bebas text-2xl tracking-widest text-[#c9a84c] uppercase italic">{nombreRival}</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Conexión Segura Directa</p>
                </div>
            </div>

            {/* MENSAJES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {mensajes.map((m) => {
                    const esMio = m.emisorId === user?.uid;
                    return (
                        <div key={m.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] p-3 text-sm shadow-xl relative ${esMio
                                ? "bg-[#c9a84c] text-black font-bold border-r-4 border-white"
                                : "bg-[#1a1a1a] text-gray-200 border-l-4 border-[#c9a84c]"
                                }`}>
                                <p>{m.texto}</p>
                                <span className="text-[8px] opacity-50 block mt-1 text-right">
                                    {m.fecha?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} className="h-2" />
            </div>

            {/* INPUT */}
            <form onSubmit={enviarMensaje} className="p-4 bg-[#111] border-t border-[#222] flex gap-2">
                <input
                    type="text"
                    value={nuevoMsg}
                    onChange={(e) => setNuevoMsg(e.target.value)}
                    placeholder="Escribe un mensaje al DT..."
                    className="flex-1 bg-black border border-[#333] p-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-all text-white"
                />
                <button type="submit" className="bg-[#c9a84c] text-black font-bebas px-6 text-xl italic hover:bg-white transition-colors">
                    Enviar
                </button>
            </form>
        </main>
    );
}