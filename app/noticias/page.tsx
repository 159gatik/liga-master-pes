"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    collection, query, orderBy, onSnapshot, addDoc,
    serverTimestamp, Timestamp, doc, deleteDoc, runTransaction
} from "firebase/firestore"; // 1. Importamos doc y deleteDoc
import { Alert, Toast } from "@/src/lib/alerts";

// Editor compatible con React 19
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
    reacciones?: { [key: string]: number };
    userReactions?: { [key: string]: string };
}

export default function NoticiasPage() {
    const { userData, isAdmin, user } = useAuth();
    const [noticias, setNoticias] = useState<Noticia[]>([]);
    const formularioRef = useRef<HTMLDivElement>(null);

    const [titulo, setTitulo] = useState("");
    const [categoria, setCategoria] = useState("Comunicado");
    const [contenido, setContenido] = useState("");

    useEffect(() => {
        const q = query(collection(db, "novedades"), orderBy("fecha", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setNoticias(snap.docs.map(d => ({ id: d.id, ...d.data() } as Noticia)));
        });
        return () => unsub();
    }, []);

    const scrollToEditor = () => {
        formularioRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 2. FUNCIÓN PARA ELIMINAR NOTICIA
    const borrarNoticia = async (id: string) => {
        const confirmacion = await Alert.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará la noticia permanentemente del foro.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#c9a84c",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (confirmacion.isConfirmed) {
            try {
                await deleteDoc(doc(db, "novedades", id));
                Toast.fire({ icon: 'success', title: 'Noticia eliminada correctamente' });
            } catch (error) {
                console.error(error);
                Alert.fire("Error", "No se pudo eliminar la noticia", "error");
            }
        }
    };

    const publicarNoticia = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titulo.trim() || !contenido.trim() || contenido === '<p><br></p>') {
            return Alert.fire("Error", "Debes completar el título y el cuerpo", "error");
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

            setTitulo("");
            setContenido("");
            Toast.fire({ icon: 'success', title: 'Noticia lanzada al foro' });
        } catch (error) {
            console.error(error);
            Alert.fire("Error", "No se pudo publicar la noticia", "error");
        }
    };
    const reaccionarANoticia = async (noticiaId: string, emoji: string) => {
        // 1. Verificamos si el usuario está logueado
        if (!user) {
            return Alert.fire({
                title: "¡Atención!",
                text: "Debes iniciar sesión para poder reaccionar a las noticias.",
                icon: "info",
                confirmButtonColor: "#c9a84c",
            });
        }

        const noticiaRef = doc(db, "novedades", noticiaId);

        try {
            await runTransaction(db, async (transaction) => {
                const noticiaDoc = await transaction.get(noticiaRef);

                if (!noticiaDoc.exists()) {
                    throw "La noticia no existe";
                }

                const data = noticiaDoc.data();

                // Inicializamos los objetos si no existen en Firebase
                const userReactions = data.userReactions || {};
                const reacciones = data.reacciones || {};

                // Obtenemos qué reaccionó este usuario antes (si es que lo hizo)
                const reaccionPrevia = userReactions[user.uid];

                // CASO A: El usuario hace clic en el MISMO emoji (quiere quitar su reacción)
                if (reaccionPrevia === emoji) {
                    // Quitamos la marca del usuario
                    delete userReactions[user.uid];
                    // Restamos 1 al contador de ese emoji
                    reacciones[emoji] = Math.max(0, (reacciones[emoji] || 1) - 1);
                }
                // CASO B: El usuario reacciona por primera vez o CAMBIA de emoji
                else {
                    // Si ya tenía OTRO emoji antes, le restamos 1 al anterior
                    if (reaccionPrevia) {
                        reacciones[reaccionPrevia] = Math.max(0, (reacciones[reaccionPrevia] || 1) - 1);
                    }

                    // Seteamos la nueva reacción para el usuario
                    userReactions[user.uid] = emoji;
                    // Sumamos 1 al nuevo emoji
                    reacciones[emoji] = (reacciones[emoji] || 0) + 1;
                }

                // Actualizamos el documento en Firebase con los nuevos mapas
                transaction.update(noticiaRef, {
                    userReactions: userReactions,
                    reacciones: reacciones
                });
            });

            // Opcional: un pequeño feedback táctil
            console.log("Reacción procesada");
        } catch (error) {
            console.error("Error en la transacción de reacción: ", error);
            Toast.fire({
                icon: 'error',
                title: 'No se pudo procesar la reacción'
            });
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-barlow-condensed pt-32">
            <div className="max-w-5xl mx-auto space-y-16">

                {/* CABECERA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-4 border-[#c9a84c] pl-8 py-2">
                    <div>
                        <h1 className="font-bebas text-8xl italic uppercase leading-[0.8] tracking-tighter">
                            Prensa <span className="text-[#c9a84c]">Oficial</span>
                        </h1>
                        <p className="text-gray-500 tracking-[6px] uppercase italic text-sm mt-4 font-bold">
                            Novedades · Comunicados · Mercado de Pases
                        </p>
                    </div>

                    {(isAdmin || userData?.rol === "dt") && (
                        <button
                            onClick={scrollToEditor}
                            className="bg-[#c9a84c] text-black font-bebas text-3xl px-8 py-3 italic hover:bg-white transition-all shadow-[8px_8px_0px_rgba(201,168,76,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                        >
                            + Redactar Noticia
                        </button>
                    )}
                </div>

                {/* FEED DE NOTICIAS */}
                <div className="space-y-12">
                    {noticias.length > 0 ? noticias.map((n) => (
                        <article key={n.id} className="bg-[#0f0f0f] border border-white/5 shadow-2xl animate-fadeIn group overflow-hidden relative">

                            {/* 3. BOTÓN DE ELIMINAR (SOLO ADMIN) */}
                            {isAdmin && (
                                <button
                                    onClick={() => borrarNoticia(n.id)}
                                    className="absolute top-3 right-3 z-20 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white px-3 py-1 text-[10px] font-bold uppercase transition-all border border-red-600/50"
                                >
                                    Eliminar Noticia
                                </button>
                            )}

                            <div className="bg-[#161616] px-6 py-3 border-b border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <span className="bg-[#c9a84c] text-black px-4 py-0.5 font-bebas text-xl italic shadow-sm">
                                        {n.categoria}
                                    </span>
                                    <span className="text-gray-500 text-[11px] uppercase font-bold tracking-[3px]">
                                        {n.fecha?.toDate().toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>

                            <div className="p-10 md:p-14">
                                <h3 className="font-bebas text-6xl md:text-7xl italic uppercase text-white mb-10 leading-none tracking-tighter group-hover:text-[#c9a84c] transition-colors">
                                    {n.titulo}
                                </h3>

                                <div
                                    className="text-gray-300 text-xl md:text-2xl leading-relaxed font-light space-y-4 prose prose-invert max-w-none [&_strong]:text-[#c9a84c]"
                                    dangerouslySetInnerHTML={{ __html: n.contenido }}
                                />
                            </div>

                            {/* --- SECCIÓN DE REACCIONES (NUEVO) --- */}
                            <div className="px-10 md:px-14 pb-8 flex flex-wrap gap-3">
                                {['👏', '😂', '💣', '😔', '🌭', '⛄', '🐐'].map((emoji) => {
                                    const count = n.reacciones?.[emoji] || 0;
                                    // Suponiendo que 'user' viene de tu hook useAuth
                                    const hasReacted = n.userReactions?.[user?.uid] === emoji;

                                    return (
                                        <button
                                            key={emoji}
                                            onClick={() => reaccionarANoticia(n.id, emoji)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 group/reaccion ${hasReacted
                                                ? 'bg-[#c9a84c]/20 border-[#c9a84c] text-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.1)]'
                                                : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className={`text-xl transition-transform ${hasReacted ? 'scale-110' : 'group-hover/reaccion:scale-120'}`}>
                                                {emoji}
                                            </span>
                                            <span className="font-bebas text-xl tracking-tight">
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="bg-[#0a0a0a] p-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-[#1a1a1a] border border-[#c9a84c]/20 text-[#c9a84c] flex items-center justify-center font-bebas italic text-4xl group-hover:bg-[#c9a84c] group-hover:text-black transition-all duration-500">
                                        {n.autor.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-600 uppercase tracking-[4px] leading-none mb-1 font-bold">Corresponsal Oficial</p>
                                        <p className="text-2xl text-white font-bebas uppercase italic leading-none tracking-tight">
                                            {n.autor}
                                        </p>
                                    </div>
                                </div>
                                {/* Badge decorativo opcional para rellenar el espacio derecho */}
                                <div className="hidden sm:block opacity-10">
                                    <span className="font-bebas text-4xl italic uppercase">The Legacy</span>
                                </div>
                            </div>
                        </article>
                    )) : (
                        <div className="py-32 text-center border border-dashed border-white/10">
                            <p className="font-bebas text-5xl text-white/10 uppercase italic tracking-[10px] animate-pulse">
                                Sintonizando frecuencias de prensa...
                            </p>
                        </div>
                    )}
                </div>

                {/* EDITOR */}
                <div ref={formularioRef} className="pt-10">
                    {(isAdmin || userData?.rol === "dt") ? (
                        <section className="bg-[#0f0f0f] border border-[#c9a84c]/30 p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <div className="bg-[#111] p-8 md:p-12">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="h-10 w-2 bg-[#c9a84c]"></div>
                                    <h2 className="font-bebas text-5xl text-white italic uppercase tracking-tighter">
                                        Redactar <span className="text-[#c9a84c]">Comunicado</span>
                                    </h2>
                                </div>

                                <form onSubmit={publicarNoticia} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                placeholder="TÍTULO DE LA NOTICIA..."
                                                className="w-full bg-black border border-white/10 p-4 outline-none focus:border-[#c9a84c] text-white font-bebas text-3xl italic transition-all"
                                                value={titulo}
                                                onChange={e => setTitulo(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <select
                                                className="w-full bg-black border border-white/10 p-4 text-[#c9a84c] font-bebas text-2xl italic outline-none cursor-pointer focus:border-[#c9a84c] transition-all"
                                                value={categoria}
                                                onChange={e => setCategoria(e.target.value)}
                                            >
                                                <option value="Fichaje">Fichaje</option>
                                                <option value="Comunicado">Comunicado Oficial</option>
                                                <option value="Sancion">Sanción Disciplinaria</option>
                                                <option value="Torneo">Información Torneo</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-black border border-white/10 min-h-[400px] text-white overflow-hidden focus-within:border-[#c9a84c] transition-all">
                                        <EditorProvider>
                                            <Editor
                                                value={contenido}
                                                onChange={(e) => setContenido(e.target.value)}
                                                containerProps={{
                                                    style: {
                                                        minHeight: '400px',
                                                        backgroundColor: 'transparent',
                                                        color: '#d1d5db',
                                                        border: 'none',
                                                        padding: '20px',
                                                        fontSize: '1.25rem'
                                                    }
                                                }}
                                            >
                                                <Toolbar>
                                                    <BtnBold /><BtnItalic /><BtnUnderline /><BtnStrikeThrough />
                                                    <BtnLink /><BtnNumberedList /><BtnBulletList /><BtnClearFormatting />
                                                </Toolbar>
                                            </Editor>
                                        </EditorProvider>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-[#c9a84c] text-black font-bebas text-5xl py-5 hover:bg-white transition-all uppercase italic tracking-tighter"
                                    >
                                        Lanzar al Foro Oficial
                                    </button>
                                </form>
                            </div>
                        </section>
                    ) : (
                        <div className="bg-[#0a0a0a] p-10 border border-white/5 text-center">
                            <p className="text-gray-600 text-sm uppercase tracking-[6px] italic font-bold">
                                --- Acceso de redacción restringido ---
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}