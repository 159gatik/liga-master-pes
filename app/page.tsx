"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from "next/image";
import { useAuth } from '@/src/lib/hooks/useAuht';
import { db } from "@/src/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp, addDoc, } from "firebase/firestore";

// Componentes
import BannerPatrocinadores from "./components/BannerPatrocinadores";
import UltimosUsuarios from "./components/UltimosUsuarios";
import ReporteAusenciaForm from "./ausencias/page";

// Interfaces
interface Equipo { id: string; juego: string; nombre: string; escudo?: string; pj?: number; pts?: number;[key: string]: any; }
interface Reporte { id: string; local: string; visita: string; score: string; fecha: Timestamp; division: "A" | "B"; }
interface Noticia { id: string; titulo: string; categoria: string; contenido: string; autor: string; fecha: Timestamp; }
interface ReporteAusencia { id: string; dt: string; equipo: string; motivo: string; fecha: Timestamp; }

export default function Page() {
    const { user, userData, loading } = useAuth();
    const [yaPostulado, setYaPostulado] = useState(false);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [resultados, setResultados] = useState<Reporte[]>([]);
    const [noticias, setNoticias] = useState<Noticia[]>([]);
    const [reportesAusencia, setReportesAusencia] = useState<ReporteAusencia[]>([]);
    const [tabActiva, setTabActiva] = useState<"A" | "B">("A");
    const cantidadPes6 = equipos.filter(e => e.juego?.toString().toLowerCase() === 'pes6').length;
    // --- CARGA DE DATOS ---
    useEffect(() => {
        const qNoticias = query(collection(db, "novedades"), orderBy("fecha", "desc"), limit(3));
        const unsubN = onSnapshot(qNoticias, (snap) => setNoticias(snap.docs.map(d => ({ id: d.id, ...d.data() } as Noticia))));

        const qEquipos = query(collection(db, "equipos"), orderBy("puntos", "desc"));
        const unsubE = onSnapshot(qEquipos, (snap) => setEquipos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Equipo))));

        const qReportes = query(collection(db, "reportes"), orderBy("fecha", "desc"), limit(4));
        const unsubR = onSnapshot(qReportes, (snap) => setResultados(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reporte))));

        const qAusencias = query(collection(db, "reportes_ausencias"), orderBy("fecha", "desc"), limit(5));
        const unsubA = onSnapshot(qAusencias, (snap) => setReportesAusencia(snap.docs.map(d => ({ id: d.id, ...d.data() } as ReporteAusencia))));

        if (user) {
            const qPost = query(collection(db, "postulaciones"), where("uid", "==", user.uid));
            const unsubP = onSnapshot(qPost, (snap) => setYaPostulado(!snap.empty));
            return () => { unsubN(); unsubE(); unsubR(); unsubA(); unsubP(); };
        }

        return () => { unsubN(); unsubE(); unsubR(); unsubA(); };
    }, [user]);


    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans selection:bg-[#c9a84c] selection:text-black">

            {/* 1. NAV / HEADER MINIMALISTA (Estilo Webild) */}
            <nav className="w-full border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50 px-6 py-6">
                <div className="max-w-[1400px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-8 bg-[#c9a84c]"></div>
                        <span className="font-bebas text-3xl tracking-[4px] uppercase">El Legado</span>
                    </div>
                    <div className="hidden md:block">
                        <UltimosUsuarios />
                    </div>
                </div>
            </nav>

            {/* 2. HERO SECTION MASIVA */}
            <section className="relative min-h-[90vh] flex items-center px-6 overflow-hidden">
                <div className="absolute right-[5%] top-1/2 -translate-y-1/2 font-bebas text-[25vw] text-white/[0.02] pointer-events-none select-none uppercase italic">
                    PES 6
                </div>

                <div className="max-w-[1400px] mx-auto w-full relative z-10">
                    <span className="text-[#c9a84c] font-barlow text-sm tracking-[10px] uppercase block mb-6 animate-pulse">Temporada Oficial 2026</span>

                    <h1 className="font-bebas text-[15vw] lg:text-[11rem] leading-[0.8] tracking-tighter uppercase italic mb-8">
                        El Legado <br />
                        <span className="text-[#c9a84c] not-italic">Liga Master</span>
                    </h1>

                    <p className="max-w-xl text-gray-500 text-lg md:text-xl font-barlow leading-relaxed mb-12 italic">
                        La liga de PES más importante de la región. <br /> Gestioná tu club, competí al más alto nivel y escribí tu historia.
                    </p>

                    <div className="flex flex-wrap gap-6">
                        <Link href="/equipos" className="bg-white text-black font-bebas text-3xl px-12 py-5 skew-x-[-15deg] hover:bg-[#c9a84c] transition-all">
                            <span className="inline-block skew-x-[15deg]">Ver Clubes</span>
                        </Link>

                        {!loading && (
                            <div className="flex gap-4">
                                {!user ? (
                                    <Link href="/register" className="border-2 border-white/20 text-white font-bebas text-3xl px-12 py-5 skew-x-[-15deg] hover:bg-white hover:text-black transition-all">
                                        <span className="inline-block skew-x-[15deg]">Registrate</span>
                                    </Link>
                                ) : (
                                    <>
                                        {userData?.ligas?.pes6?.estado === "aprobado" ? (
                                            <Link href="/perfil" className="bg-[#27ae60] text-white font-bebas text-3xl px-12 py-5 skew-x-[-15deg] hover:scale-105 transition-all">
                                                <span className="inline-block skew-x-[15deg]">Mi Oficina</span>
                                            </Link>
                                        ) : (
                                            <Link href={yaPostulado ? "#" : "/equipos-libres"} className={`border-2 border-[#c9a84c] text-[#c9a84c] font-bebas text-3xl px-12 py-5 skew-x-[-15deg] ${yaPostulado ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#c9a84c] hover:text-black'}`}>
                                                <span className="inline-block skew-x-[15deg]">{yaPostulado ? "En Revisión" : "Postularse"}</span>
                                            </Link>
                                        )}
                                        <Link href="/despachos" className="bg-white/5 border border-white/10 italic font-bebas text-3xl px-12 py-5 skew-x-[-15deg] hover:bg-white/10 transition-all">
                                            <span className="inline-block skew-x-[15deg]">Despachos</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <BannerPatrocinadores />

            {/* 3. SECCIÓN ESTADÍSTICAS LIMPIAS */}
            <section className="py-32 bg-[#0d0d0d] border-y border-white/5">
                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-5 gap-12">
                    <StatCard value={cantidadPes6} label="Clubes Registrados" />
                    <StatCard value={resultados.length} label="Partidos Reportados" />
                    <StatCard value="ACTIVO" label="Estado Servidor" isGold />
                    <StatCard value="18" label="Jornadas Liga" />
                    <StatCard value="I" label="Edición Actual" />
                </div>
            </section>

            {/* 4. GRILLA: RESULTADOS Y TABLA (Secciones de alto contraste) */}
            <section className="py-32 px-6 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">

                {/* COLUMNA: RESULTADOS */}
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/5 pb-6 gap-6">
                        <h3 className="font-bebas text-5xl uppercase italic tracking-tighter">
                            Últimos <span className="text-[#c9a84c]">Resultados</span>
                        </h3>

                        {/* TABS PARA RESULTADOS */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTabActiva("A")}
                                className={`font-bebas text-xl px-6 py-1 skew-x-[-15deg] transition-all ${tabActiva === "A" ? "bg-[#c9a84c] text-black" : "bg-white/5 text-gray-500 hover:text-white"}`}
                            >
                                <span className="inline-block skew-x-[15deg]">CATEGORÍA A</span>
                            </button>
                            <button
                                onClick={() => setTabActiva("B")}
                                className={`font-bebas text-xl px-6 py-1 skew-x-[-15deg] transition-all ${tabActiva === "B" ? "bg-[#c9a84c] text-black" : "bg-white/5 text-gray-500 hover:text-white"}`}
                            >
                                <span className="inline-block skew-x-[15deg]">CATEGORÍA B</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {resultados.filter(r => r.division === tabActiva).length > 0 ? (
                            resultados
                                .filter((partido) => partido.division === tabActiva)
                                .map((partido) => {
                                    const [gL, gV] = (partido.score || "0-0").split('-').map(Number);
                                    return (
                                        <div key={partido.id} className="grid grid-cols-3 items-center bg-[#111] p-8 border-l-4 border-transparent hover:border-[#c9a84c] transition-all group">
                                            <span className="text-right font-bebas text-2xl uppercase tracking-tighter group-hover:text-[#c9a84c] transition-colors">{partido.local}</span>
                                            <div className="flex justify-center items-center gap-6">
                                                <span className="font-bebas text-5xl text-white">{gL}</span>
                                                <span className="text-gray-800 text-3xl">-</span>
                                                <span className="font-bebas text-5xl text-white">{gV}</span>
                                            </div>
                                            <span className="text-left font-bebas text-2xl uppercase tracking-tighter group-hover:text-[#c9a84c] transition-colors">{partido.visita}</span>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="p-10 border border-dashed border-white/5 text-center text-gray-400 italic font-barlow tracking-[3px] uppercase">
                                Sin reportes en Categoría {tabActiva}...
                            </div>
                        )}
                        <div className="text-right mt-4">
                            <Link href="/fixture" className="font-barlow text-xs tracking-[4px] uppercase text-gray-400 hover:text-[#c9a84c] transition-colors">Ver Full Fixture →</Link>
                        </div>
                    </div>
                </div>

                {/* COLUMNA: CLASIFICACIÓN */}
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/5 pb-6 gap-6">
                        <h3 className="font-bebas text-5xl uppercase italic tracking-tighter">
                            Top <span className="text-[#c9a84c]">Clasificación</span>
                        </h3>

                        {/* TABS PARA CLASIFICACIÓN (Sincronizados) */}
                        <div className="flex gap-2 text-gray-500 font-bebas text-xl">
                            <span className={tabActiva === "A" ? "text-[#c9a84c]" : ""}>DIVISION A</span>
                            <span className="text-gray-800">/</span>
                            <span className={tabActiva === "B" ? "text-[#c9a84c]" : ""}>DIVISION B</span>
                        </div>
                    </div>

                    <div className="bg-[#111] p-2 relative overflow-hidden">
                        {/* Decoración de fondo estilo Webild */}
                        <div className="absolute top-0 right-0 p-4 opacity-[0.02] font-bebas text-9xl pointer-events-none">
                            {tabActiva}
                        </div>

                        <table className="w-full relative z-10">
                            <tbody className="divide-y divide-white/5">
                                {equipos
                                    .filter((equipo) => equipo.division === tabActiva)
                                    .sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
                                    .slice(0, 5)
                                    .map((equipo, i) => (
                                        <tr key={equipo.id} className="hover:bg-white/[0.02] transition-all group">
                                            <td className="p-6 font-bebas text-2xl text-gray-800 group-hover:text-[#c9a84c]">{i + 1}</td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 relative  transition-all">
                                                        <Image src={equipo.escudo || "/img/default-shield.png"} alt={equipo.nombre} fill className="object-contain" />
                                                    </div>
                                                    <span className="font-bebas text-3xl uppercase tracking-tighter">{equipo.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right font-bebas text-4xl text-[#c9a84c]">
                                                {equipo.puntos || 0} <span className="text-[10px] text-gray-200 ml-1">PTS</span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        <div className="p-6 border-t border-white/5 text-right">
                            <Link href="/positions" className="font-barlow text-xs tracking-[4px] uppercase text-gray-300 hover:text-white transition-colors">Ver Tabla Completa →</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. SECCIÓN PRENSA (Estilo Magazine) */}
            <section className="py-32 bg-[#0d0d0d]">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="flex justify-between items-end mb-16">
                        <h3 className="font-bebas text-6xl uppercase italic">
                            Prensa <span className="text-[#c9a84c]">Oficial</span>
                        </h3>
                        <Link
                            href="/noticias"
                            className="font-bebas text-2xl border-b-2 border-[#c9a84c] text-[#c9a84c] pb-1 hover:text-white hover:border-white transition-all"
                        >
                            Ver todo el portal
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        {noticias.length > 0 ? noticias.map((nota) => (
                            <Link
                                href="/noticias"
                                key={nota.id}
                                className="bg-[#111] p-10 border border-white/5 hover:bg-[#c9a84c] hover:text-black transition-all group relative overflow-hidden h-[400px] flex flex-col justify-end"
                            >
                                {/* Categoría Flotante */}
                                <span className="absolute top-10 left-10 text-[10px] font-bold tracking-[5px] uppercase opacity-50 group-hover:opacity-100">
                                    {nota.categoria}
                                </span>

                                {/* Título */}
                                <h4 className="font-bebas text-4xl uppercase leading-none mb-4 group-hover:translate-y-[-10px] transition-transform">
                                    {nota.titulo}
                                </h4>

                                {/* Resumen (Limpiando etiquetas HTML) */}
                                <p className="font-barlow text-sm italic line-clamp-2 opacity-60 group-hover:opacity-100">
                                    {nota.contenido?.replace(/<[^>]*>/g, '')}
                                </p>
                            </Link>
                        )) : (
                            // Placeholder si no hay noticias
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-[#111] h-[400px] border border-white/5 animate-pulse flex items-center justify-center">
                                    <span className="font-bebas text-gray-800 text-2xl">Cargando...</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className="py-32 bg-[#0a0a0a]">
                <div className="max-w-[1400px] mx-auto px-6">
                    {/* Encabezado igual a Prensa pero en Rojo */}
                    <div className="flex justify-between items-end mb-16 border-b border-white/5 pb-8">
                        <div>
                            <span className="text-red-600 font-barlow text-xs tracking-[8px] uppercase block mb-2 font-bold">
                                Comité Disciplinario
                            </span>
                            <h3 className="font-bebas text-6xl uppercase italic text-white leading-none">
                                Reportes de <span className="text-red-600">Ausencia</span> Y <span className="text-red-600">Abandonos</span>
                            </h3>
                        </div>
                        <Link
                            href="/ausencias"
                            className="font-bebas text-2xl border-b-2 border-red-600 text-red-600 pb-1 hover:text-white hover:border-white transition-all"
                        >
                            Ver todos los reportes
                        </Link>
                    </div>

                    {/* Grilla de Tarjetas (Igual a Noticias) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        {reportesAusencia.length > 0 ? reportesAusencia.slice(0, 3).map((rep) => (
                            <div
                                key={rep.id}
                                className="bg-[#111] p-10 border border-white/5 hover:bg-red-600 hover:text-white transition-all group relative overflow-hidden h-[400px] flex flex-col justify-end cursor-default"
                            >
                                {/* Marca de agua de fondo en la tarjeta */}
                                <div className="absolute top-[-20px] right-[-20px] font-bebas text-9xl text-white/[0.03] group-hover:text-black/10 transition-colors pointer-events-none uppercase italic">
                                    REPORTES
                                </div>

                                {/* Nombre del Equipo (Categoría Flotante) */}
                                <span className="absolute top-10 left-10 text-[10px] font-bold tracking-[5px] uppercase opacity-50 group-hover:opacity-100">
                                    {rep.equipo}
                                </span>

                                {/* Nombre del DT (Título) */}
                                <h4 className="font-bebas text-5xl uppercase leading-none mb-4 group-hover:translate-y-[-10px] transition-transform tracking-tighter">
                                    {rep.dt}
                                </h4>

                                {/* Motivo (Cuerpo) */}
                                <p className="font-barlow text-lg italic line-clamp-3 opacity-60 group-hover:opacity-100 leading-snug">
                                    "{rep.motivo}"
                                </p>

                                {/* Fecha sutil abajo */}
                                <span className="mt-6 text-[9px] uppercase tracking-[3px] opacity-30 font-bold">
                                    Registrado: {rep.fecha?.toDate().toLocaleDateString()}
                                </span>
                            </div>
                        )) : (
                            // Placeholder si no hay reportes
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-[#111] h-[400px] border border-white/5 animate-pulse flex items-center justify-center">
                                    <span className="font-bebas text-gray-800 text-2xl uppercase italic">Sin Incidentes</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

        </main>
    );
}

// Sub-componente de Estadísticas con lógica visual Webild
function StatCard({ value, label, isGold }: { value: any, label: string, isGold?: boolean }) {
    return (
        <div className="group">
            <div className={`font-bebas text-7xl mb-2 transition-transform group-hover:scale-110 origin-left ${isGold ? 'text-[#c9a84c]' : 'text-white'}`}>
                {value}
            </div>
            <div className="font-barlow text-[10px] tracking-[5px] text-gray-600 uppercase font-bold group-hover:text-gray-400 transition-colors">
                {label}
            </div>
        </div>
    );
}