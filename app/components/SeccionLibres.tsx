"use client";
import { useState, useEffect } from "react";
import { db } from "../../src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    collection, addDoc, query, orderBy, onSnapshot,
    serverTimestamp, Timestamp, where, limit, doc
} from "firebase/firestore";

interface FichajeConfirmado {
    id: string;
    usuario: string; // Nombre del equipo
    texto: string;   // "Jugador - Ex Equipo"
    fecha: Timestamp;
    estado: string;
}

interface MercadoConfig {
    fichajesAbiertos: boolean;
    liberacionesAbiertas: boolean; // Agregué este porque lo vi en tu captura
    fechaCierre: Timestamp;
}

export default function SeccionLibres() {
    const { user, userData } = useAuth();
    const [confirmados, setConfirmados] = useState<FichajeConfirmado[]>([]);
    const [nuevoPedido, setNuevoPedido] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mercado, setMercado] = useState<MercadoConfig>({
        fichajesAbiertos: false,
        liberacionesAbiertas: false,
        fechaCierre: null
    });


    // 1. Escuchar solo los fichajes ACEPTADOS para mostrar como historial oficial
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "configuracion", "mercado"), (docSnap) => {
            if (docSnap.exists()) {
                // Firestore data() devuelve un objeto, lo forzamos a nuestro tipo
                const data = docSnap.data() as MercadoConfig;
                setMercado(data);
            }
        });
        return () => unsub();
    }, []);
    // 2. Escuchar fichajes aceptados (igual que antes)
    useEffect(() => {
        const q = query(collection(db, "pedidos_libres"), where("estado", "==", "aceptado"), orderBy("fecha", "desc"), limit(20));
        return onSnapshot(q, (snapshot) => {
            setConfirmados(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FichajeConfirmado)));
        });
    }, []);

    const enviarSolicitud = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoPedido.trim() || !user) return;

        setEnviando(true);
        try {
            await addDoc(collection(db, "pedidos_libres"), {
                usuario: userData?.nombreEquipo || "Sin Equipo",
                dtNombre: userData?.nombre || user.displayName,
                uid: user.uid,
                texto: nuevoPedido, // Ejemplo: "Rodrygo - Real Madrid"
                fecha: serverTimestamp(),
                estado: "pendiente" // El admin lo verá en su panel
            });
            setNuevoPedido("");
            alert("Solicitud enviada al Comité. Esperá la resolución.");
        } catch (error) {
            console.error(error);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20 font-barlow-condensed">

            {/* --- FORMULARIO O AVISO DE CIERRE --- */}
            {user && userData?.equipoId && (
                <div className="bg-[#111] p-6 border border-[#222]">
                    {mercado.fichajesAbiertos ? (
                        <>
                            <h4 className="font-bebas text-2xl text-[#c9a84c] mb-4">Enviar Pedido al Comité</h4>
                            <form onSubmit={enviarSolicitud} className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    value={nuevoPedido}
                                    onChange={(e) => setNuevoPedido(e.target.value)}
                                    placeholder="JUGADOR - EX EQUIPO"
                                    className="flex-1 bg-black border border-[#333] p-3 text-white uppercase text-sm focus:border-[#c9a84c] outline-none"
                                    required
                                />
                                <button disabled={enviando} className="bg-[#c9a84c] text-black font-bebas px-10 py-3 text-xl hover:bg-white transition-all disabled:opacity-50">
                                    {enviando ? "ENVIANDO..." : "SOLICITAR FICHAJE"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6 border border-red-900 bg-red-950/20">
                            <h4 className="font-bebas text-2xl text-red-500">MERCADO CERRADO</h4>
                            <p className="text-gray-400 mt-2">El periodo de fichajes se encuentra inhabilitado en este momento.</p>
                            {mercado.fechaCierre && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Última actualización: {mercado.fechaCierre.toDate().toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
            {/* --- HISTORIAL DE FICHAJES CONFIRMADOS --- */}
            <div className="space-y-6 pt-10 border-t border-[#222]">
                <div className="flex items-center justify-between">
                    <h4 className="font-bebas text-3xl text-[#c9a84c] tracking-[2px] uppercase">
                        Fichajes Oficializados
                    </h4>
                    <span className="text-[10px] text-green-500 font-mono animate-pulse underline">BOLETÍN OFICIAL</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {confirmados.length === 0 ? (
                        <p className="text-gray-600 italic">No hay fichajes confirmados en esta tanda.</p>
                    ) : (
                        confirmados.map((c) => (
                            <div key={c.id} className="bg-black/40 border border-[#222] p-4 flex items-center justify-between group hover:border-[#27ae60] transition-all">
                                <div>
                                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">{c.usuario} incorporó a:</p>
                                    <p className="text-white font-bebas text-2xl uppercase tracking-tighter group-hover:text-[#27ae60]">{c.texto}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[#27ae60] text-[9px] font-bold block">✓ CONFIRMADO</span>
                                    <span className="text-[8px] text-gray-700">{c.fecha?.toDate().toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}