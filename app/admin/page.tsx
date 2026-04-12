"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/hooks/useAuht";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, doc, writeBatch, orderBy, where, updateDoc, getDoc, setDoc } from "firebase/firestore";
import SeccionAdminMercado from "../components/SeccionAdminMercado";
import BandejaPostulaciones from "../components/BandejaPostulaciones";
import BandejaMercadoLibre from "../components/BandejaMercadoLibre";

interface Equipo { id: string; nombre: string; dt: string; dtUid?: string; estado: string; }

interface Seleccionado {
    id: string;
    uid: string;
    nombre: string;
}

// Interfaz para la configuración del mercado
interface ConfigMercado {
    fichajesAbiertos: boolean;
    liberacionesAbiertas: boolean;
}

export default function AdminPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();
    const [equiposOcupados, setEquiposOcupados] = useState<Equipo[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [seleccionado, setSeleccionado] = useState<Seleccionado | null>(null);

    // ESTADO DEL MERCADO
    const [configMercado, setConfigMercado] = useState<ConfigMercado>({
        fichajesAbiertos: false,
        liberacionesAbiertas: false
    });

    useEffect(() => {
        if (!loading && !isAdmin) router.push("/");
    }, [isAdmin, loading, router]);

    // 1. Cargar Staff y Configuración del Mercado
    useEffect(() => {
        if (!isAdmin) return;

        // Listener de Equipos
        const q = query(collection(db, "equipos"), where("estado", "==", "Ocupado"), orderBy("nombre", "asc"));
        const unsubEquipos = onSnapshot(q, (snaps) => {
            setEquiposOcupados(snaps.docs.map(d => ({ id: d.id, ...d.data() } as Equipo)));
        });

        // Listener de Configuración del Mercado
        const unsubConfig = onSnapshot(doc(db, "configuracion", "mercado"), (docSnap) => {
            if (docSnap.exists()) {
                setConfigMercado(docSnap.data() as ConfigMercado);
            } else {
                // Si no existe el doc, lo creamos por defecto
                setDoc(doc(db, "configuracion", "mercado"), { fichajesAbiertos: false, liberacionesAbiertas: false });
            }
        });

        return () => { unsubEquipos(); unsubConfig(); };
    }, [isAdmin]);

    // Función para togglear estados del mercado
    const toggleMercado = async (campo: keyof ConfigMercado) => {
        try {
            const nuevoEstado = !configMercado[campo];
            await updateDoc(doc(db, "configuracion", "mercado"), {
                [campo]: nuevoEstado
            });
        } catch (error) {
            console.error("Error al actualizar mercado:", error);
        }
    };

    const confirmarEliminacion = async () => {
        if (!seleccionado) return;
        try {
            const batch = writeBatch(db);
            batch.update(doc(db, "users", seleccionado.uid), { rol: "invitado", equipoId: null, nombreEquipo: null });
            batch.update(doc(db, "equipos", seleccionado.id), { estado: "Libre", dt: "Vacante", dtUid: null });
            await batch.commit();
            setModalOpen(false);
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-bebas text-[#c9a84c] text-2xl tracking-[5px] animate-pulse uppercase">Cargando Panel de Comisionado...</div>;
    if (!isAdmin) return null;

    return (
        <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-10 font-barlow-condensed">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="border-l-4 border-[#c9a84c] pl-6 mb-10">
                    <h1 className="font-bebas text-6xl text-white tracking-widest uppercase italic">Panel de Control</h1>
                    <p className="text-[#c9a84c] uppercase tracking-[3px] italic">Gestión Oficial El Legado</p>
                </div>

                {/* --- NUEVA SECCIÓN: CONTROL DE VENTANA DE TRANSFERENCIAS --- */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-6 border-2 transition-all ${configMercado.fichajesAbiertos ? "bg-green-900/10 border-green-500" : "bg-red-900/10 border-red-500"}`}>
                        <h4 className="font-bebas text-2xl text-white mb-2 uppercase italic">Mercado de Fichajes (Altas)</h4>
                        <p className="text-gray-400 text-xs uppercase mb-4">Permite a los DTs contratar jugadores libres</p>
                        <button
                            onClick={() => toggleMercado('fichajesAbiertos')}
                            className={`w-full py-2 font-bebas text-xl tracking-widest ${configMercado.fichajesAbiertos ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
                        >
                            {configMercado.fichajesAbiertos ? "ABIERTO" : "CERRADO"}
                        </button>
                    </div>

                    <div className={`p-6 border-2 transition-all ${configMercado.liberacionesAbiertas ? "bg-green-900/10 border-green-500" : "bg-red-900/10 border-red-500"}`}>
                        <h4 className="font-bebas text-2xl text-white mb-2 uppercase italic">Ventana de Bajas (Liberar)</h4>
                        <p className="text-gray-400 text-xs uppercase mb-4">Permite a los DTs despedir jugadores al mercado</p>
                        <button
                            onClick={() => toggleMercado('liberacionesAbiertas')}
                            className={`w-full py-2 font-bebas text-xl tracking-widest ${configMercado.liberacionesAbiertas ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
                        >
                            {configMercado.liberacionesAbiertas ? "ABIERTO" : "CERRADO"}
                        </button>
                    </div>
                </section>

                <BandejaPostulaciones />
                <BandejaMercadoLibre />
                <section className="bg-[#111] border border-[#222] p-6 shadow-2xl">
                    <h3 className="font-bebas text-3xl text-white mb-6 italic uppercase tracking-widest">Staff Técnico Actual</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {equiposOcupados.map((eq) => (
                            <div key={eq.id} className="bg-[#0a0a0a] border border-[#222] p-4 flex justify-between items-center hover:border-red-900/40 transition-all">
                                <div>
                                    <p className="font-bebas text-xl text-white italic leading-none">{eq.nombre}</p>
                                    <p className="text-[#c9a84c] text-[10px] uppercase font-bold tracking-widest mt-1">DT: {eq.dt}</p>
                                </div>
                                <button onClick={() => {
                                    if (!eq.dtUid) return alert("Falta dtUid en Firebase.");
                                    setSeleccionado({ id: eq.id, uid: eq.dtUid, nombre: eq.dt });
                                    setModalOpen(true);
                                }} className="bg-red-600/10 border border-red-600 text-red-600 px-3 py-1 font-bebas text-sm hover:bg-red-600 hover:text-white transition-all">ELIMINAR DT</button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="bg-[#111] border border-[#222] p-6 shadow-2xl"><SeccionAdminMercado /></div>
            </div>
            {/* MODAL PERSONALIZADO */}
            {modalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-[#111] border-2 border-red-600 p-8 max-w-md w-full shadow-2xl">
                        <h2 className="font-bebas text-4xl text-red-600 mb-4 italic uppercase tracking-widest text-center">Orden de Destitución</h2>
                        <p className="text-gray-300 text-center uppercase italic mb-8">¿Confirmar la salida de <span className="text-white font-bold">{seleccionado?.nombre}</span>?</p>
                        <div className="flex gap-4">
                            <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-600 text-gray-400 py-3 font-bebas text-2xl">CANCELAR</button>
                            <button onClick={confirmarEliminacion} className="flex-1 bg-red-600 text-white py-3 font-bebas text-2xl">CONFIRMAR</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}