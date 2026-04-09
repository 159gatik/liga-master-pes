"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    collection, addDoc, query, orderBy, onSnapshot,
    serverTimestamp, Timestamp, doc
} from "firebase/firestore";

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

export default function Soporte() {
    const { userData, user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [nuevoPost, setNuevoPost] = useState({ titulo: "", mensaje: "", categoria: "ERROR TÉCNICO" });
    const [postSeleccionado, setPostSeleccionado] = useState<Post | null>(null);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [nuevoComentario, setNuevoComentario] = useState("");

    // 1. Escuchar los temas del foro
    useEffect(() => {
        const q = query(collection(db, "soporte_foro"), orderBy("fecha", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
        });
        return () => unsubscribe();
    }, []);

    // 2. Escuchar comentarios cuando se selecciona un post
    useEffect(() => {
        if (!postSeleccionado) return;

        const q = query(
            collection(db, "soporte_foro", postSeleccionado.id, "comentarios"),
            orderBy("fecha", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Comentario[];

            setComentarios(data);
        });
        return () => unsubscribe();
    }, [postSeleccionado]);

    const crearTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("Debes estar logueado");

        await addDoc(collection(db, "soporte_foro"), {
            ...nuevoPost,
            autor: userData?.nombre,
            autorId: user.uid,
            fecha: serverTimestamp()
        });
        setNuevoPost({ titulo: "", mensaje: "", categoria: "ERROR TÉCNICO" });
    };

    const enviarComentario = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoComentario.trim() || !postSeleccionado) return;

        await addDoc(collection(db, "soporte_foro", postSeleccionado.id, "comentarios"), {
            texto: nuevoComentario,
            autor: userData?.nombre,
            autorId: user?.uid,
            rol: userData?.rol || "dt",
            fecha: serverTimestamp()
        });
        setNuevoComentario("");
    };

    

    return (
        <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-10 font-barlow-condensed text-white">
            <div className="max-w-5xl mx-auto space-y-10">

                {/* CABECERA */}
                <div className="border-l-4 border-[#c9a84c] pl-6">
                    <h1 className="font-bebas text-6xl italic tracking-tighter uppercase">
                        Soporte <span className="text-[#c9a84c]">Comunitario</span>
                    </h1>
                    <p className="text-gray-500 uppercase tracking-[3px] text-xs italic">Foro Oficial de Ayuda · El Legado</p>
                </div>

                {!postSeleccionado ? (
                    <>
                        {/* FORMULARIO DE CREACIÓN (Solo se ve en el listado) */}
                        <div className="bg-[#111] border border-[#222] p-6 shadow-xl">
                            <h3 className="font-bebas text-2xl text-[#c9a84c] mb-4 uppercase italic">¿Tienes un problema?</h3>
                            <form onSubmit={crearTicket} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        required
                                        placeholder="Título de tu duda..."
                                        className="bg-[#0a0a0a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c]"
                                        value={nuevoPost.titulo}
                                        onChange={(e) => setNuevoPost({ ...nuevoPost, titulo: e.target.value })}
                                    />
                                    <select
                                        className="bg-[#0a0a0a] border border-[#333] p-3 text-[#c9a84c] font-bold outline-none cursor-pointer"
                                        value={nuevoPost.categoria}
                                        onChange={(e) => setNuevoPost({ ...nuevoPost, categoria: e.target.value })}
                                    >
                                        <option value="ERROR TÉCNICO">ERROR TÉCNICO</option>
                                        <option value="MERCADO / FICHAJES">MERCADO / FICHAJES</option>
                                        <option value="REGLAMENTO">REGLAMENTO</option>
                                        <option value="OTROS">OTROS</option>
                                    </select>
                                </div>
                                <textarea
                                    required
                                    placeholder="Explica detalladamente tu problema..."
                                    className="w-full bg-[#0a0a0a] border border-[#333] p-3 text-gray-400 min-h-[100px] outline-none focus:border-[#c9a84c]"
                                    value={nuevoPost.mensaje}
                                    onChange={(e) => setNuevoPost({ ...nuevoPost, mensaje: e.target.value })}
                                />
                                <button className="bg-[#c9a84c] text-black font-bebas text-2xl px-10 py-2 hover:bg-white transition-all uppercase">
                                    Publicar Tema
                                </button>
                            </form>
                        </div>

                        {/* LISTADO DE TEMAS */}
                        <div className="space-y-4">
                            <h4 className="text-[#888] uppercase tracking-[4px] text-sm font-bold border-b border-[#222] pb-2">Temas Recientes</h4>
                            {posts.map(post => (
                                <div
                                    key={post.id}
                                    onClick={() => setPostSeleccionado(post)}
                                    className="bg-[#0f0f0f] border border-[#222] p-5 hover:border-[#c9a84c]/50 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] bg-[#222] text-[#c9a84c] px-2 py-1 font-bold uppercase tracking-widest">
                                                {post.categoria}
                                            </span>
                                            <h3 className="text-xl text-white font-bold uppercase mt-2 group-hover:text-[#c9a84c] transition-colors">
                                                {post.titulo}
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-1 line-clamp-2 italic">Por {post.autor}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[#c9a84c] font-bebas tracking-widest uppercase text-xs group-hover:mr-2 transition-all">Ver hilo →</span>
                                            <p className="text-gray-600 text-[10px] uppercase mt-2">{post.fecha?.toDate().toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* VISTA DE DETALLE Y COMENTARIOS */
                    <div className="space-y-6 animate-fadeIn">
                        <button
                            onClick={() => setPostSeleccionado(null)}
                            className="text-[#c9a84c] uppercase text-xs font-bold hover:text-white transition-colors"
                        >
                            ← Volver al listado
                        </button>

                        <div className="bg-[#111] p-8 border-l-4 border-[#c9a84c] shadow-2xl">
                            <span className="text-[10px] bg-[#c9a84c] text-black px-2 py-0.5 font-bold uppercase">{postSeleccionado.categoria}</span>
                            <h2 className="text-4xl font-bebas italic mt-3 text-white tracking-wider">{postSeleccionado.titulo}</h2>
                            <p className="text-gray-300 mt-6 text-lg leading-relaxed">{postSeleccionado.mensaje}</p>
                            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center">
                                <p className="text-[10px] text-gray-500 uppercase font-bold italic">Iniciado por <span className="text-white">{postSeleccionado.autor}</span></p>
                                <p className="text-[10px] text-gray-500 uppercase">{postSeleccionado.fecha?.toDate().toLocaleString()}</p>
                            </div>
                        </div>

                        {/* RESPUESTAS */}
                        <div className="space-y-4 ml-0 md:ml-10">
                            <h4 className="text-xs uppercase tracking-[3px] text-gray-500 font-bold border-b border-[#222] pb-2">Respuestas de la comunidad</h4>
                            {comentarios.length === 0 && <p className="text-gray-600 italic text-sm">No hay respuestas aún. ¡Sé el primero en ayudar!</p>}

                            {comentarios.map(com => (
                                <div key={com.id} className={`p-5 border ${com.rol === 'admin' ? 'border-[#c9a84c] bg-[#c9a84c]/5' : 'border-[#222] bg-[#0d0d0d]'}`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${com.rol === 'admin' ? 'text-[#c9a84c]' : 'text-gray-400'}`}>
                                            {com.autor} {com.rol === 'admin' && <span className="ml-2 bg-[#c9a84c] text-black px-1">STAFF</span>}
                                        </span>
                                        <span className="text-[9px] text-gray-600 uppercase font-mono">{com.fecha?.toDate().toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed">{com.texto}</p>
                                </div>
                            ))}
                        </div>

                        {/* CAJA DE RESPUESTA */}
                        <form onSubmit={enviarComentario} className="mt-12 bg-[#111] p-6 border border-[#222] shadow-xl">
                            <label className="text-[10px] text-[#c9a84c] uppercase font-bold mb-3 block tracking-[2px]">Publicar respuesta</label>
                            <textarea
                                required
                                value={nuevoComentario}
                                onChange={(e) => setNuevoComentario(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#333] p-4 text-sm text-white outline-none focus:border-[#c9a84c] min-h-[100px] transition-all"
                                placeholder="Escribe tu mensaje aquí..."
                            />
                            <div className="flex justify-end mt-4">
                                <button className="bg-[#c9a84c] text-black font-bebas text-xl px-12 py-2 hover:bg-white transition-all uppercase">
                                    Enviar Respuesta
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}