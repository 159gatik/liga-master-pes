"use client";
import { useState, useEffect } from "react";
import { db } from "../../src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht"; // Asegúrate de que la ruta sea correcta
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";

interface Comentario {
    id: string;
    usuario: string;
    texto: string;
    fecha: Timestamp;
}

export default function SeccionLibres() {
    const { user, userData } = useAuth(); // Obtenemos el usuario logueado y sus datos de Firestore
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [nuevoPedido, setNuevoPedido] = useState("");
    const [enviando, setEnviando] = useState(false);

    // 1. Escuchar pedidos en tiempo real
    useEffect(() => {
        const q = query(collection(db, "pedidos_libres"), orderBy("fecha", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Comentario[];
            setComentarios(data);
        });
        return () => unsubscribe();
    }, []);

    // 2. Función para publicar el pedido
    const publicarPedido = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoPedido.trim()) return;

        setEnviando(true);
        try {
            await addDoc(collection(db, "pedidos_libres"), {
                // Usamos el nombre del equipo, el nombre de perfil o un fallback
                usuario: userData?.nombreEquipo || user?.displayName || "DT Invitado",
                uid: user?.uid || "anonimo",
                texto: nuevoPedido,
                fecha: serverTimestamp()
            });
            setNuevoPedido("");
        } catch (error) {
            console.error("Error al publicar:", error);
            alert("Error al enviar el pedido.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-10 pb-20">

            {/* --- BLOQUE DE CONSIDERACIONES --- */}
            <div className="bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#c9a84c] p-8 shadow-2xl font-barlow-condensed">
                <h3 className="font-bebas text-4xl text-[#c9a84c] mb-6 tracking-[3px] uppercase italic">
                    Jugadores Libres: <span className="text-white">Consideraciones</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-gray-300 text-sm leading-relaxed">
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <span className="text-[#c9a84c] font-bold">01.</span>
                            <p>Los DTs podrán elegir hasta <strong className="text-white">2 jugadores libres</strong> de su elección de la lista oficial.</p>
                        </li>
                        <li className="flex gap-3 border-l-2 border-[#2a2a2a] pl-4 italic">
                            <span className="text-[#c9a84c] font-bold">02.</span>
                            <p>Cualquier comentario antes de la hora indicada <strong className="text-red-500">no será tenido en cuenta</strong>.</p>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-[#c9a84c] font-bold">03.</span>
                            <p>Prioridad por tiempo: En caso de disputa, ganará quien haya <strong className="text-white">comentado antes</strong> el post oficial.</p>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-[#c9a84c] font-bold">04.</span>
                            <p>Es obligatorio contar con un presupuesto mínimo de <strong className="text-[#27ae60]">$100.000.000</strong> para participar.</p>
                        </li>
                    </ul>

                    <ul className="space-y-4">
                        <li className="bg-black/40 p-4 border border-[#222]">
                            <span className="text-[#c9a84c] font-bold block mb-2 text-xs tracking-widest uppercase">Forma de pedido:</span>
                            <p className="text-white font-mono text-xs">
                                Jugador - Ex Equipo <br />
                                <span className="text-gray-500 italic mt-1 block">Ej: Rodrygo - Real Madrid / Marino - Arsenal</span>
                            </p>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-[#c9a84c] font-bold">05.</span>
                            <p>Al otorgarse el jugador, el DT debe realizar el contrato con el <strong className="text-orange-500">10% de sueldo estipulado</strong>.</p>
                        </li>
                        <li className="flex gap-3 text-[16px] text-gray-500 uppercase tracking-tighter italic">
                            <span className="text-[#c9a84c] font-bold">!</span>
                            <p>Cualquier situación no estipulada será resolución del Comité sin lugar a reclamos.</p>
                        </li>
                    </ul>
                </div>

                <div className="mt-8 py-3 px-6 bg-[#c9a84c] text-black font-bebas text-xl text-center tracking-[4px] uppercase animate-pulse">
                    Cierre de elección: Fecha y hora a publicar
                </div>
            </div>

            {/* --- TABLA DE EJEMPLO --- */}
            <div className="space-y-4">
                <h4 className="font-barlow-condensed text-[#555] uppercase tracking-[4px] text-sm border-b border-[#222] pb-2">
                    Ejemplo de Lista de Jugadores Disponibles
                </h4>

                <div className="overflow-x-auto shadow-xl">
                    <table className="w-full text-left font-barlow-condensed border-collapse bg-[#0a0a0a]">
                        <thead>
                            <tr className="text-[#555] text-[10px] uppercase tracking-[2px] border-b border-[#1a1a1a]">
                                <th className="p-4">Jugador</th>
                                <th className="p-4">Ex Equipo</th>
                                <th className="p-4 text-center">Valor Mercado</th>
                                <th className="p-4 text-right">Sueldo (10%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1a1a]">
                            <tr className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-4 font-bold text-white uppercase group-hover:text-[#c9a84c]">Rodrygo</td>
                                <td className="p-4 text-gray-500 italic uppercase text-xs">Real Madrid</td>
                                <td className="p-4 text-center font-bebas text-xl text-[#27ae60]">$80.000.000</td>
                                <td className="p-4 text-right font-bebas text-xl text-orange-500/80">$8.000.000</td>
                            </tr>
                            <tr className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-4 font-bold text-white uppercase group-hover:text-[#c9a84c]">Marino</td>
                                <td className="p-4 text-gray-500 italic uppercase text-xs">Arsenal</td>
                                <td className="p-4 text-center font-bebas text-xl text-[#27ae60]">$15.000.000</td>
                                <td className="p-4 text-right font-bebas text-xl text-orange-500/80">$1.500.000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- CAJA DE COMENTARIOS / PEDIDOS --- */}
            <div className="space-y-6 pt-10 border-t border-[#222]">
                <div className="flex items-center justify-between">
                    <h4 className="font-bebas text-3xl text-[#c9a84c] tracking-[2px] uppercase">
                        Pedidos en Tiempo Real
                    </h4>
                    <span className="text-[10px] text-[#555] font-mono animate-pulse">LIVE CONNECTED</span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {comentarios.length === 0 ? (
                        <div className="py-10 text-center border border-[#1a1a1a] bg-[#050505]">
                            <p className="text-[#333] font-barlow-condensed uppercase tracking-widest italic text-sm">
                                No hay pedidos registrados aún. Esperá a la fecha de subastas!
                            </p>
                        </div>
                    ) : (
                        comentarios.map((c) => (
                            <div key={c.id} className="bg-[#111] border border-[#222] p-4 animate-fade-in border-l-4 border-l-[#c9a84c]">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[#c9a84c] font-bold text-xs uppercase tracking-widest">{c.usuario}</span>
                                    <span className="text-[10px] text-[#444] font-mono">
                                        {c.fecha?.toDate().toLocaleTimeString('es-AR')} - {c.fecha?.toDate().toLocaleDateString('es-AR')}
                                    </span>
                                </div>
                                <p className="text-white font-barlow-condensed text-xl uppercase tracking-tight">
                                    {c.texto}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* <form onSubmit={publicarPedido} className="space-y-4 bg-[#0a0a0a] p-6 border border-[#222]">
                    <div className="relative">
                        <label className="block text-[10px] text-[#555] uppercase mb-2 font-bold tracking-widest">Tu Pedido Oficial</label>
                        <textarea
                            required
                            value={nuevoPedido}
                            onChange={(e) => setNuevoPedido(e.target.value)}
                            placeholder="Escribe aquí (Ej: Rodrygo - Real Madrid)"
                            className="w-full bg-[#050505] border border-[#333] p-4 text-white font-barlow-condensed text-xl outline-none focus:border-[#c9a84c] transition-all min-h-[120px] resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={enviando}
                        className="w-full bg-[#c9a84c] text-black font-bebas text-2xl py-4 tracking-[5px] uppercase hover:bg-white transition-all disabled:opacity-50 shadow-lg"
                    >
                        {enviando ? "Procesando..." : "Publicar Pedido de Jugador"}
                    </button>
                    <p className="text-[10px] text-[#444] text-center italic uppercase">
                        * Al publicar, el pedido quedará registrado con la hora exacta del servidor.
                    </p>
                </form> */}
            </div>
        </div>
    );
}