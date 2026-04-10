"use client";
import { useState, useEffect, useRef } from "react";
import { db, auth } from "@/src/lib/firebase";
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";


export default function ChatDTs({ equipoUsuario }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef(null);

    // 1. Escuchar mensajes (Mantenemos tu lógica de tiempo real)
    useEffect(() => {
        // 1. Si no hay usuario, ni siquiera intentamos conectar
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const q = query(collection(db, "chat"), orderBy("timestamp", "asc"), limit(50));

        // 2. Pasamos un tercer argumento al onSnapshot para manejar errores (como el de permisos)
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                setTimeout(() => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollTo({
                            top: scrollRef.current.scrollHeight,
                            behavior: "smooth"
                        });
                    }
                }, 100);
            },
            (error) => {
                // Esto atrapa el error "permission-denied" y evita que Next.js explote
                console.warn("Chat bloqueado: Falta verificación de email.");
            }
        );

        return () => unsubscribe();
    }, []);

    // 2. Función de envío corregida
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            // ENTRADA A LA COLECCIÓN USERS: Buscamos tus datos reales por UID
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;

            // Definimos Prioridades: Datos de Firestore > Props > Auth
            const rolFinal = (userData?.rol || equipoUsuario?.rol || "USUARIO").toUpperCase();
            const nombreFinal = userData?.nombre || equipoUsuario?.nombre || currentUser.displayName || "Usuario";
            const equipoFinal = userData?.nombreEquipo || equipoUsuario?.nombreEquipo || "";

            await addDoc(collection(db, "chat"), {
                text: newMessage,
                dtName: nombreFinal,
                role: rolFinal,
                nombreEquipo: equipoFinal,
                timestamp: serverTimestamp(),
                uid: currentUser.uid
            });

            setNewMessage("");
        } catch (error) {
            console.error("Error al verificar usuario o enviar:", error);
        }
    };

    const isVerified = auth.currentUser?.emailVerified
    return (
        <div className="flex flex-col h-[85vh] bg-[#111] border border-[#222] shadow-2xl">
            {/* HEADER */}
            <div className="p-4 border-b border-[#222] bg-[#0a0a0a] flex justify-between items-center">
                <h3 className="font-bebas text-2xl text-[#c9a84c] italic">Muro de DTs</h3>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">En vivo</span>
            </div>

            {/* MENSAJES */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className="flex flex-col mb-1">
                        <div className="flex items-center gap-2 leading-none">
                            <span className="font-bebas text-lg text-[#c9a84c] tracking-wide uppercase">
                                {msg.dtName}
                            </span>

                            {/* BADGE DE ROL */}
                            <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded border ${msg.role === 'ADMIN'
                                    ? 'bg-red-600 border-red-500 text-white'
                                    : 'bg-white/5 border-white/10 text-gray-400'
                                }`}>
                                {msg.role}
                            </span>

                            {/* NOMBRE DE EQUIPO AL LADO */}
                            {msg.nombreEquipo && (
                                <span className="text-[10px] text-gray-500 font-medium italic uppercase">
                                    | {msg.nombreEquipo}
                                </span>
                            )}
                        </div>

                        <p className="text-sm mt-1 text-gray-200">
                            {msg.text}
                        </p>
                    </div>
                ))}
            </div>

            {/* INPUT */}

            {isVerified ? ( 
            <form onSubmit={sendMessage} className="p-4 bg-[#0a0a0a] border-t border-[#222] flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-[#111] border border-[#333] text-white px-4 py-2 text-sm focus:outline-none focus:border-[#c9a84c]"
                />
                <button type="submit" className="bg-[#c9a84c] text-black font-bebas px-6 py-2 hover:bg-[#b08d35] transition-colors">
                    Enviar
                </button>
                </form>) : (<div className="p-4 bg-yellow-900/20 text-yellow-500 text-xs border border-yellow-500/30">
                    ⚠️ Debes verificar tu email para participar en el chat.
                    <button onClick={() => sendEmailVerification(auth.currentUser)} className="underline ml-2">
                        Reenviar mail
                    </button>
                </div>)}
        </div>
    );
}