"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/hooks/useAuht";
import { db } from "@/src/lib/firebase";
import {
    collection, query, onSnapshot, doc, writeBatch,
    orderBy, where, updateDoc, setDoc, addDoc, serverTimestamp
} from "firebase/firestore";
import { Alert, Toast } from "@/src/lib/alerts";
import SeccionAdminMercado from "../components/SeccionAdminMercado";
import BandejaPostulaciones from "../components/BandejaPostulaciones";
import BandejaMercadoLibre from "../components/BandejaMercadoLibre";

// --- INTERFACES ---
interface Equipo { id: string; nombre: string; dt: string; dtUid?: string; estado: string; }
interface Seleccionado { id: string; uid: string; nombre: string; }
interface ConfigMercado { fichajesAbiertos: boolean; liberacionesAbiertas: boolean; }

export default function AdminPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();

    // ESTADOS GENERALES
    const [equiposOcupados, setEquiposOcupados] = useState<Equipo[]>([]);
    const [todosLosEquipos, setTodosLosEquipos] = useState<Equipo[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [seleccionado, setSeleccionado] = useState<Seleccionado | null>(null);
    const [configMercado, setConfigMercado] = useState<ConfigMercado>({
        fichajesAbiertos: false,
        liberacionesAbiertas: false
    });

    // ESTADOS FIXTURE LIGA
    const [fechaSel, setFechaSel] = useState(1);
    const [local, setLocal] = useState("");
    const [visita, setVisita] = useState("");

    // ESTADOS FIXTURE COPA
    const [rondaCopaSel, setRondaCopaSel] = useState(1);
    const [localCopa, setLocalCopa] = useState("");
    const [visitaCopa, setVisitaCopa] = useState("");

    useEffect(() => {
        if (!loading && !isAdmin) router.push("/");
    }, [isAdmin, loading, router]);

    useEffect(() => {
        if (!isAdmin) return;
        const qOcupados = query(collection(db, "equipos"), where("estado", "==", "Ocupado"), orderBy("nombre", "asc"));
        const unsubOcupados = onSnapshot(qOcupados, (snaps) => setEquiposOcupados(snaps.docs.map(d => ({ id: d.id, ...d.data() } as Equipo))));

        const qTodos = query(collection(db, "equipos"), orderBy("nombre", "asc"));
        const unsubTodos = onSnapshot(qTodos, (snaps) => setTodosLosEquipos(snaps.docs.map(d => ({ id: d.id, ...d.data() } as Equipo))));

        const unsubConfig = onSnapshot(doc(db, "configuracion", "mercado"), (docSnap) => {
            if (docSnap.exists()) setConfigMercado(docSnap.data() as ConfigMercado);
        });

        return () => { unsubOcupados(); unsubTodos(); unsubConfig(); };
    }, [isAdmin]);

    const guardarPartido = async () => {
        if (!local || !visita || local === visita) return Alert.fire("Error", "Selecciona equipos diferentes", "error");
        const lD = todosLosEquipos.find(e => e.id === local);
        const vD = todosLosEquipos.find(e => e.id === visita);
        await addDoc(collection(db, "partidos"), { fechaTorneo: Number(fechaSel), localId: local, localNombre: lD?.nombre, visitaId: visita, visitaNombre: vD?.nombre });
        Toast.fire({ icon: 'success', title: 'Cruce Liga registrado' });
    };

    const guardarCruceCopa = async () => {
        if (!localCopa || !visitaCopa || localCopa === visitaCopa) return Alert.fire("Error", "Selecciona equipos diferentes", "error");
        const lD = todosLosEquipos.find(e => e.id === localCopa);
        const vD = todosLosEquipos.find(e => e.id === visitaCopa);
        try {
            await addDoc(collection(db, "partidos_copa"), {
                ronda: Number(rondaCopaSel),
                localId: localCopa,
                localNombre: lD?.nombre,
                visitaId: visitaCopa,
                visitaNombre: vD?.nombre,
                fecha: serverTimestamp()
            });
            Toast.fire({ icon: 'success', title: 'Cruce Copa registrado' });
            setLocalCopa(""); setVisitaCopa("");
        } catch (e) { Alert.fire("Error", "No se pudo guardar la Copa", "error"); }
    };

    const toggleMercado = async (campo: keyof ConfigMercado) => {
        await updateDoc(doc(db, "configuracion", "mercado"), { [campo]: !configMercado[campo] });
    };

    const confirmarEliminacion = async () => {
        if (!seleccionado) return;
        const batch = writeBatch(db);
        batch.update(doc(db, "users", seleccionado.uid), { rol: "invitado", equipoId: null });
        batch.update(doc(db, "equipos", seleccionado.id), { estado: "Libre", dt: "Vacante", dtUid: null });
        await batch.commit();
        setModalOpen(false);
        Toast.fire({ icon: 'success', title: 'DT Destituido' });
    };

    if (loading || !isAdmin) return null;
    return (
        <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-10 font-barlow-condensed text-white">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* CABECERA */}
                <div className="border-l-4 border-[#c9a84c] pl-6 mb-10">
                    <h1 className="font-bebas text-6xl tracking-widest uppercase italic leading-none">Panel de <span className="text-[#c9a84c]">Comisionado</span></h1>
                    <p className="text-gray-500 uppercase tracking-[3px] italic text-sm">Administración Central El Legado</p>
                </div>

                {/* --- CARGA DE CRUCES (FIXTURE) --- */}
                <section className="bg-[#111] border border-[#222] p-8 shadow-2xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#c9a84c]"></div>
                        <h3 className="font-bebas text-4xl italic uppercase">Programar Partidos</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Jornada</label>
                            <select className="w-full bg-black border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all" value={fechaSel} onChange={e => setFechaSel(Number(e.target.value))}>
                                {Array.from({ length: 19 }, (_, i) => i + 1).map(f => <option key={f} value={f}>Fecha {f}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Equipo Local</label>
                            <select className="w-full bg-black border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all" value={local} onChange={e => setLocal(e.target.value)}>
                                <option value="">Seleccionar...</option>
                                {todosLosEquipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Equipo Visitante</label>
                            <select className="w-full bg-black border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all" value={visita} onChange={e => setVisita(e.target.value)}>
                                <option value="">Seleccionar...</option>
                                {todosLosEquipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={guardarPartido} className="w-full bg-[#c9a84c] text-black font-bebas text-3xl py-2 hover:bg-white transition-all uppercase italic shadow-lg">
                                + Guardar Cruce
                            </button>
                        </div>
                    </div>
                </section>

                <section className="bg-[#111] border border-[#222] p-8 space-y-6">
                    <h3 className="font-bebas text-4xl italic uppercase">Programar Copa</h3>
                    <div className="grid grid-cols-4 gap-6">
                        <select className="bg-black p-3" value={rondaCopaSel} onChange={e => setRondaCopaSel(Number(e.target.value))}>{[1, 2, 3, 4].map(r => <option key={r} value={r}>Ronda {r}</option>)}</select>
                        <select className="bg-black p-3" value={localCopa} onChange={e => setLocalCopa(e.target.value)}><option value="">Local...</option>{todosLosEquipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}</select>
                        <select className="bg-black p-3" value={visitaCopa} onChange={e => setVisitaCopa(e.target.value)}><option value="">Visita...</option>{todosLosEquipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}</select>
                        <button onClick={guardarCruceCopa} className="bg-[#c9a84c] text-black font-bebas text-2xl uppercase italic">Guardar Copa</button>
                    </div>
                </section>

                {/* --- VENTANA DE TRANSFERENCIAS --- */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-6 border-2 transition-all ${configMercado.fichajesAbiertos ? "bg-green-900/10 border-green-500" : "bg-red-900/10 border-red-500"}`}>
                        <h4 className="font-bebas text-2xl mb-2 uppercase italic">Mercado de Fichajes (Altas)</h4>
                        <button onClick={() => toggleMercado('fichajesAbiertos')} className={`w-full py-2 font-bebas text-xl tracking-widest ${configMercado.fichajesAbiertos ? "bg-green-600" : "bg-red-600"}`}>
                            {configMercado.fichajesAbiertos ? "ABIERTO" : "CERRADO"}
                        </button>
                    </div>
                    <div className={`p-6 border-2 transition-all ${configMercado.liberacionesAbiertas ? "bg-green-900/10 border-green-500" : "bg-red-900/10 border-red-500"}`}>
                        <h4 className="font-bebas text-2xl mb-2 uppercase italic">Ventana de Bajas (Liberar)</h4>
                        <button onClick={() => toggleMercado('liberacionesAbiertas')} className={`w-full py-2 font-bebas text-xl tracking-widest ${configMercado.liberacionesAbiertas ? "bg-green-600" : "bg-red-600"}`}>
                            {configMercado.liberacionesAbiertas ? "ABIERTO" : "CERRADO"}
                        </button>
                    </div>
                </section>

                <BandejaPostulaciones />
                <BandejaMercadoLibre />

                {/* --- STAFF TÉCNICO --- */}
                <section className="bg-[#111] border border-[#222] p-8 shadow-2xl">
                    <h3 className="font-bebas text-4xl text-white mb-8 italic uppercase border-b border-[#222] pb-4">Gestión de Staff Técnico</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {equiposOcupados.map((eq) => (
                            <div key={eq.id} className="bg-black border border-[#222] p-5 flex justify-between items-center group hover:border-[#c9a84c]/50 transition-all">
                                <div>
                                    <p className="font-bebas text-2xl text-white italic leading-none uppercase">{eq.nombre}</p>
                                    <p className="text-[#c9a84c] text-xs uppercase font-bold tracking-[2px] mt-2">DT: {eq.dt}</p>
                                </div>
                                <button onClick={() => {
                                    if (!eq.dtUid) return Alert.fire("Error", "Falta dtUid", "error");
                                    setSeleccionado({ id: eq.id, uid: eq.dtUid, nombre: eq.dt });
                                    setModalOpen(true);
                                }} className="bg-red-900/10 border border-red-600 text-red-600 px-4 py-2 font-bebas text-lg hover:bg-red-600 hover:text-white transition-all">DESTITUIR</button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="bg-[#111] border border-[#222] p-6 shadow-2xl">
                    <SeccionAdminMercado />
                </div>
            </div>

            {/* MODAL DE DESTITUCIÓN */}
            {modalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-[#111] border-2 border-red-600 p-8 max-w-md w-full shadow-2xl">
                        <h2 className="font-bebas text-4xl text-red-600 mb-4 italic uppercase tracking-widest text-center underline">Orden de Destitución</h2>
                        <p className="text-gray-300 text-center uppercase italic mb-8">¿Confirmar la salida inmediata de <span className="text-white font-bold">{seleccionado?.nombre}</span>?</p>
                        <div className="flex gap-4">
                            <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-600 text-gray-400 py-3 font-bebas text-2xl hover:bg-white/5">CANCELAR</button>
                            <button onClick={confirmarEliminacion} className="flex-1 bg-red-600 text-white py-3 font-bebas text-2xl hover:bg-red-700">CONFIRMAR</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}