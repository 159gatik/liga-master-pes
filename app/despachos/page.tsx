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
    division: string; // Campo obligatorio ahora
    juego: string;    // Filtro por PES6
    dt?: string;
}

export default function SeccionDespachos() {
    const { userData, isAdmin } = useAuth();
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [tabActiva, setTabActiva] = useState<"A" | "B">("A"); // Tab de división
    const [equipoActivoId, setEquipoActivoId] = useState<string | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [discordDT, setDiscordDT] = useState<string | null>(null);

    const [textoLibre, setTextoLibre] = useState("");
    const [lineasMovimiento, setLineasMovimiento] = useState<MovimientoLinea[]>([]);
    const [nuevaLinea, setNuevaLinea] = useState<MovimientoLinea>({ tipo: "COMPRA", detalle: "", monto: 0 });

    // 1. Cargar equipos
    useEffect(() => {
        const q = query(collection(db, "equipos"), orderBy("nombre", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const eqs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Equipo));
            setEquipos(eqs);

            // Si no hay equipo activo, intentar poner el primero de la división A
            if (!equipoActivoId) {
                const primerA = eqs.find(e => e.division === "A" && e.juego === "pes6");
                if (primerA) setEquipoActivoId(primerA.id);
            }
        });
        return () => unsub();
    }, []);

    // 2. Cargar Discord del DT
    useEffect(() => {
        if (!equipoActivoId) return;
        const q = query(collection(db, "users"), where("equipoId", "==", equipoActivoId), limit(1));
        const unsub = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const dtData = snapshot.docs[0].data();
                setDiscordDT(dtData.discord || "Sin Discord vinculado");
            } else {
                setDiscordDT("Sin DT asignado");
            }
        });
        return () => { unsub(); setDiscordDT(null); };
    }, [equipoActivoId]);

    // 3. Cargar Movimientos (Posts)
    useEffect(() => {
        if (!equipoActivoId) return;
        const q = query(collection(db, "equipos", equipoActivoId, "movimientos"), orderBy("fecha", "desc")); // Cambiado a desc para ver lo nuevo arriba
        const unsub = onSnapshot(q, (snapshot) => {
            setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
        });
        return () => unsub();
    }, [equipoActivoId]);

    const agregarLineaALista = () => {
        if (!nuevaLinea.detalle.trim()) return alert("Escribí el detalle.");
        let montoCorregido = nuevaLinea.monto;
        if (nuevaLinea.tipo === "COMPRA" && montoCorregido > 0) montoCorregido = -montoCorregido;
        else if ((nuevaLinea.tipo === "VENTA" || nuevaLinea.tipo === "PATROCINIO") && montoCorregido < 0) montoCorregido = Math.abs(montoCorregido);
        setLineasMovimiento(prev => [...prev, { ...nuevaLinea, monto: montoCorregido }]);
        setNuevaLinea({ tipo: "COMPRA", detalle: "", monto: 0 });
    };

    const publicarPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textoLibre.trim() && lineasMovimiento.length === 0) return alert("Despacho vacío.");
        const currentId = equipoActivoId;
        if (!currentId) return;

        if (!isAdmin && userData?.equipoId !== currentId) {
            return alert("No tienes permiso aquí.");
        }

        try {
            await addDoc(collection(db, "equipos", currentId, "movimientos"), {
                autor: userData.nombre || "DT Oficial",
                contenido: textoLibre.trim(),
                movimientos: lineasMovimiento,
                esAdminPost: isAdmin,
                fecha: serverTimestamp()
            });

            if (isAdmin && lineasMovimiento.length > 0) {
                const totalMonto = lineasMovimiento.reduce((acc, curr) => acc + curr.monto, 0);
                await updateDoc(doc(db, "equipos", currentId), { presupuesto: increment(totalMonto) });
            }

            alert("Reportado con éxito.");
            setTextoLibre("");
            setLineasMovimiento([]);
        } catch (error) { alert(`Error: ${error.message}`); }
    };

    const borrarPost = async (postId: string) => {
        if (!isAdmin || !confirm("¿Borrar mensaje?")) return;
        try { await deleteDoc(doc(db, "equipos", equipoActivoId!, "movimientos", postId)); } catch (e) { console.error(e); }
    };

    const equiposFiltrados = equipos.filter(e => e.division === tabActiva && e.juego === "pes6");
    const equipoActual = equipos.find(e => e.id === equipoActivoId);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] p-4 md:p-10 font-barlow-condensed pt-24">
            <div className="max-w-5xl mx-auto">

                {/* TABS DE DIVISIÓN */}
                <div className="flex gap-2 mb-4">
                    {["A", "B"].map((div) => (
                        <button
                            key={div}
                            onClick={() => setTabActiva(div as "A" | "B")}
                            className={`px-6 py-2 font-bebas text-xl tracking-widest transition-all ${tabActiva === div ? "bg-[#c9a84c] text-black italic" : "bg-[#111] text-gray-500 border border-white/5 hover:text-white"
                                }`}
                        >
                            DIVISIÓN {div}
                        </button>
                    ))}
                </div>

                {/* TABS DE EQUIPOS FILTRADOS */}
                <div className="flex flex-wrap gap-1 mb-8 bg-[#111] p-1 border border-[#222]">
                    {equiposFiltrados.map((eq) => (
                        <button key={eq.id} onClick={() => setEquipoActivoId(eq.id)}
                            className={`px-4 py-2 font-bebas text-lg italic transition-colors ${equipoActivoId === eq.id ? "bg-[#c9a84c] text-black" : "text-gray-400 hover:bg-[#222]"}`}>
                            {eq.nombre}
                        </button>
                    ))}
                </div>

                {/* INFO BAR EQUIPO */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="font-bebas text-4xl leading-none uppercase italic">{equipoActual?.nombre || "Seleccioná un club"}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 bg-[#5865F2] rounded-full animate-pulse"></span>
                            <p className="text-[#888] text-[12px] uppercase tracking-[2px] font-bold">
                                DISCORD DT: <span className="text-white ml-1">{discordDT || "---"}</span>
                            </p>
                        </div>
                    </div>
                    <div className="text-4xl md:text-6xl font-bebas text-[#27ae60] tabular-nums">
                        ${equipoActual?.presupuesto?.toLocaleString() || "0"}
                    </div>
                </div>

                {/* HILO DE MENSAJES */}
                <div className="space-y-6 mb-12">
                    {posts.map((p, idx) => (
                        <div key={p.id} className={`bg-[#111] border ${p.esAdminPost ? 'border-[#c9a84c]/50 shadow-[0_0_15px_rgba(201,168,76,0.05)]' : 'border-[#222]'} flex flex-col md:flex-row relative animate-fadeIn`}>
                            {isAdmin && (
                                <button onClick={() => borrarPost(p.id)} className="absolute top-2 right-2 text-red-500 hover:text-white text-xs uppercase font-bold bg-black/50 px-2 py-1 z-10">Borrar</button>
                            )}
                            <div className="w-full md:w-48 bg-[#151515] p-4 border-r border-[#222] flex flex-row md:flex-col items-center gap-3">
                                <div className={`w-12 h-12 flex items-center justify-center font-bebas text-2xl italic ${p.esAdminPost ? 'bg-red-600 text-white' : 'bg-[#c9a84c] text-black'}`}>{p.autor.charAt(0)}</div>
                                <div className="text-left md:text-center">
                                    <p className={`${p.esAdminPost ? 'text-red-500' : 'text-[#c9a84c]'} font-bold uppercase text-xs tracking-widest`}>{p.autor}</p>
                                    <p className="text-[9px] text-gray-500 uppercase mt-1 italic">Operación {posts.length - idx}</p>
                                </div>
                            </div>
                            <div className="flex-grow p-6">
                                {p.contenido && <p className="text-lg mb-4 whitespace-pre-wrap italic uppercase tracking-wide text-gray-200">{p.contenido}</p>}
                                {p.movimientos && p.movimientos.length > 0 && (
                                    <div className="bg-black/30 p-4 border border-[#222] space-y-2">
                                        {p.movimientos.map((m, i) => (
                                            <div key={i} className="flex justify-between items-center border-b border-white/5 pb-1">
                                                <span className="text-[11px] font-bold italic uppercase">
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

                {/* FORMULARIO */}
                {(isAdmin || userData?.equipoId === equipoActivoId) && equipoActivoId && (
                    <div className="bg-[#1a1a1a] border-t-4 border-[#c9a84c] p-8 shadow-2xl">
                        <h3 className="font-bebas text-3xl mb-6 italic uppercase text-white">Redactar Informe</h3>
                        <form onSubmit={publicarPost} className="space-y-4">
                            <textarea placeholder="Detalles aquí..." className="w-full bg-[#0a0a0a] border border-[#333] p-3 outline-none focus:border-[#c9a84c] italic min-h-[100px] text-white"
                                value={textoLibre} onChange={(e) => setTextoLibre(e.target.value)} />
                            <div className="bg-[#111] border-l-4 border-[#c9a84c] p-6 mb-6">
                                <h4 className="font-bebas text-2xl text-[#c9a84c] mb-3 uppercase italic tracking-widest">Contabilidad</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                                    <select className="bg-[#0a0a0a] border border-[#333] p-2 text-xs uppercase text-white" value={nuevaLinea.tipo} onChange={(e) => setNuevaLinea({ ...nuevaLinea, tipo: e.target.value })}>
                                        <option value="COMPRA">COMPRA (-)</option>
                                        <option value="VENTA">VENTA (+)</option>
                                        <option value="PRESTAMO">PRESTAMO</option>
                                        <option value="INTERCAMBIO">INTERCAMBIO</option>
                                        <option value="PATROCINIO">PATROCINIO (+)</option>
                                    </select>
                                    <input type="text" placeholder="Detalle" className="bg-[#0a0a0a] border border-[#333] p-2 md:col-span-2 text-sm italic" value={nuevaLinea.detalle} onChange={(e) => setNuevaLinea({ ...nuevaLinea, detalle: e.target.value })} />
                                    <input type="number" placeholder="Monto" className="bg-[#0a0a0a] border border-[#333] p-2 text-sm text-white" value={nuevaLinea.monto} onChange={(e) => setNuevaLinea({ ...nuevaLinea, monto: Number(e.target.value) })} />
                                </div>
                                <button type="button" onClick={agregarLineaALista} className="text-xs bg-white/5 border border-white/10 px-4 py-2 uppercase font-bold hover:bg-[#c9a84c] hover:text-black italic">
                                    + Añadir movimiento
                                </button>
                                {lineasMovimiento.length > 0 && (
                                    <div className="mt-4 p-4 bg-black/20 border border-white/5">
                                        {lineasMovimiento.map((l, i) => (
                                            <div key={i} className="text-xs italic py-1 border-b border-white/5 flex justify-between uppercase">
                                                <span>[{l.tipo}] {l.detalle}</span>
                                                <span className={l.monto >= 0 ? 'text-green-500' : 'text-red-500'}>${l.monto.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="w-full bg-[#c9a84c] text-black font-bebas text-3xl py-3 hover:bg-white uppercase italic tracking-widest transition-all">
                                Enviar al Despacho
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}