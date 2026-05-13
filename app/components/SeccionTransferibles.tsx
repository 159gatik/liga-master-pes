"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    collection, addDoc, query, orderBy, onSnapshot,
    serverTimestamp, Timestamp, deleteDoc, doc
} from "firebase/firestore";
import { Alert, Toast } from "@/src/lib/alerts";

interface PostTransferible {
    id: string;
    equipo: string;
    dt: string;
    uid: string;
    jugadoresText: string;
    condicion: string; // "Dinero", "Intercambio", "Ambos"
    fecha: Timestamp;
}

interface Oferta {
    id: string;
    postId: string;
    equipoOfertante: string;
    dtOfertante: string;
    propuesta: string;
    fecha: Timestamp;
}

export default function SeccionTransferibles() {
    const { user, userData } = useAuth();
    const [posts, setPosts] = useState<PostTransferible[]>([]);
    const [ofertas, setOfertas] = useState<Oferta[]>([]);

    // Estados para el nuevo post
    const [showForm, setShowForm] = useState(false);
    const [jugadoresText, setJugadoresText] = useState("");
    const [condicion, setCondicion] = useState("Dinero");

    // Estado para nueva oferta
    const [ofertaTexto, setOfertaTexto] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const q = query(collection(db, "transferibles"), orderBy("fecha", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as PostTransferible)));
        });

        const qOf = query(collection(db, "ofertas_transferibles"), orderBy("fecha", "asc"));
        const unsubOf = onSnapshot(qOf, (snap) => {
            setOfertas(snap.docs.map(d => ({ id: d.id, ...d.data() } as Oferta)));
        });

        return () => { unsub(); unsubOf(); };
    }, []);

    const crearPost = async () => {
        if (!jugadoresText.trim()) return;
        try {
            await addDoc(collection(db, "transferibles"), {
                equipo: userData?.nombreEquipo || "Sin Equipo",
                dt: userData?.nombre || user?.displayName,
                uid: user?.uid,
                jugadoresText: jugadoresText.toUpperCase(),
                condicion,
                fecha: serverTimestamp()
            });
            setJugadoresText("");
            setShowForm(false);
            Toast.fire({ icon: 'success', title: 'Lista publicada' });
        } catch (e) { console.error(e); }
    };

    const enviarOferta = async (postId: string) => {
        const texto = ofertaTexto[postId];
        if (!texto?.trim()) return;

        try {
            await addDoc(collection(db, "ofertas_transferibles"), {
                postId,
                equipoOfertante: userData?.nombreEquipo || "Sin Equipo",
                dtOfertante: userData?.nombre || user?.displayName,
                uid: user?.uid,
                propuesta: texto,
                fecha: serverTimestamp()
            });
            setOfertaTexto({ ...ofertaTexto, [postId]: "" });
            Toast.fire({ icon: 'info', title: 'Oferta enviada' });
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* BOTÓN CREAR POST */}
            <div className="flex justify-between items-center">
                <h3 className="font-bebas text-4xl italic text-white uppercase">Lista de <span className="text-[#c9a84c]">Transferibles</span></h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#c9a84c] text-black px-6 py-2 font-bebas text-xl skew-x-[-15deg] hover:bg-white transition-all"
                >
                    <span className="inline-block skew-x-[15deg]">{showForm ? "CERRAR" : "PUBLICAR JUGADORES"}</span>
                </button>
            </div>

            {/* FORMULARIO POST */}
            {showForm && (
                <div className="bg-[#111] p-6 border border-[#c9a84c]/30 space-y-4">
                    <textarea
                        placeholder="EJ: MARTIN ODEGAARD: $30.000.000"
                        className="w-full bg-black border border-[#222] p-4 text-white font-barlow-condensed focus:border-[#c9a84c] outline-none"
                        rows={3}
                        value={jugadoresText}
                        onChange={(e) => setJugadoresText(e.target.value)}
                    />
                    <div className="flex gap-4 items-center">
                        <select
                            className="bg-black border border-[#222] p-2 text-[#c9a84c] font-bebas uppercase italic"
                            value={condicion}
                            onChange={(e) => setCondicion(e.target.value)}
                        >
                            <option value="Dinero">Solo Dinero</option>
                            <option value="Intercambio">Solo Intercambio</option>
                            <option value="Ambos">Dinero o Intercambio</option>
                        </select>
                        <button onClick={crearPost} className="bg-white text-black px-8 py-2 font-bebas text-xl uppercase italic">Publicar</button>
                    </div>
                </div>
            )}

            {/* FEED DE POSTS */}
            <div className="grid grid-cols-1 gap-6">
                {posts.map((post) => (
                    <div key={post.id} className="bg-[#0d0d0d] border border-[#222] overflow-hidden">
                        {/* CABECERA POST */}
                        <div className="bg-[#1a1a1a] p-4 flex justify-between items-center border-b border-white/5">
                            <div>
                                <p className="text-[#c9a84c] font-bebas text-2xl leading-none uppercase italic">{post.equipo}</p>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">DT: {post.dt}</p>
                            </div>
                            <span className="bg-[#c9a84c]/10 text-[#c9a84c] px-3 py-1 border border-[#c9a84c]/20 text-[10px] font-bold uppercase italic">
                                {post.condicion}
                            </span>
                        </div>

                        {/* CUERPO POST */}
                        <div className="p-6">
                            <p className="text-white font-bebas text-3xl tracking-wider leading-tight">
                                {post.jugadoresText}
                            </p>
                        </div>

                        {/* SECCIÓN COMENTARIOS / OFERTAS */}
                        <div className="bg-[#050505] p-4 space-y-4">
                            <p className="text-gray-600 text-[10px] uppercase font-bold border-b border-white/5 pb-2">Ofertas Recibidas</p>

                            {ofertas.filter(o => o.postId === post.id).map(oferta => (
                                <div key={oferta.id} className="bg-[#111] p-3 border-l-2 border-[#c9a84c]/50">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[#c9a84c] text-[10px] font-bold uppercase">{oferta.equipoOfertante}</span>
                                        <span className="text-[9px] text-gray-700 font-mono">{oferta.fecha?.toDate().toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm italic font-barlow-condensed leading-snug">
                                        {oferta.propuesta}
                                    </p>
                                </div>
                            ))}

                            {/* INPUT PARA COMENTAR/OFERTAR */}
                            <div className="flex gap-2 pt-2">
                                <input
                                    type="text"
                                    placeholder="Escribe tu oferta aquí..."
                                    className="flex-1 bg-black border border-[#222] p-2 text-xs text-white focus:border-[#c9a84c] outline-none"
                                    value={ofertaTexto[post.id] || ""}
                                    onChange={(e) => setOfertaTexto({ ...ofertaTexto, [post.id]: e.target.value })}
                                />
                                <button
                                    onClick={() => enviarOferta(post.id)}
                                    className="bg-[#222] hover:bg-[#c9a84c] hover:text-black text-white px-4 font-bebas text-sm transition-all"
                                >
                                    OFERTAR
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}