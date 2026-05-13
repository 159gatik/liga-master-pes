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
    usuario: string;
    texto: string;
    fecha: Timestamp;
    estado: string;
}

interface MercadoConfig {
    fichajesAbiertos: boolean;
    liberacionesAbiertas: boolean;
    fechaCierre: Timestamp;
}

interface JugadorLibre {
    id: string;
    nombre: string;
    pos: string;
    exEquipo: string;
    valor?: number;
    tipo: string; // Ej: "Agente Libre" o "Cedible"
    fechaLiberacion: Timestamp;
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
    const [jugadoresLibres, setJugadoresLibres] = useState<JugadorLibre[]>([]);
    const [pedidosEnVivo, setPedidosEnVivo] = useState<any[]>([]);
    useEffect(() => {
        // Escuchamos los últimos 10 pedidos que entren, sin importar el estado
        const q = query(
            collection(db, "pedidos_libres"),
            orderBy("fecha", "desc"),
            limit(10)
        );
        return onSnapshot(q, (snapshot) => {
            setPedidosEnVivo(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, []);
    // 1. Cargar Jugadores Libres
    useEffect(() => {
        const q = query(
            collection(db, "jugadores_libres"),
            orderBy("fechaLiberacion", "desc")
        );
        return onSnapshot(q, (snap) => {
            setJugadoresLibres(snap.docs.map(d => ({ id: d.id, ...d.data() } as JugadorLibre)));
        });
    }, []);

    // 2. Escuchar Configuración de Mercado
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "configuracion", "mercado"), (docSnap) => {
            if (docSnap.exists()) {
                setMercado(docSnap.data() as MercadoConfig);
            }
        });
        return () => unsub();
    }, []);

