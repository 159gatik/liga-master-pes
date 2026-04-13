"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { Alert, Toast } from "@/src/lib/alerts";

// Nuevo Editor compatible con React 19
import {
    Editor,
    EditorProvider,
    Toolbar,
    BtnBold,
    BtnItalic,
    BtnUnderline,
    BtnStrikeThrough,
    BtnLink,
    BtnNumberedList,
    BtnBulletList,
    BtnClearFormatting
} from 'react-simple-wysiwyg';

interface Noticia {
    id: string;
    titulo: string;
    categoria: string;
    contenido: string;
    autor: string;
    fecha: Timestamp;
}

export default function NoticiasPage() {
    const { userData, isAdmin } = useAuth();
    const [noticias, setNoticias] = useState<Noticia[]>([]);

    // Estados para el formulario
    const [titulo, setTitulo] = useState("");
    const [categoria, setCategoria] = useState("Comunicado");
    const [contenido, setContenido] = useState("");

    // Cargar noticias en tiempo real
    useEffect(() => {
        const q = query(collection(db, "novedades"), orderBy("fecha", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setNoticias(snap.docs.map(d => ({ id: d.id, ...d.data() } as Noticia)));
        });
        return () => unsub();
    }, []);

    const publicarNoticia = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!titulo.trim() || !contenido.trim() || contenido === '<p><br></p>') {
            return Alert.fire("Error", "Debes completar el título y el cuerpo de la noticia", "error");
        }

        try {
            await addDoc(collection(db, "novedades"), {
                titulo: titulo.trim(),
                categoria,
                contenido,
                autor: userData?.nombre || "Prensa Oficial",
                equipo: userData?.nombreEquipo || "Staff",
                fecha: serverTimestamp(),
            });

            // Limpiar campos
            setTitulo("");
            setContenido("");
            Toast.fire({ icon: 'success', title: 'Noticia lanzada al foro' });
        } catch (error) {
            console.error(error);
            Alert.fire("Error", "No se pudo publicar la noticia", "error");
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-barlow-condensed">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* CABECERA */}
                <div className="border-l-4 border-[#c9a84c] pl-6">
                    <h1 className="font-bebas text-7xl italic uppercase leading-none">
                        Prensa <span className="text-[#c9a84c]">Oficial</span>
                    </h1>
                    <p className="text-gray-500 tracking-[4px] uppercase italic text-sm">
                        El Legado PES 6 · Foro de Novedades y Comunicados
                    </p>
                </div>
                {/* FEED DE NOTICIAS */}
                <div className="space-y-10">
                    {noticias.length > 0 ? noticias.map((n) => (
                        <article key={n.id} className="bg-[#0f0f0f] border border-[#222] shadow-2xl animate-fadeIn group">
                            {/* Cabecera del Post */}
                            <div className="bg-[#1a1a1a] p-4 border-b border-[#222] flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="bg-[#c9a84c] text-black px-3 py-1 font-bold text-[10px] uppercase italic shadow-sm">
                                        {n.categoria}
                                    </span>
                                    <span className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">
                                        {n.fecha?.toDate().toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>

                            {/* Cuerpo del Post */}
                            <div className="p-10">
                                <h3 className="font-bebas text-6xl italic uppercase text-white mb-8 leading-none border-l-4 border-[#c9a84c] pl-6 tracking-tighter">
                                    {n.titulo}
                                </h3>

                                {/* Contenedor de contenido enriquecido */}
                                <div
                                    className="text-gray-300 text-xl md:text-2xl leading-relaxed noticia-format selection:bg-[#c9a84c]/20"
                                    dangerouslySetInnerHTML={{ __html: n.contenido }}
                                />
                            </div>

                            {/* Firma del Autor */}
                            <div className="bg-[#0a0a0a] p-5 border-t border-[#1a1a1a] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#222] border border-[#c9a84c]/30 text-[#c9a84c] flex items-center justify-center font-bebas italic text-3xl group-hover:bg-[#c9a84c] group-hover:text-black transition-all">
                                        {n.autor.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-600 uppercase tracking-[3px] leading-none mb-1">Publicado por</p>
                                        <p className="text-xl text-white font-bold uppercase italic leading-none tracking-tighter">
                                            {n.autor}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    )) : (
                        <div className="p-20 text-center">
                            <p className="font-bebas text-4xl text-gray-800 uppercase italic tracking-widest animate-pulse">
                                Esperando novedades oficiales...
                            </p>
                        </div>
                    )}
                </div>
                {/* EDITOR ESTILO FORO (Solo para Admin o DT) */}
                {(isAdmin || userData?.rol === "dt") ? (
                    <section className="bg-[#111] border-t-4 border-[#c9a84c] p-8 shadow-2xl animate-fadeIn">
                        <h2 className="font-bebas text-3xl text-white italic uppercase mb-6 tracking-widest text-[#c9a84c]">
                            Redactar Nueva Noticia
                        </h2>

                        <form onSubmit={publicarNoticia} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Título de la noticia..."
                                    className="bg-black border border-[#333] p-3 outline-none focus:border-[#c9a84c] text-white font-bold uppercase italic"
                                    value={titulo}
                                    onChange={e => setTitulo(e.target.value)}
                                />
                                <select
                                    className="bg-black border border-[#333] p-3 text-[#c9a84c] font-bold uppercase italic outline-none cursor-pointer"
                                    value={categoria}
                                    onChange={e => setCategoria(e.target.value)}
                                >
                                    <option value="Fichaje">Fichaje</option>
                                    <option value="Comunicado">Comunicado Oficial</option>
                                    <option value="Sancion">Sanción Disciplinaria</option>
                                    <option value="Torneo">Información Torneo</option>
                                </select>
                            </div>

                            {/* NUEVO EDITOR COMPATIBLE */}
                            <div className="bg-[#050505] border border-[#333] min-h-[300px] text-white overflow-hidden">
                                <EditorProvider>
                                    <Editor
                                        value={contenido}
                                        onChange={(e) => setContenido(e.target.value)}
                                        placeholder="Escribe el contenido aquí (puedes usar negritas, listas y links)..."
                                        containerProps={{
                                            style: {
                                                height: '350px',
                                                backgroundColor: '#050505',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '10px'
                                            }
                                        }}
                                    >
                                        <Toolbar>
                                            <BtnBold />
                                            <BtnItalic />
                                            <BtnUnderline />
                                            <BtnStrikeThrough />
                                            <BtnLink />
                                            <BtnNumberedList />
                                            <BtnBulletList />
                                            <BtnClearFormatting />
                                        </Toolbar>
                                    </Editor>
                                </EditorProvider>
                            </div>

                            <button type="submit" className="w-full bg-[#c9a84c] text-black font-bebas text-4xl py-3 hover:bg-white transition-all uppercase italic tracking-tighter shadow-lg">
                                Lanzar Noticia al Foro
                            </button>
                        </form>
                    </section>
                ) : (
                    <div className="bg-[#111] p-6 border border-dashed border-[#222] text-center">
                        <p className="text-gray-600 text-sm uppercase tracking-[4px] italic">
                            Acceso de redacción restringido a Directores Técnicos y Staff.
                        </p>
                    </div>
                )}

                
            </div>
        </main>
    );
}