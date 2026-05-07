"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    Timestamp,
    doc,
    deleteDoc
} from "firebase/firestore";
import { Alert, Toast } from "@/src/lib/alerts";

interface Reporte {
    id: string;
    dt: string;
    equipo: string;
    motivo: string;
    fecha: Timestamp;
}

export default function AusenciasPage() {
    const { user, userData, isAdmin } = useAuth(); // Agregamos 'user' para el UID
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const formularioRef = useRef<HTMLDivElement>(null);

    // Estados para el formulario
    const [motivo, setMotivo] = useState("");
    const [enviando, setEnviando] = useState(false);

    // Cargar reportes en tiempo real
    useEffect(() => {
        const q = query(collection(db, "reportes_ausencias"), orderBy("fecha", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setReportes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reporte)));
        });
        return () => unsub();
    }, []);

    const scrollToEditor = () => {
        formularioRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const borrarReporte = async (id: string) => {
        const confirmacion = await Alert.fire({
            title: "¿Eliminar reporte?",
            text: "Esta acción quitará el aviso del muro del comité.",
            icon: "warning",
            showCancelButton: true, // Corregido a minúscula
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#333",
            confirmButtonText: "Sí, borrar",
            cancelButtonText: "Cancelar"
        });

        if (confirmacion.isConfirmed) {
            try {
                await deleteDoc(doc(db, "reportes_ausencias", id));
                Toast.fire({ icon: 'success', title: 'Reporte eliminado' });
            } catch (error) {
                Alert.fire("Error", "No se pudo eliminar", "error");
            }
        }
    };

    const publicarReporte = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!motivo.trim()) {
            return Alert.fire("Error", "Debes explicar el motivo de la ausencia", "error");
        }

        setEnviando(true);
        try {
            await addDoc(collection(db, "reportes_ausencias"), {
                motivo: motivo.trim(),
                dt: userData?.nombre || "DT Oficial",
                equipo: userData?.nombreEquipo || "Sin Equipo",
                uid: user?.uid, // Corregido: usamos 'user' directamente
                fecha: serverTimestamp(),
                estado: "pendiente"
            });

            setMotivo("");
            Toast.fire({ icon: 'success', title: 'Reporte lanzado al comité' });
        } catch (error) {
            console.error(error);
            Alert.fire("Error", "No se pudo enviar el reporte.", "error");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-barlow-condensed pt-32">
            <div className="max-w-5xl mx-auto space-y-16">

                {/* CABECERA (Espejo de Noticias pero Rojo) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-4 border-red-600 pl-8 py-2">
                    <div>
                        <h1 className="font-bebas text-8xl italic uppercase leading-[0.8] tracking-tighter">
                            Comité <span className="text-red-600">Disciplinario</span>
                        </h1>
                        <p className="text-gray-500 tracking-[6px] uppercase italic text-sm mt-4 font-bold">
                            Muro de Ausencias · Abandonos · El Legado
                        </p>
                    </div>

                    {(isAdmin || userData?.rol === "dt") && (
                        <button
                            onClick={scrollToEditor}
                            className="bg-red-600 text-white font-bebas text-3xl px-8 py-3 italic hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_rgba(220,38,38,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                        >
                            + Notificar Ausencia
                        </button>
                    )}
                </div>

                {/* FEED DE REPORTES */}
                <div className="space-y-12">
                    {reportes.length > 0 ? reportes.map((rep) => (
                        <article key={rep.id} className="bg-[#0f0f0f] border border-white/5 shadow-2xl animate-fadeIn group overflow-hidden relative">

                            {/* Borrado para Admins */}
                            {isAdmin && (
                                <button
                                    onClick={() => borrarReporte(rep.id)}
                                    className="absolute top-3 right-3 z-20 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-3 py-1 text-[10px] font-bold uppercase transition-all border border-red-600/30"
                                >
                                    Eliminar Reporte
                                </button>
                            )}

                            <div className="bg-[#161616] px-6 py-3 border-b border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <span className="bg-red-600 text-white px-4 py-0.5 font-bebas text-xl italic shadow-sm">
                                        {rep.equipo}
                                    </span>
                                    <span className="text-gray-500 text-[11px] uppercase font-bold tracking-[3px]">
                                        {rep.fecha?.toDate().toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>

                            <div className="p-10 md:p-14">
                                <p className="font-barlow text-2xl md:text-3xl leading-relaxed italic text-gray-300">
                                    "{rep.motivo}"
                                </p>
                            </div>

                            <div className="bg-[#0a0a0a] p-6 border-t border-white/5">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-[#1a1a1a] border border-red-600/20 text-red-600 flex items-center justify-center font-bebas italic text-4xl group-hover:bg-red-600 group-hover:text-black transition-all duration-500">
                                        {rep.dt.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-600 uppercase tracking-[3px] leading-none mb-1 font-bold">Publicado por</p>
                                        <p className="text-2xl text-white font-bebas uppercase italic leading-none">
                                            {rep.dt}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    )) : (
                        <div className="py-32 text-center border border-dashed border-white/10">
                            <p className="font-bebas text-5xl text-white/10 uppercase italic tracking-[10px] animate-pulse">
                                Sin reportes activos en el muro...
                            </p>
                        </div>
                    )}
                </div>

                {/* SECCIÓN DEL EDITOR (Igual que Noticias) */}
                <div ref={formularioRef} className="pt-10">
                    {(isAdmin || userData?.rol === "dt") ? (
                        <section className="bg-[#111] border border-red-600/30 p-8 md:p-12 shadow-2xl">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-10 w-2 bg-red-600"></div>
                                <h2 className="font-bebas text-5xl text-white italic uppercase tracking-tighter">
                                    Enviar <span className="text-red-600">Informe de Ausencia</span>
                                </h2>
                            </div>

                            <form onSubmit={publicarReporte} className="space-y-6">
                                <textarea
                                    placeholder="Explica brevemente el motivo de tu ausencia y el tiempo estimado..."
                                    className="w-full bg-black border border-white/10 p-6 outline-none focus:border-red-600 text-white font-barlow text-xl italic transition-all min-h-[300px] resize-none"
                                    value={motivo}
                                    onChange={e => setMotivo(e.target.value)}
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={enviando}
                                    className="w-full bg-red-600 text-white font-bebas text-5xl py-5 hover:bg-white hover:text-black transition-all uppercase italic tracking-tighter shadow-xl group flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {enviando ? "ENVIANDO..." : "LANZAR REPORTE AL MURO"}
                                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                                </button>
                            </form>
                        </section>
                    ) : (
                        <div className="bg-[#0a0a0a] p-10 border border-white/5 text-center">
                            <p className="text-gray-600 text-sm uppercase tracking-[6px] italic font-bold">
                                --- Acceso restringido a Directores Técnicos ---
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}