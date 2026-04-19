"use client";
import { useState, useEffect } from "react";
import { db } from "../../src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    collection, addDoc, serverTimestamp, Timestamp, query,
    orderBy, onSnapshot, limit, getDocs, writeBatch, doc, updateDoc, increment
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

interface MercadoConfig {
    fichajesAbiertos: boolean;
    liberacionesAbiertas: boolean;
    fechaCierre: Timestamp | null;
}

export default function SeccionConfirmacion() {
    const [actionLoading, setActionLoading] = useState(false);
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [jugadoresDisponibles, setJugadoresDisponibles] = useState<{ id: string, nombre: string }[]>([]);
    const [mercado, setMercado] = useState<MercadoConfig>({
        fichajesAbiertos: false,
        liberacionesAbiertas: false,
        fechaCierre: null
    });

    const { isAdmin, userData, loading: authLoading } = useAuth();

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

    // Escuchar estado del mercado
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "configuracion", "mercado"), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setMercado({
                    fichajesAbiertos: !!data.fichajesAbiertos,
                    liberacionesAbiertas: !!data.liberacionesAbiertas,
                    fechaCierre: data.fechaCierre || null
                });
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const q = query(collection(db, "solicitudes_mercado"), orderBy("fecha", "desc"), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Solicitud[];
            setSolicitudes(data);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const cargarJugadores = async () => {
            if (!formData.vendedorId) {
                setJugadoresDisponibles([]);
                return;
            }
            try {
                const plantillaRef = collection(db, "equipos", formData.vendedorId, "plantilla");
                const querySnapshot = await getDocs(plantillaRef);
                const docs = querySnapshot.docs.map(d => ({
                    id: d.id,
                    nombre: d.data().nombre || d.data().jugador || d.id
                }));
                setJugadoresDisponibles(docs);
            } catch (error) { console.error("Error cargando plantilla:", error); }
        };
        cargarJugadores();
    }, [formData.vendedorId]);

    const responderSolicitud = async (id: string, nuevoEstado: string) => {
        setActionLoading(true);
        try {
            const docRef = doc(db, "solicitudes_mercado", id);
            await updateDoc(docRef, { estado: nuevoEstado });
        } catch (error) { console.error(error); }
        finally { setActionLoading(false); }
    };

    const limpiarHistorial = async () => {
        if (!confirm("⚠️ ¿BORRAR TODO EL HISTORIAL?")) return;
        setActionLoading(true);
        try {
            const batch = writeBatch(db);
            const snapshot = await getDocs(collection(db, "solicitudes_mercado"));
            snapshot.docs.forEach((d) => batch.delete(d.ref));
            await batch.commit();
        } catch (error) { console.error(error); }
        finally { setActionLoading(false); }
    };

    const ejecutarTraspasoFinal = async (sol: Solicitud) => {
        if (!confirm(`¿Ejecutar traspaso de ${sol.jugador}?`)) return;
        setActionLoading(true);
        const batch = writeBatch(db);
        try {
            const plantillaVendedorRef = collection(db, "equipos", sol.vendedorId, "plantilla");
            const snapshotVendedor = await getDocs(plantillaVendedorRef);
            const docJugador = snapshotVendedor.docs.find(d => d.id === sol.jugadorId);
            if (!docJugador) throw new Error("Jugador no encontrado");
            const datosJugador = docJugador.data();
            batch.set(doc(db, "equipos", sol.compradorId, "plantilla", sol.jugadorId), datosJugador);
            batch.delete(doc(db, "equipos", sol.vendedorId, "plantilla", sol.jugadorId));
            batch.update(doc(db, "equipos", sol.compradorId), { presupuesto: increment(-sol.monto) });
            batch.update(doc(db, "equipos", sol.vendedorId), { presupuesto: increment(sol.monto) });
            batch.update(doc(db, "solicitudes_mercado", sol.id), { estado: "completado" });
            await batch.commit();
        } catch (error) { console.error(error); }
        finally { setActionLoading(false); }
    };

    const enviarSolicitud = async (e: React.FormEvent) => {
        e.preventDefault();
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
            setFormData({ ...formData, jugadorId: "", jugadorNombre: "", monto: "" });
        } catch (error) { console.error(error); }
        finally { setActionLoading(false); }
    };

    if (authLoading) return <div className="text-center py-10 font-bebas text-[#c9a84c]">Sincronizando...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#27ae60] p-8 shadow-xl">
                {mercado.fichajesAbiertos ? (
                    <>
                        <h4 className="font-bebas text-3xl text-[#27ae60] mb-6 tracking-[2px] uppercase">Confirmar Operación</h4>
                        <form onSubmit={enviarSolicitud} className="space-y-4 font-barlow-condensed">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select required className="w-full bg-[#1a1a1a] p-2 text-white" value={formData.vendedorId} onChange={(e) => setFormData({ ...formData, vendedorId: e.target.value })}>
                                    <option value="">Vendedor...</option>
                                    {Object.entries(nombresEquipos).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
                                </select>
                                <select required className="w-full bg-[#1a1a1a] p-2 text-white" value={formData.compradorId} onChange={(e) => setFormData({ ...formData, compradorId: e.target.value })}>
                                    <option value="">Comprador...</option>
                                    {Object.entries(nombresEquipos).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select required disabled={!formData.vendedorId} className="w-full bg-[#1a1a1a] p-2 text-white" value={formData.jugadorId} onChange={(e) => setFormData({ ...formData, jugadorId: e.target.value, jugadorNombre: e.target.options[e.target.selectedIndex].text })}>
                                    <option value="">Jugador...</option>
                                    {jugadoresDisponibles.map((j) => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                                </select>
                                <input type="number" required value={formData.monto} placeholder="Monto" className="w-full bg-[#1a1a1a] p-2 text-[#27ae60]" onChange={(e) => setFormData({ ...formData, monto: e.target.value })} />
                            </div>
                            <button disabled={actionLoading} className="w-full bg-[#27ae60] text-black font-bold py-3 uppercase tracking-[3px] hover:bg-white transition-all">
                                {actionLoading ? "Enviando..." : "Enviar para Validación"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-10">
                        <h4 className="font-bebas text-3xl text-red-500 uppercase tracking-[2px]">Mercado Cerrado</h4>
                        <p className="text-[#888] font-barlow-condensed mt-2">Se encuentra inhabilitado hasta nuevo aviso.</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex justify-between border-b border-[#2a2a2a] pb-2">
                    <h5 className="font-barlow-condensed text-[#888] uppercase tracking-[4px] text-sm">Historial</h5>
                    {isAdmin && <button onClick={limpiarHistorial} className="text-[10px] text-red-500 uppercase font-bold">Borrar Todo</button>}
                </div>
                {solicitudes.map((sol) => (
                    <div key={sol.id} className={`bg-[#0f0f0f] border-l-2 p-4 flex justify-between border ${sol.estado === 'pendiente' ? 'border-l-[#c9a84c]' : 'border-l-[#27ae60]'}`}>
                        <div className="font-barlow-condensed text-sm text-white">
                            <span className="text-[#c9a84c]">{sol.vendedor}</span> ➔ {sol.jugador} ➔ <span className="text-[#c9a84c]">{sol.comprador}</span>
                        </div>
                        <div className="flex gap-2">
                            {sol.estado === 'pendiente' && userData?.equipoId === sol.vendedorId && (
                                <>
                                    <button onClick={() => responderSolicitud(sol.id, 'aprobado')} className="bg-green-600 px-2 text-[10px] text-white">OK</button>
                                    <button onClick={() => responderSolicitud(sol.id, 'rechazado')} className="bg-red-600 px-2 text-[10px] text-white">NO</button>
                                </>
                            )}
                            {isAdmin && sol.estado === 'aprobado' && (
                                <button onClick={() => ejecutarTraspasoFinal(sol)} className="bg-[#27ae60] px-2 text-[10px] text-black animate-pulse">EJECUTAR</button>
                            )}
                            <span className={`px-2 text-[9px] uppercase font-bold ${sol.estado === 'pendiente' ? 'bg-[#c9a84c]' : 'bg-blue-600'}`}>{sol.estado}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}