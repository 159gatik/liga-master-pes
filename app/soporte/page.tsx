"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    collection, addDoc, query, orderBy, onSnapshot,
    serverTimestamp, Timestamp, doc
} from "firebase/firestore";
import { Alert, Toast } from "@/src/lib/alerts";

interface Post {
    id: string;
    titulo: string;
    mensaje: string;
    autor: string;
    categoria: string;
    fecha: Timestamp;
}

interface Comentario {
    id: string;
    texto: string;
    autor: string;
    rol: string;
    fecha: Timestamp;
}

export default function SoportePage() {
    const { userData, user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [nuevoPost, setNuevoPost] = useState({ titulo: "", mensaje: "", categoria: "ERROR TÉCNICO" });
    const [postSeleccionado, setPostSeleccionado] = useState<Post | null>(null);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [enviando, setEnviando] = useState(false);
    const formularioRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const q = query(collection(db, "soporte_foro"), orderBy("fecha", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!postSeleccionado) return;
        const q = query(
            collection(db, "soporte_foro", postSeleccionado.id, "comentarios"),
            orderBy("fecha", "asc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setComentarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comentario)));
        });
        return () => unsubscribe();
    }, [postSeleccionado]);

    const crearTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return Alert.fire("Error", "Debes iniciar sesión", "error");
        setEnviando(true);
        try {
            await addDoc(collection(db, "soporte_foro"), {
                ...nuevoPost,
                autor: userData?.nombre || "Usuario",
                autorId: user.uid,
                fecha: serverTimestamp()
            });
            setNuevoPost({ titulo: "", mensaje: "", categoria: "ERROR TÉCNICO" });
            Toast.fire({ icon: 'success', title: 'Ticket publicado' });
        } catch (error) {
            Alert.fire("Error", "No se pudo publicar", "error");
        } finally {
            setEnviando(false);
        }
    };

    const enviarComentario = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoComentario.trim() || !postSeleccionado) return;
        try {
            await addDoc(collection(db, "soporte_foro", postSeleccionado.id, "comentarios"), {
                texto: nuevoComentario,
                autor: userData?.nombre || "Usuario",
                autorId: user?.uid,
                rol: userData?.rol || "dt",
                fecha: serverTimestamp()
            });
            setNuevoComentario("");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20 px-6">
            <div className="max-w-[1400px] mx-auto">

                {/* 1. CABECERA AGRESIVA */}
                <div className="relative mb-20 border-l-8 border-cyan-500 pl-8">
                    <div className="absolute -top-10 left-20 font-bebas text-[12vw] text-cyan-500/[0.03] pointer-events-none select-none uppercase italic leading-none">
                        Support
                    </div>
                    <h1 className="font-bebas text-7xl md:text-9xl italic uppercase leading-none tracking-tighter">
                        Soporte <span className="text-cyan-500">Comunitario</span>
                    </h1>
                    <p className="text-gray-500 font-barlow text-sm tracking-[10px] uppercase mt-4 block italic">
                        Foro Oficial de Ayuda · El Legado
                    </p>
                </div>

                {!postSeleccionado ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                        {/* LISTADO DE TEMAS (Lado Izquierdo) */}
                        <div className="lg:col-span-2 space-y-6">
                            <h4 className="font-bebas text-2xl text-gray-600 uppercase tracking-widest mb-8 flex items-center gap-4">
                                <span className="w-10 h-[1px] bg-gray-800"></span> Temas Recientes
                            </h4>

                            {posts.length > 0 ? posts.map(post => (
                                <div
                                    key={post.id}
                                    onClick={() => { setPostSeleccionado(post); window.scrollTo(0, 0); }}
                                    className="bg-[#111] border border-white/5 p-8 hover:bg-[#161616] hover:border-cyan-500/30 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="space-y-4">
                                            <span className="bg-cyan-600/10 text-cyan-500 text-[10px] font-bold px-3 py-1 uppercase tracking-widest border border-cyan-500/20">
                                                {post.categoria}
                                            </span>
                                            <h3 className="text-3xl md:text-4xl font-bebas uppercase italic group-hover:text-cyan-500 transition-colors leading-none">
                                                {post.titulo}
                                            </h3>
                                            <p className="text-gray-500 font-barlow italic text-lg leading-snug line-clamp-1 opacity-60">
                                                "{post.mensaje}"
                                            </p>
                                        </div>
                                        <div className="text-right flex flex-col justify-between h-full">
                                            <span className="font-bebas text-cyan-500 text-xl tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 italic">
                                                LEER MÁS +
                                            </span>
                                            <p className="text-gray-700 text-[10px] font-bold uppercase mt-10">
                                                POR {post.autor} · {post.fecha?.toDate().toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 border border-dashed border-white/5 text-center text-gray-700 font-bebas text-3xl italic uppercase">
                                    No hay consultas activas
                                </div>
                            )}
                        </div>

                        {/* FORMULARIO (Lado Derecho) */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#111] border-t-4 border-cyan-500 p-8 sticky top-32 shadow-2xl">
                                <h3 className="font-bebas text-3xl text-white mb-2 uppercase italic">Abrir Ticket</h3>
                                <p className="text-gray-500 text-xs mb-8 uppercase tracking-[3px]">Describe tu problema técnico</p>

                                <form onSubmit={crearTicket} className="space-y-6">
                                    <input
                                        required
                                        placeholder="TÍTULO DEL PROBLEMA"
                                        className="w-full bg-black border border-white/5 p-4 text-white font-bebas text-xl outline-none focus:border-cyan-500 transition-all uppercase italic"
                                        value={nuevoPost.titulo}
                                        onChange={(e) => setNuevoPost({ ...nuevoPost, titulo: e.target.value })}
                                    />
                                    <select
                                        className="w-full bg-black border border-white/5 p-4 text-cyan-500 font-bebas text-xl outline-none cursor-pointer focus:border-cyan-500 transition-all italic"
                                        value={nuevoPost.categoria}
                                        onChange={(e) => setNuevoPost({ ...nuevoPost, categoria: e.target.value })}
                                    >
                                        <option value="ERROR TÉCNICO">ERROR TÉCNICO</option>
                                        <option value="MERCADO / FICHAJES">MERCADO / FICHAJES</option>
                                        <option value="REGLAMENTO">REGLAMENTO</option>
                                        <option value="OTROS">OTROS</option>
                                    </select>
                                    <textarea
                                        required
                                        placeholder="DESCRIBE TU PROBLEMA DETALLADAMENTE..."
                                        className="w-full bg-black border border-white/5 p-4 text-gray-400 font-barlow italic text-lg outline-none focus:border-cyan-500 transition-all min-h-[150px] resize-none"
                                        value={nuevoPost.mensaje}
                                        onChange={(e) => setNuevoPost({ ...nuevoPost, mensaje: e.target.value })}
                                    />
                                    <button
                                        disabled={enviando}
                                        className="w-full bg-cyan-600 text-white font-bebas text-3xl py-4 hover:bg-white hover:text-black transition-all italic tracking-tighter disabled:opacity-50"
                                    >
                                        {enviando ? "PUBLICANDO..." : "LANZAR TICKET →"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* VISTA DE DETALLE (HILO) */
                    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
                        <button
                            onClick={() => setPostSeleccionado(null)}
                            className="group flex items-center gap-3 text-cyan-500 font-bebas text-2xl uppercase italic hover:text-white transition-all"
                        >
                            <span className="group-hover:-translate-x-2 transition-transform">←</span> Volver al listado
                        </button>

                        <div className="bg-[#111] p-10 md:p-16 border-l-8 border-cyan-500 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 font-bebas text-9xl italic pointer-events-none uppercase">HELP</div>
                            <span className="bg-cyan-600 text-white px-4 py-1 font-bebas text-xl italic uppercase shadow-xl tracking-widest">
                                {postSeleccionado.categoria}
                            </span>
                            <h2 className="text-5xl md:text-7xl font-bebas italic mt-8 text-white tracking-tighter uppercase leading-none">
                                {postSeleccionado.titulo}
                            </h2>
                            <p className="text-gray-400 mt-10 text-xl md:text-2xl leading-relaxed font-barlow italic border-l border-white/10 pl-8">
                                {postSeleccionado.mensaje}
                            </p>
                            <div className="mt-12 flex justify-between items-center text-[10px] font-bold uppercase tracking-[4px] text-gray-600 border-t border-white/5 pt-6">
                                <span>INICIADO POR: {postSeleccionado.autor}</span>
                                <span>{postSeleccionado.fecha?.toDate().toLocaleString()}</span>
                            </div>
                        </div>

                        {/* RESPUESTAS */}
                        <div className="space-y-6">
                            <h4 className="font-bebas text-3xl text-gray-500 uppercase italic tracking-widest border-b border-white/5 pb-4">
                                Respuestas del Staff y Comunidad
                            </h4>

                            {comentarios.map(com => (
                                <div key={com.id} className={`p-8 border-l-4 transition-all ${com.rol === 'admin' ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10 bg-[#0f0f0f]'}`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <span className={`font-bebas text-2xl italic tracking-tight ${com.rol === 'admin' ? 'text-cyan-500' : 'text-white'}`}>
                                                {com.autor}
                                            </span>
                                            {com.rol === 'admin' && (
                                                <span className="bg-cyan-600 text-[10px] text-white px-2 py-0.5 font-bold uppercase tracking-widest">STAFF</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-700 uppercase">{com.fecha?.toDate().toLocaleString()}</span>
                                    </div>
                                    <p className="text-lg md:text-xl text-gray-400 font-barlow italic leading-relaxed">
                                        "{com.texto}"
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* CAJA DE RESPUESTA */}
                        <div className="bg-[#111] p-10 border border-white/5 shadow-2xl">
                            <form onSubmit={enviarComentario} className="space-y-6">
                                <h4 className="font-bebas text-3xl text-white uppercase italic">Aportar al hilo</h4>
                                <textarea
                                    required
                                    value={nuevoComentario}
                                    onChange={(e) => setNuevoComentario(e.target.value)}
                                    className="w-full bg-black border border-white/10 p-6 text-xl text-white font-barlow italic outline-none focus:border-cyan-500 min-h-[150px] transition-all resize-none"
                                    placeholder="Escribe tu respuesta aquí..."
                                />
                                <div className="flex justify-end">
                                    <button className="bg-cyan-600 text-white font-bebas text-4xl px-16 py-4 hover:bg-white hover:text-black transition-all italic tracking-tighter uppercase">
                                        Responder →
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}