    // 3. Escuchar Fichajes Oficializados
    useEffect(() => {
        const q = query(collection(db, "pedidos_libres"), where("estado", "==", "aceptado"), orderBy("fecha", "desc"), limit(20));
        return onSnapshot(q, (snapshot) => {
            setConfirmados(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FichajeConfirmado)));
        });
    }, []);

    // Función para auto-completar el formulario al hacer click en un jugador
    const seleccionarJugador = (j: JugadorLibre) => {
        if (!mercado.fichajesAbiertos) return;
        setNuevoPedido(`${j.nombre} - ${j.exEquipo}`);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube al formulario
    };

    const enviarSolicitud = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoPedido.trim() || !user) return;

        setEnviando(true);
        try {
            await addDoc(collection(db, "pedidos_libres"), {
                usuario: userData?.nombreEquipo || "Sin Equipo",
                dtNombre: userData?.nombre || user.displayName,
                uid: user.uid,
                texto: nuevoPedido.toUpperCase(),
                fecha: serverTimestamp(),
                estado: "pendiente"
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
        <div className="max-w-5xl mx-auto space-y-10 pb-20 font-barlow-condensed animate-fadeIn">

            {/* --- FORMULARIO / REGLAMENTO --- */}
            {user && userData?.equipoId && (
                <div className="bg-[#111] p-8 border-t-4 border-[#c9a84c] shadow-2xl">
                    {mercado.fichajesAbiertos ? (
                        <>
                            <div className="mb-6">
                                <h4 className="font-bebas text-4xl text-white italic uppercase tracking-tighter">Solicitar <span className="text-[#c9a84c]">Fichaje</span></h4>
                                <p className="text-gray-500 text-xs uppercase tracking-[3px]">Seleccioná un jugador de la lista o escribí su nombre</p>
                            </div>
                            <form onSubmit={enviarSolicitud} className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    value={nuevoPedido}
                                    onChange={(e) => setNuevoPedido(e.target.value)}
                                    placeholder="NOMBRE DEL JUGADOR - CLUB ORIGEN"
                                    className="flex-1 bg-black border border-[#333] p-4 text-white uppercase text-lg focus:border-[#c9a84c] outline-none italic"
                                    required
                                />
                                <button disabled={enviando} className="bg-[#c9a84c] text-black font-bebas px-12 py-4 text-2xl hover:bg-white transition-all disabled:opacity-50 skew-x-[-15deg]">
                                    <span className="inline-block skew-x-[15deg]">{enviando ? "PROCESANDO..." : "ENVIAR PEDIDO"}</span>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="space-y-8">
                            <div className="text-center pb-6 border-b border-white/5">
                                <h4 className="font-bebas text-5xl text-red-600 uppercase italic leading-none">Mercado de Pases Cerrado</h4>
                                <p className="text-gray-500 mt-2 tracking-[4px] text-[10px] uppercase font-bold">Las transferencias no están permitidas en este momento</p>
                            </div>

                            {/* CUADRO INFORMATIVO DE REGLAS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-4">
                                    <h5 className="font-bebas text-2xl text-[#c9a84c] uppercase tracking-widest italic">Reglamento de Agentes Libres</h5>
                                    <ul className="space-y-3">
                                        <li className="flex gap-3 items-start">
                                            <p className="text-gray-400 text-sm uppercase font-bold leading-tight">Los jugadores libres solo podrán contratarse cuando el mercado esté <span className="text-white">abierto</span>.</p>
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <p className="text-gray-400 text-sm uppercase font-bold leading-tight">Para contratar, el DT deberá abonar el <span className="text-white">valor del sueldo</span> del jugador.</p>
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <p className="text-gray-400 text-sm uppercase font-bold leading-tight">Cupo máximo permitido: <span className="text-white">2 jugadores libres</span> por equipo.</p>
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <p className="text-gray-400 text-sm uppercase font-bold leading-tight">Contrato garantizado por <span className="text-white">1 año (2 torneos)</span>.</p>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-black/50 border border-[#c9a84c]/20 p-6 skew-x-[-1deg]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-1 h-6 bg-red-600"></div>
                                        <h6 className="font-bebas text-xl text-white uppercase tracking-widest">Protocolo Obligatorio</h6>
                                    </div>
                                    <p className="text-xs text-gray-500 uppercase font-bold italic leading-relaxed">
                                        Es obligatorio redactar el informe con los demás movimientos del mercado en su respectivo <span className="text-[#c9a84c]">despacho oficial</span> para que el comité procese la validez del fichaje.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* JUGADORES DISPONIBLES */}
            <div className="space-y-6">
                <div className="flex items-end justify-between border-b border-white/10 pb-2">
                    <h4 className="font-bebas text-5xl text-white italic uppercase tracking-tighter">
                        Jugadores <span className="text-[#c9a84c]">Disponibles</span>
                    </h4>
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest pb-1">
                        {jugadoresLibres.length} Opciones en cartera
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jugadoresLibres.length === 0 ? (
                        <p className="text-gray-600 italic">Buscando jugadores disponibles...</p>
                    ) : (
                        jugadoresLibres.map((j) => (
                            <div
                                key={j.id}
                                onClick={() => seleccionarJugador(j)}
                                className={`bg-[#0d0d0d] border border-[#222] p-5 flex flex-col justify-between group transition-all cursor-pointer ${mercado.fichajesAbiertos ? 'hover:border-[#c9a84c] hover:bg-[#111]' : 'opacity-70'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-white/5 px-2 py-0.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest border border-white/5">
                                        {j.pos}
                                    </span>
                                    <span className="text-[9px] text-[#c9a84c] font-bold uppercase italic tracking-tighter">
                                        {j.tipo}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <h5 className="text-white font-bebas text-3xl uppercase tracking-tighter group-hover:text-[#c9a84c] transition-colors leading-none">
                                        {j.nombre}
                                    </h5>
                                    <p className="text-gray-600 text-[10px] uppercase font-bold mt-1">Ex {j.exEquipo}</p>
                                </div>

                                <div className="pt-3 border-t border-white/5 flex justify-between items-end">
                                    <div className="text-[9px] text-gray-700 uppercase">Valor de Mercado</div>
                                    <div className="text-[#c9a84c] font-bebas text-2xl leading-none">
                                        ${j.valor?.toLocaleString() || "---"}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* FICHAJES CONFIRMADOS */}
            <div className="space-y-6 pt-10 border-t border-white/5">
                <h4 className="font-bebas text-4xl text-white italic uppercase tracking-tighter">
                    Boletín <span className="text-[#27ae60]">Oficial</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {confirmados.map((c) => (
                        <div key={c.id} className="bg-black/40 border border-[#222] p-4 flex items-center justify-between group hover:border-[#27ae60] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#27ae60]/10 border border-[#27ae60]/20 flex items-center justify-center font-bebas text-[#27ae60] text-xl">✓</div>
                                <div>
                                    <p className="text-gray-600 text-[9px] uppercase font-bold">{c.usuario} incorporó a:</p>
                                    <p className="text-white font-bebas text-2xl uppercase tracking-tighter group-hover:text-[#27ae60] leading-none">{c.texto}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[8px] text-gray-700 block uppercase font-bold tracking-widest">
                                    {c.fecha?.toDate().toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* --- MONITOR DE PEDIDOS EN TIEMPO REAL --- */}
            <div className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex items-end justify-between border-b border-white/10 pb-2">
                    <h4 className="font-bebas text-4xl text-white italic uppercase tracking-tighter">
                        Monitor de <span className="text-blue-500">Solicitudes</span>
                    </h4>
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest pb-1 animate-pulse">
                        • En Vivo
                    </span>
                </div>

                <div className="bg-black/20 border border-white/5 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-[#c9a84c] font-bebas text-xl uppercase tracking-widest">
                                <th className="p-4 font-normal">Hora Exacta</th>
                                <th className="p-4 font-normal">Club Solicitante</th>
                                <th className="p-4 font-normal">Jugador / Pedido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {pedidosEnVivo.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-gray-600 italic">
                                        No hay solicitudes recientes en el monitor.
                                    </td>
                                </tr>
                            ) : (
                                pedidosEnVivo.map((p) => (
                                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4">
                                            <span className="text-blue-500 font-mono text-xs font-bold">
                                                {p.fecha?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                            <p className="text-[9px] text-gray-700 uppercase mt-1">
                                                {p.fecha?.toDate().toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white font-bold text-sm uppercase group-hover:text-[#c9a84c] transition-colors">
                                                {p.usuario}
                                            </p>
                                            <p className="text-[10px] text-gray-600 italic">DT: {p.dtNombre}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-gray-300 font-bebas text-xl uppercase tracking-wider">
                                                {p.texto}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}