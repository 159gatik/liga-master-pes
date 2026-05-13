"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    collection, addDoc, query, orderBy, onSnapshot,
    serverTimestamp, Timestamp
} from "firebase/firestore";
import { Alert, Toast } from "@/src/lib/alerts";

interface PostOjeador {
    id: string;
    equipo: string;
    dt: string;
    uid: string;
    posicionBuscada: string;
    condicion: string;
    presupuesto: string;
    detalles: string;
    fecha: Timestamp;
}

export default function SeccionOjeadores() {
    const { user, userData } = useAuth();
    const [pedidos, setPedidos] = useState<PostOjeador[]>([]);
    const [respuestas, setRespuestas] = useState<any[]>([]);

    const [showForm, setShowForm] = useState(false);
    const [posicion, setPosicion] = useState("");
    const [condicion, setCondicion] = useState("Dinero");
    const [presupuesto, setPresupuesto] = useState("");
    const [detalles, setDetalles] = useState("");

    const [comentarioTexto, setComentarioTexto] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const q = query(collection(db, "ojeadores"), orderBy("fecha", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setPedidos(snap.docs.map(d => ({ id: d.id, ...d.data() } as PostOjeador)));
        });

        const qRes = query(collection(db, "respuestas_ojeador"), orderBy("fecha", "asc"));
        const unsubRes = onSnapshot(qRes, (snap) => {
            setRespuestas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsub(); unsubRes(); };
    }, []);

    const crearPedido = async () => {
        if (!posicion || !detalles) return Alert.fire("Error", "Completa la posición y los detalles", "error");

        try {
            await addDoc(collection(db, "ojeadores"), {
                equipo: userData?.nombreEquipo || "Sin Equipo",
                dt: userData?.nombre || user?.displayName,
                uid: user?.uid,
                posicionBuscada: posicion.toUpperCase(),
                condicion,
                presupuesto: presupuesto || "A convenir",
                detalles: detalles.toUpperCase(),
                fecha: serverTimestamp()
            });
            setPosicion(""); setDetalles(""); setPresupuesto("");
            setShowForm(false);
            Toast.fire({ icon: 'success', title: 'Pedido de ojeador publicado' });
        } catch (e) { console.error(e); }
    };

    const enviarRespuesta = async (ojeadorId: string) => {
        const texto = comentarioTexto[ojeadorId];
        if (!texto?.trim()) return;

        try {
            await addDoc(collection(db, "respuestas_ojeador"), {
                ojeadorId,
                equipoResponde: userData?.nombreEquipo || "Sin Equipo",
                dtResponde: userData?.nombre || user?.displayName,
                uid: user?.uid,
                sugerencia: texto,
                fecha: serverTimestamp()
            });
            setComentarioTexto({ ...comentarioTexto, [ojeadorId]: "" });
            Toast.fire({ icon: 'success', title: 'Respuesta enviada' });
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                    <h3 className="font-bebas text-4xl italic text-white uppercase">Centro de <span className="text-cyan-500">Ojeadores</span></h3>
                    <p className="text-gray-500 text-xs uppercase tracking-widest">Publica lo que tu equipo necesita reforzar</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-cyan-600 text-white px-6 py-2 font-bebas text-xl skew-x-[-15deg] hover:bg-cyan-500 transition-all"
                >
                    <span className="inline-block skew-x-[15deg]">{showForm ? "CANCELAR" : "BUSCAR JUGADOR"}</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-[#111] p-6 border-l-4 border-cyan-600 space-y-4 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text" placeholder="POSICIÓN (EJ: MCD, DELANTERO TANQUE)"
                            className="bg-black border border-[#222] p-3 text-white font-bebas outline-none focus:border-cyan-600"
                            value={posicion} onChange={(e) => setPosicion(e.target.value)}
                        />
                        <input
                            type="text" placeholder="PRESUPUESTO ESTIMADO (OPCIONAL)"
                            className="bg-black border border-[#222] p-3 text-white font-bebas outline-none focus:border-cyan-600"
                            value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)}
                        />
                    </div>
                    <textarea
                        placeholder="DETALLES (EJ: BUSCO JUGADOR CON MÁS DE 80 DE VELOCIDAD O INTERCAMBIO POR MI PORTERO)"
                        className="w-full bg-black border border-[#222] p-4 text-white text-sm outline-none focus:border-cyan-600"
                        rows={2}
                        value={detalles} onChange={(e) => setDetalles(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                        <select
                            className="bg-black border border-[#222] p-2 text-cyan-500 font-bebas uppercase outline-none"
                            value={condicion} onChange={(e) => setCondicion(e.target.value)}
                        >
                            <option value="Dinero">Dinero</option>
                            <option value="Intercambio">Intercambio</option>
                            <option value="Ambos">Ambos</option>
                        </select>
                        <button onClick={crearPedido} className="bg-cyan-600 text-white px-10 py-2 font-bebas text-xl uppercase italic hover:bg-white hover:text-black transition-all">Publicar Búsqueda</button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {pedidos.map((p) => (
                    <div key={p.id} className="bg-[#0a0a0a] border border-white/5 rounded-sm overflow-hidden">
                        <div className="p-5 flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-cyan-600/20 text-cyan-400 px-3 py-0.5 text-xs font-bold uppercase tracking-tighter border border-cyan-600/30">
                                        BUSCO {p.posicionBuscada}
                                    </span>
                                    <span className="text-gray-600 text-[10px] uppercase font-bold">{p.equipo} (DT: {p.dt})</span>
                                </div>
                                <p className="text-gray-200 text-lg font-barlow-condensed italic leading-tight">"{p.detalles}"</p>
                            </div>
                            <div className="text-right flex flex-col justify-center border-l border-white/5 pl-4">
                                <p className="text-gray-500 text-[9px] uppercase font-bold">Presupuesto / Condición</p>
                                <p className="text-white font-bebas text-2xl leading-none">{p.presupuesto}</p>
                                <p className="text-cyan-500 text-xs font-bold uppercase">{p.condicion}</p>
                            </div>
                        </div>

                        {/* RESPUESTAS */}
                        <div className="bg-black/40 border-t border-white/5 p-4 space-y-3">
                            {respuestas.filter(r => r.ojeadorId === p.id).map(res => (
                                <div key={res.id} className="bg-white/[0.02] p-3 rounded-sm border-l border-cyan-600/50">
                                    <p className="text-[10px] mb-1">
                                        <span className="text-cyan-500 font-bold uppercase">{res.equipoResponde}</span>
                                        <span className="text-gray-600 ml-2">{res.fecha?.toDate().toLocaleTimeString()}</span>
                                    </p>
                                    <p className="text-gray-400 text-sm italic">"{res.sugerencia}"</p>
                                </div>
                            ))}

                            <div className="flex gap-2 mt-4">
                                <input
                                    type="text" placeholder="Ofrecer jugador o sugerir..."
                                    className="flex-1 bg-black border border-white/10 p-2 text-xs text-white outline-none focus:border-cyan-600"
                                    value={comentarioTexto[p.id] || ""}
                                    onChange={(e) => setComentarioTexto({ ...comentarioTexto, [p.id]: e.target.value })}
                                />
                                <button onClick={() => enviarRespuesta(p.id)} className="bg-white/5 hover:bg-cyan-600 text-white px-4 font-bebas text-sm transition-all border border-white/10">ENVIAR</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 