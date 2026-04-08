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

export default function SeccionConfirmacion() {
    const [actionLoading, setActionLoading] = useState(false);
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [jugadoresDisponibles, setJugadoresDisponibles] = useState<{ id: string, nombre: string }[]>([]);

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
                const docs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    nombre: doc.data().nombre || doc.data().jugador || doc.id
                }));
                setJugadoresDisponibles(docs);
            } catch (error) {
                console.error("Error cargando plantilla:", error);
            }
        };
        cargarJugadores();
    }, [formData.vendedorId]);

    // --- NUEVA FUNCIÓN: VISTO BUENO DEL DT VENDEDOR ---
    const responderSolicitud = async (id: string, nuevoEstado: string) => {
        setActionLoading(true);
        try {
            const docRef = doc(db, "solicitudes_mercado", id);
            await updateDoc(docRef, { estado: nuevoEstado });
            alert(`Operación ${nuevoEstado === 'aprobado' ? 'Aceptada' : 'Rechazada'}`);
        } catch (error) {
            console.error("Error al actualizar:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const limpiarHistorial = async () => {
        const confirmar = confirm("⚠️ ¿BORRAR TODO EL HISTORIAL?");
        if (!confirmar) return;
        setActionLoading(true);
        try {
            const batch = writeBatch(db);
            const snapshot = await getDocs(collection(db, "solicitudes_mercado"));
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
        } catch (error) { console.error(error); }
        finally { setActionLoading(false); }
    };
    // --- FUNCIÓN DE EJECUCIÓN REAL (PARA EL ADMIN) ---
    const ejecutarTraspasoFinal = async (sol: Solicitud) => {
        const confirmar = confirm(`¿Ejecutar traspaso de ${sol.jugador}?`);
        if (!confirmar) return;

        setActionLoading(true);
        const batch = writeBatch(db);

        try {
            // 1. Obtener los datos del jugador desde la plantilla del vendedor
            const plantillaVendedorRef = collection(db, "equipos", sol.vendedorId, "plantilla");
            const snapshotVendedor = await getDocs(plantillaVendedorRef);
            const docJugador = snapshotVendedor.docs.find(d => d.id === sol.jugadorId);

            if (!docJugador) {
                alert("Error: No se encontró al jugador en el equipo origen.");
                setActionLoading(false);
                return;
            }

            const datosJugador = docJugador.data();

            // 2. CREAR el jugador en el equipo comprador
            const nuevoJugadorRef = doc(db, "equipos", sol.compradorId, "plantilla", sol.jugadorId);
            batch.set(nuevoJugadorRef, datosJugador);

            // 3. BORRAR el jugador del equipo vendedor
            const antiguoJugadorRef = doc(db, "equipos", sol.vendedorId, "plantilla", sol.jugadorId);
            batch.delete(antiguoJugadorRef);

            // 4. ACTUALIZAR PRESUPUESTOS (Usando increment)
            const compradorRef = doc(db, "equipos", sol.compradorId);
            const vendedorRef = doc(db, "equipos", sol.vendedorId);
            batch.update(compradorRef, { presupuesto: increment(-sol.monto) });
            batch.update(vendedorRef, { presupuesto: increment(sol.monto) });

            // 5. MARCAR SOLICITUD COMO COMPLETADA
            const solRef = doc(db, "solicitudes_mercado", sol.id);
            batch.update(solRef, { estado: "completado" });

            await batch.commit();
            alert("¡Operación completada con éxito!");

        } catch (error) {
            console.error("Error crítico:", error);
            alert("Error en la base de datos.");
        } finally {
            setActionLoading(false);
        }
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



    if (authLoading) return <div className="text-center py-10 font-bebas text-[#c9a84c] animate-pulse">Sincronizando...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            {/* FORMULARIO */}
            <div className="bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#27ae60] p-8 shadow-xl">
                <h4 className="font-bebas text-3xl text-[#27ae60] mb-6 tracking-[2px] uppercase">Confirmar Operación</h4>
                <form onSubmit={enviarSolicitud} className="space-y-4 font-barlow-condensed">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-[#888] uppercase mb-1 font-bold">Vendedor</label>
                            <select required className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]" value={formData.vendedorId} onChange={(e) => setFormData({ ...formData, vendedorId: e.target.value, jugadorId: "" })}>
                                <option value="">Seleccionar equipo...</option>
                                {Object.entries(nombresEquipos).map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] text-[#888] uppercase mb-1 font-bold">Comprador</label>
                            <select required className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]" value={formData.compradorId} onChange={(e) => setFormData({ ...formData, compradorId: e.target.value })}>
                                <option value="">Seleccionar equipo...</option>
                                {Object.entries(nombresEquipos).map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-[#888] uppercase mb-1 font-bold">Jugador</label>
                            <select required disabled={!formData.vendedorId} className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white disabled:opacity-50" value={formData.jugadorId} onChange={(e) => setFormData({ ...formData, jugadorId: e.target.value, jugadorNombre: e.target.options[e.target.selectedIndex].text })}>
                                <option value="">Elegir...</option>
                                {jugadoresDisponibles.map((jug) => <option key={jug.id} value={jug.id}>{jug.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] text-[#888] uppercase mb-1 font-bold">Monto ($)</label>
                            <input type="number" required value={formData.monto} placeholder="Monto" className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-[#27ae60] font-bold" onChange={(e) => setFormData({ ...formData, monto: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" disabled={actionLoading} className={`w-full font-bold py-3 uppercase tracking-[3px] ${actionLoading ? "bg-gray-600" : "bg-[#27ae60] text-black hover:bg-white transition-all"}`}>
                        {actionLoading ? "Enviando..." : "Enviar para Validación"}
                    </button>
                </form>
            </div>

            {/* FEED CON BOTONES DE ACCIÓN */}
            <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-[#2a2a2a] pb-2">
                    <h5 className="font-barlow-condensed text-[#888] uppercase tracking-[4px] text-sm">Historial y Decisiones</h5>
                    {isAdmin && <button onClick={limpiarHistorial} className="text-[10px] text-red-500 uppercase font-bold tracking-widest">Borrar Todo</button>}
                </div>

                <div className="grid gap-3">
                    {solicitudes.map((sol) => (
                        <div key={sol.id} className={`bg-[#0f0f0f] border-l-2 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#1a1a1a] ${sol.estado === 'pendiente' ? 'border-l-[#c9a84c]' : 'border-l-[#27ae60]'}`}>
                            <div className="font-barlow-condensed text-sm">
                                <span className="text-[#c9a84c] font-bold">{sol.vendedor}</span>
                                <span className="text-[#444] mx-2">➔</span>
                                <span className="text-white font-bold">{sol.jugador}</span>
                                <span className="text-[#444] mx-2 font-bebas tracking-tighter italic text-[10px]">AL</span>
                                <span className="text-[#c9a84c] font-bold">{sol.comprador}</span>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-4">
                                <span className="text-[#27ae60] font-bebas text-xl md:text-2xl">
                                    ${sol.monto?.toLocaleString()}
                                </span>

                                {/* BOTONES DE ACCIÓN PARA EL VENDEDOR (Solo si está pendiente) */}
                                {sol.estado === 'pendiente' && userData?.equipoId === sol.vendedorId && (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => responderSolicitud(sol.id, 'aprobado')}
                                            className="bg-green-600 text-white px-3 py-1 text-[10px] font-bold uppercase hover:bg-green-500 transition-colors"
                                        >
                                            Dar OK
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => responderSolicitud(sol.id, 'rechazado')}
                                            className="bg-red-600 text-white px-3 py-1 text-[10px] font-bold uppercase hover:bg-red-500 transition-colors"
                                        >
                                            No
                                        </button>
                                    </div>
                                )}

                                {/* BOTÓN DE EJECUCIÓN FINAL (Solo para el Admin y si ya está aprobado) */}
                                {isAdmin && sol.estado === 'aprobado' && (
                                    <button
                                        type="button"
                                        onClick={() => ejecutarTraspasoFinal(sol)}
                                        className="bg-[#27ae60] text-black px-4 py-1 text-[10px] font-black uppercase hover:bg-white transition-all animate-pulse border border-white/20 shadow-[0_0_15px_rgba(39,174,96,0.3)]"
                                    >
                                        Ejecutar Traspaso ⚡
                                    </button>
                                )}

                                {/* ETIQUETA DE ESTADO DINÁMICA */}
                                <span className={`text-[9px] px-3 py-1 rounded-sm uppercase font-bold tracking-widest ${sol.estado === 'pendiente' ? 'bg-[#c9a84c] text-black' :
                                    sol.estado === 'aprobado' ? 'bg-blue-600 text-white' :
                                        sol.estado === 'completado' ? 'bg-indigo-700 text-white border border-indigo-400' :
                                            'bg-red-600 text-white'
                                    }`}>
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