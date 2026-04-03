"use client";
import { useState, useEffect } from "react";
import { db } from "../../src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht"; // Importamos el nuevo hook unificado
import {
    collection, addDoc, serverTimestamp, Timestamp, query,
    orderBy, onSnapshot, limit, getDocs, writeBatch
} from "firebase/firestore";

interface Solicitud {
    id: string;
    vendedor: string;
    vendedorId: string;
    comprador: string;
    compradorId: string;
    jugador: string;
    jugadorId: string;
    monto: number;
    estado: string;
    fecha?: Timestamp;
}

export default function SeccionConfirmacion() {
    const [actionLoading, setActionLoading] = useState(false); // Estado para acciones de escritura
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [jugadoresDisponibles, setJugadoresDisponibles] = useState<{ id: string, nombre: string }[]>([]);

    // Obtenemos isAdmin y el estado de carga inicial del hook unificado
    const { isAdmin, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        vendedorId: "",
        compradorId: "",
        jugadorId: "",
        jugadorNombre: "",
        monto: ""
    });

    const nombresEquipos: { [key: string]: string } = {
        "2AjdhgQFwREgnIzBCTkP": "Atlético Madrid",
        "GQ41Ko4MraLoiJbq513V": "Bayern Munich",
        "HEQURpQsdS52vvXcL5Gg": "FC Barcelona",
        "WWr9ccpXkkCvL6Dui2mL": "Real Madrid",
        "tMnqqCGy94fat8wuoptN": "Arsenal FC",
        "IE1fGQSSR0puLGHi8SDg": "Inter de Milán",
        "9WbXcjd054kZhJgu5kVm": "Borussia Dortmund",
        "Yz0oaNDdA3GoyjCY4GBn": "PSG",
        "pndGnmn5Wga0QCk9tdHn": "Liverpool FC",
        "L0L2W9YM57K2Vqp6kpAj": "Manchester City"
    };

    // 1. ESCUCHAR FEED DE ACTIVIDAD
    useEffect(() => {
        const q = query(collection(db, "solicitudes_mercado"), orderBy("fecha", "desc"), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Solicitud[];
            setSolicitudes(data);
        });
        return () => unsubscribe();
    }, []);

    // 2. CARGAR JUGADORES CUANDO CAMBIA EL VENDEDOR
    useEffect(() => {
        const cargarJugadores = async () => {
            if (!formData.vendedorId) {
                setJugadoresDisponibles([]);
                return;
            }
            try {
                const querySnapshot = await getDocs(collection(db, `equipos/${formData.vendedorId}/plantilla`));
                const docs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    nombre: doc.data().nombre || doc.id
                }));
                setJugadoresDisponibles(docs);
            } catch (error) {
                console.error("Error cargando plantilla:", error);
            }
        };
        cargarJugadores();
    }, [formData.vendedorId]);

    // 3. FUNCIÓN PARA BORRAR TODO EL HISTORIAL (SOLO ADMIN)
    const limpiarHistorial = async () => {
        const confirmar = confirm("⚠️ ¿ESTÁS SEGURO? Se borrarán todas las solicitudes del historial permanentemente.");
        if (!confirmar) return;

        setActionLoading(true);
        try {
            const batch = writeBatch(db);
            const snapshot = await getDocs(collection(db, "solicitudes_mercado"));
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
            alert("Historial limpiado.");
        } catch (error) {
            console.error("Error al borrar:", error);
            alert("No tienes permisos para borrar.");
        } finally {
            setActionLoading(false);
        }
    };

    const enviarSolicitud = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.vendedorId === formData.compradorId) {
            alert("No puedes transferir jugadores al mismo equipo.");
            return;
        }

        setActionLoading(true);
        try {
            await addDoc(collection(db, "solicitudes_mercado"), {
                vendedorId: formData.vendedorId,
                vendedor: nombresEquipos[formData.vendedorId],
                compradorId: formData.compradorId,
                comprador: nombresEquipos[formData.compradorId],
                jugadorId: formData.jugadorId,
                jugador: formData.jugadorNombre,
                monto: Number(formData.monto),
                estado: "pendiente",
                fecha: serverTimestamp()
            });
            setFormData({ vendedorId: "", compradorId: "", jugadorId: "", jugadorNombre: "", monto: "" });
        } catch (error) {
            console.error("Error:", error);
            alert("Error al enviar la solicitud.");
        } finally {
            setActionLoading(false);
        }
    };

    // Si el hook de auth todavía está cargando, mostramos un estado neutro
    if (authLoading) return <div className="text-center py-10 font-bebas text-[#c9a84c] animate-pulse">Sincronizando...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            {/* FORMULARIO */}
            <div className="bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#27ae60] p-8 shadow-xl">
                <h4 className="font-bebas text-3xl text-[#27ae60] mb-6 tracking-[2px] uppercase text-center md:text-left">
                    Confirmar Operación
                </h4>
                <form onSubmit={enviarSolicitud} className="space-y-4 font-barlow-condensed">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-[#888] uppercase mb-1 font-bold tracking-widest">Vendedor (Origen)</label>
                            <select
                                required
                                className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]"
                                value={formData.vendedorId}
                                onChange={(e) => setFormData({ ...formData, vendedorId: e.target.value, jugadorId: "" })}
                            >
                                <option value="">Seleccionar equipo...</option>
                                {Object.entries(nombresEquipos).map(([id, nombre]) => (
                                    <option key={id} value={id}>{nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] text-[#888] uppercase mb-1 font-bold tracking-widest">Comprador (Destino)</label>
                            <select
                                required
                                className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]"
                                value={formData.compradorId}
                                onChange={(e) => setFormData({ ...formData, compradorId: e.target.value })}
                            >
                                <option value="">Seleccionar equipo...</option>
                                {Object.entries(nombresEquipos).map(([id, nombre]) => (
                                    <option key={id} value={id}>{nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-[#888] uppercase mb-1 font-bold tracking-widest">Seleccionar Jugador</label>
                            <select
                                required
                                disabled={!formData.vendedorId}
                                className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c] disabled:opacity-50"
                                value={formData.jugadorId}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    jugadorId: e.target.value,
                                    jugadorNombre: e.target.options[e.target.selectedIndex].text
                                })}
                            >
                                <option value="">{formData.vendedorId ? "Elegir de la plantilla..." : "Primero elige vendedor"}</option>
                                {jugadoresDisponibles.map((jug) => (
                                    <option key={jug.id} value={jug.id}>{jug.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] text-[#888] uppercase mb-1 font-bold tracking-widest">Monto ($)</label>
                            <input
                                type="number"
                                required
                                value={formData.monto}
                                placeholder="Ej: 15000000"
                                className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-[#27ae60] font-bold outline-none focus:border-[#c9a84c]"
                                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={actionLoading}
                        className={`w-full font-bold py-3 uppercase tracking-[3px] transition-all ${actionLoading ? "bg-gray-600" : "bg-[#27ae60] text-black hover:bg-white"}`}
                    >
                        {actionLoading ? "Enviando..." : "Enviar para Validación"}
                    </button>
                </form>
            </div>

            {/* FEED DE ACTIVIDAD */}
            <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-[#2a2a2a] pb-2">
                    <h5 className="font-barlow-condensed text-[#888] uppercase tracking-[4px] text-sm">
                        Historial de Solicitudes
                    </h5>
                    {isAdmin && (
                        <button
                            onClick={limpiarHistorial}
                            disabled={actionLoading}
                            className="text-[10px] bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-900 px-3 py-1 transition-all uppercase font-bold tracking-widest disabled:opacity-50"
                        >
                            {actionLoading ? "Limpiando..." : "Limpiar Historial"}
                        </button>
                    )}
                </div>

                <div className="grid gap-3">
                    {solicitudes.map((sol) => (
                        <div key={sol.id} className="bg-[#0f0f0f] border-l-2 border-[#27ae60] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in border border-[#1a1a1a]">
                            <div className="font-barlow-condensed text-sm md:text-base">
                                <span className="text-[#c9a84c] font-bold uppercase">{sol.vendedor}</span>
                                <span className="text-[#444] mx-2 font-bebas">➔</span>
                                <span className="text-white font-bold uppercase">{sol.jugador}</span>
                                <span className="text-[#444] mx-2 font-bebas tracking-tighter italic">AL</span>
                                <span className="text-[#c9a84c] font-bold uppercase">{sol.comprador}</span>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-[#1a1a1a] pt-2 md:pt-0">
                                <span className="text-[#27ae60] font-bebas text-xl md:text-2xl">${sol.monto?.toLocaleString()}</span>
                                <span className={`text-[9px] px-3 py-1 rounded-sm uppercase font-bold tracking-widest ${sol.estado === 'pendiente' ? 'bg-[#c9a84c] text-black' : (sol.estado === 'aprobado' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white')}`}>
                                    {sol.estado}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}