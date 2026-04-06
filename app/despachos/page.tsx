"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    collection, query, orderBy, onSnapshot, addDoc,
    serverTimestamp, doc, updateDoc, increment, deleteDoc, Timestamp, where, limit
} from "firebase/firestore";

interface MovimientoLinea {
    tipo: string;
    detalle: string;
    monto: number;
}

interface Post {
    id: string;
    autor: string;
    fecha: Timestamp;
    contenido: string;
    movimientos?: MovimientoLinea[];
    esAdminPost?: boolean;
}

interface Equipo {
    id: string;
    nombre: string;
    presupuesto: number;
    dt?: string;
}

export default function SeccionDespachos() {
    const { userData, isAdmin } = useAuth();
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [equipoActivoId, setEquipoActivoId] = useState<string | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [discordDT, setDiscordDT] = useState<string | null>(null);

    // Estados para el nuevo post
    const [textoLibre, setTextoLibre] = useState("");
    const [urlImagen, setUrlImagen] = useState("");
    const [lineasMovimiento, setLineasMovimiento] = useState<MovimientoLinea[]>([]);
    const [nuevaLinea, setNuevaLinea] = useState<MovimientoLinea>({ tipo: "COMPRA", detalle: "", monto: 0 });

    useEffect(() => {
        const q = query(collection(db, "equipos"), orderBy("nombre", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const eqs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Equipo));
            setEquipos(eqs);
            setEquipoActivoId(prev => prev || (eqs.length > 0 ? eqs[0].id : null));
        });
        return () => unsub();
    }, []);

    // Efecto para traer el Discord del DT del equipo seleccionado
    useEffect(() => {
        // Si no hay ID, no hacemos nada (la limpieza la hace el return)
        if (!equipoActivoId) return;

        const q = query(
            collection(db, "users"),
            where("equipoId", "==", equipoActivoId),
            limit(1)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const dtData = snapshot.docs[0].data();
                setDiscordDT(dtData.discord || "Sin Discord vinculado");
            } else {
                setDiscordDT("Sin DT asignado");
            }
        });

        // ESTA ES LA ÚNICA FORMA DE LIMPIAR SIN ERRORES DE CASCADA
        return () => {
            unsub();
            setDiscordDT(null);
        };
    }, [equipoActivoId]);

    useEffect(() => {
        if (!equipoActivoId) return;
        const q = query(collection(db, "equipos", equipoActivoId, "movimientos"), orderBy("fecha", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
        });
        return () => unsub();
    }, [equipoActivoId]);

    const agregarLineaALista = () => {
        if (!nuevaLinea.detalle.trim()) {
            alert("Escribí el detalle del movimiento.");
            return;
        }

        let montoCorregido = nuevaLinea.monto;
        if (nuevaLinea.tipo === "COMPRA" && montoCorregido > 0) montoCorregido = -montoCorregido;
        else if ((nuevaLinea.tipo === "VENTA" || nuevaLinea.tipo === "PATROCINIO") && montoCorregido < 0) montoCorregido = Math.abs(montoCorregido);

        setLineasMovimiento(prev => [...prev, { ...nuevaLinea, monto: montoCorregido }]);
        setNuevaLinea({ tipo: "COMPRA", detalle: "", monto: 0 });
    };

    const publicarPost = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentId = equipoActivoId;
        if (!currentId) return;

        const canPost = isAdmin || userData?.equipoId === currentId;
        if (!canPost) return alert("No tienes permiso aquí.");

        try {
            await addDoc(collection(db, "equipos", currentId, "movimientos"), {
                autor: userData.nombre || "Admin",
                contenido: textoLibre || urlImagen || "",
                movimientos: lineasMovimiento,
                esAdminPost: isAdmin,
                fecha: serverTimestamp()
            });

            if (lineasMovimiento.length > 0) {
                const totalMonto = lineasMovimiento.reduce((acc, curr) => acc + curr.monto, 0);
                await updateDoc(doc(db, "equipos", currentId), {
                    presupuesto: increment(totalMonto)
                });
            }

            setTextoLibre("");
            setUrlImagen("");
            setLineasMovimiento([]);
            alert("Publicado en el despacho.");
        } catch (error) {
            console.error(error);
        }
    };

    const borrarPost = async (postId: string) => {
        if (!isAdmin || !confirm("¿Borrar este mensaje? El presupuesto NO se restaurará automáticamente.")) return;
        try {
            await deleteDoc(doc(db, "equipos", equipoActivoId!, "movimientos", postId));
        } catch (error) { console.error(error); }
    };

    const equipoActual = equipos.find(e => e.id === equipoActivoId);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] p-4 md:p-10 font-barlow-condensed">
            <div className="max-w-5xl mx-auto">
                {/* TABS */}
                <div className="flex flex-wrap gap-1 mb-8 bg-[#111] p-1 border border-[#222]">
                    {equipos.map((eq) => (
                        <button key={eq.id} onClick={() => setEquipoActivoId(eq.id)}
                            className={`px-4 py-2 font-bebas text-lg italic ${equipoActivoId === eq.id ? "bg-[#c9a84c] text-black" : "text-gray-400 hover:bg-[#222]"}`}>
                            {eq.nombre}
                        </button>
                    ))}
                </div>

                {/* INFO DEL EQUIPO ACTUALIZADA */}
                {/* INFO DEL EQUIPO ACTUALIZADA */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="font-bebas text-4xl leading-none uppercase italic">
                            {equipoActual?.nombre}
                        </h2>

                        {/* DISCORD DEL DT: Esta es la sección que vincula el dato */}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 bg-[#5865F2] rounded-full animate-pulse"></span>
                            <p className="text-[#888] text-[12px] uppercase tracking-[2px] font-bold">
                                DISCORD DT: <span className="text-white ml-1">
                                    {discordDT || "SIN DISCORD VINCULADO"}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="text-4xl md:text-6xl font-bebas text-[#27ae60] tabular-nums">
                        ${equipoActual?.presupuesto?.toLocaleString()}
                    </div>
                </div>

                {/* HILO DE MENSAJES */}
                <div className="space-y-6 mb-12">
                    {posts.map((p, idx) => (
                        <div key={p.id} className={`bg-[#111] border ${p.esAdminPost ? 'border-[#c9a84c]/50' : 'border-[#222]'} flex flex-col md:flex-row relative`}>
                            {isAdmin && (
                                <button onClick={() => borrarPost(p.id)} className="absolute top-2 right-2 text-red-500 hover:text-white text-xs uppercase font-bold bg-black/50 px-2 py-1 z-10">Borrar</button>
                            )}
                            <div className="w-full md:w-48 bg-[#151515] p-4 border-r border-[#222] flex flex-row md:flex-col items-center gap-3">
                                <div className={`w-12 h-12 flex items-center justify-center font-bebas text-2xl italic ${p.esAdminPost ? 'bg-red-600' : 'bg-[#c9a84c] text-black'}`}>{p.autor.charAt(0)}</div>
                                <div className="text-left md:text-center">
                                    <p className={`${p.esAdminPost ? 'text-red-500' : 'text-[#c9a84c]'} font-bold uppercase text-xs`}>{p.autor}</p>
                                    <p className="text-[9px] text-gray-500 uppercase mt-1 italic">Mensaje #{idx + 1}</p>
                                </div>
                            </div>
                            <div className="flex-grow p-6">
                                {p.contenido && <p className="text-lg mb-4 whitespace-pre-wrap italic uppercase tracking-wide">{p.contenido}</p>}
                                {p.movimientos && p.movimientos.length > 0 && (
                                    <div className="bg-black/30 p-4 border border-[#222] space-y-2">
                                        {p.movimientos.map((m, i) => (
                                            <div key={i} className="flex justify-between items-center border-b border-white/5 pb-1">
                                                <span className="text-[11px] font-bold italic">
                                                    <span className={m.monto >= 0 ? 'text-green-500' : 'text-red-500'}>[{m.tipo}]</span> {m.detalle}
                                                </span>
                                                <span className={`font-bebas text-xl ${m.monto >= 0 ? 'text-green-500' : 'text-red-500'}`}>${m.monto.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CAJA DE RESPUESTA */}
                {(isAdmin || userData?.equipoId === equipoActivoId) && (
                    <div className="bg-[#1a1a1a] border-t-4 border-[#c9a84c] p-8">
                        <h3 className="font-bebas text-3xl mb-6 italic uppercase">Responder al Despacho</h3>
                        <form onSubmit={publicarPost} className="space-y-4">
                            <textarea placeholder="Texto del post (Opcional)..." className="w-full bg-[#0a0a0a] border border-[#333] p-3 outline-none focus:border-[#c9a84c] italic min-h-[100px]"
                                value={textoLibre} onChange={(e) => setTextoLibre(e.target.value)} />

                            <div className="bg-[#111] border-l-4 border-[#c9a84c] p-6 mb-6">
                                <h4 className="font-bebas text-2xl text-[#c9a84c] mb-3 italic uppercase tracking-widest">Guía de Movimientos</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] uppercase tracking-wider text-gray-400 italic">
                                    <ul className="space-y-2">
                                        <li><span className="text-white font-bold">[ COMPRA ]</span> - Monto <span className="text-red-500 font-bold">NEGATIVO</span></li>
                                        <li><span className="text-white font-bold">[ VENTA ]</span> - Monto <span className="text-green-500 font-bold">POSITIVO</span></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-black/50 p-4 border border-[#333]">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                                    <select className="bg-[#0a0a0a] border border-[#333] p-2" value={nuevaLinea.tipo} onChange={(e) => setNuevaLinea({ ...nuevaLinea, tipo: e.target.value })}>
                                        <option value="COMPRA">COMPRA (-)</option>
                                        <option value="VENTA">VENTA (+)</option>
                                        <option value="PRESTAMO">PRESTAMO</option>
                                        <option value="INTERCAMBIO">INTERCAMBIO</option>
                                        <option value="PATROCINIO">PATROCINIO (+)</option>
                                    </select>
                                    <input type="text" placeholder="Detalle..." className="bg-[#0a0a0a] border border-[#333] p-2 md:col-span-2" value={nuevaLinea.detalle} onChange={(e) => setNuevaLinea({ ...nuevaLinea, detalle: e.target.value })} />
                                    <input type="number" placeholder="Monto" className="bg-[#0a0a0a] border border-[#333] p-2" value={nuevaLinea.monto} onChange={(e) => setNuevaLinea({ ...nuevaLinea, monto: Number(e.target.value) })} />
                                </div>
                                <button type="button" onClick={agregarLineaALista} className="text-[20px] bg-white/10 px-4 py-1 uppercase font-bold hover:bg-white/20 transition-all">+ Añadir línea al post</button>

                                {lineasMovimiento.length > 0 && (
                                    <div className="mt-4 p-2 bg-black/20 border border-white/5">
                                        {lineasMovimiento.map((l, i) => (
                                            <div key={i} className="text-xs italic py-1 border-b border-white/5 flex justify-between">
                                                <span>[{l.tipo}] {l.detalle}</span>
                                                <span className={l.monto >= 0 ? 'text-green-500' : 'text-red-500'}>${l.monto.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="w-full bg-[#c9a84c] text-black font-bebas text-3xl py-3 hover:bg-white transition-all uppercase italic">Enviar Post al Hilo</button>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}