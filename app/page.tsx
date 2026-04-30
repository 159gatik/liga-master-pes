"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { useAuth } from '@/src/lib/hooks/useAuht';
import { db } from "@/src/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from "firebase/firestore";
import BannerPatrocinadores from "./components/BannerPatrocinadores";
import Image from "next/image";
import ReporteAusencia from "./ausencias/page";
import UltimosUsuarios from "./components/UltimosUsuarios";

interface Equipo {
    id: string;
    juego: string;
    nombre: string;
    [key: string]: any; // Para permitir otros campos
}

interface Reporte {
    id: string;
    local: string;
    visita: string;
    score: string;
    fecha: Timestamp;
}

interface Noticia {
    id: string;
    titulo: string;
    categoria: string;
    contenido: string;
    autor: string;
    equipo?: string;
    fecha: Timestamp;
}

interface StatCard {
    value: React.ReactNode; // <--- Esto permite texto, spans, divs, etc.
    label: string;
}

interface ReporteAusencia {
    id: string;
    dt: string;
    equipo: string;
    motivo: string;
    fecha: Timestamp;
}


export default function Page() {
    const { user, userData, loading } = useAuth(); // Agregué isAdmin
    const [yaPostulado, setYaPostulado] = useState(false);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [resultados, setResultados] = useState<Reporte[]>([]);
    const [reportesAusencia, setReportesAusencia] = useState<ReporteAusencia[]>([]); // Tipa esto como necesites
    const cantidadPes6 = equipos.filter(e =>
        e.juego && e.juego.toString().toLowerCase() === 'pes6'
    ).length;
    // UNIFICAMOS EN UN SOLO ESTADO DE NOTICIAS
    const [noticias, setNoticias] = useState<Noticia[]>([]);

    // 1. CARGA DE NOTICIAS (CORREGIDA)
    useEffect(() => {
        const q = query(
            collection(db, "novedades"),
            orderBy("fecha", "desc"),
            limit(3)
        );

        const unsub = onSnapshot(q, (snap) => {
            const docs = snap.docs.map(d => ({
                id: d.id,
                ...d.data()
            } as Noticia));
            setNoticias(docs);
        });

        return () => unsub();
    }, []);

    // 2. CARGA DE EQUIPOS Y POSTULACIÓN
    useEffect(() => {
        const qEquipos = query(collection(db, "equipos"), orderBy("nombre", "asc"));
        const unsubEquipos = onSnapshot(qEquipos, (snapshot) => {
            // Mapeamos explícitamente para asegurar que 'juego' exista
            const equiposData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Equipo[];

            setEquipos(equiposData);
        });

        let unsubPostulacion = () => { };
        if (user) {
            const q = query(collection(db, "postulaciones"), where("uid", "==", user.uid));
            unsubPostulacion = onSnapshot(q, (snapshot) => {
                setYaPostulado(!snapshot.empty);
            });
        }

        return () => {
            unsubEquipos();
            unsubPostulacion();
        };
    }, [user]);

    // 3. CARGA DE REPORTES
    useEffect(() => {
        const qReportes = query(
            collection(db, "reportes"),
            orderBy("fecha", "desc"),
            limit(4)
        );

        const unsubReportes = onSnapshot(qReportes, (snapshot) => {
            setResultados(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Reporte[]);
        });

        return () => unsubReportes();
    }, []);

    useEffect(() => {
        const q = query(collection(db, "reportes_ausencias"), orderBy("fecha", "desc"), limit(5));

        const unsub = onSnapshot(q, (snap) => {
            // Mapeamos los datos y casteamos a nuestra interfaz
            const data = snap.docs.map(d => ({
                id: d.id,
                ...d.data()
            })) as ReporteAusencia[];

            // Esta es la función que debe coincidir con la de arriba
            setReportesAusencia(data);
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        if (equipos.length > 0) {
            console.log("Primer equipo de la lista:", equipos[0]);
            console.log("Valores de 'juego' encontrados:", equipos.map(e => e.juego));
        }
    }, [equipos]);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans p-6 md:p-10">
            {/* HEADER DE SECCIÓN */}
            <div className="max-w-6xl mx-auto mb-10 border-l-4 border-[#c9a84c] pl-5 flex flex-wrap justify-between items-center gap-6">
                {/* Título */}
                <h1 className="font-bebas text-5xl md:text-7xl tracking-[5px] uppercase">Inicio</h1>

                {/* Componente de Usuarios alineado a la derecha */}
                <div className="flex-shrink-0">
                    <UltimosUsuarios />
                </div>
            </div>

            {/* HERO SECTION */}
            <section className="max-w-6xl mx-auto relative bg-[#111111] border border-[#2a2a2a] border-t-4 border-t-[#c9a84c] p-10 md:p-16 mb-10 overflow-hidden shadow-2xl">
                <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 font-bebas text-[10rem] text-[#c9a84c] opacity-[0.03] pointer-events-none whitespace-nowrap hidden lg:block">
                    EL LEGADO
                </div>

                <div className="relative z-10">
                    <div className="font-barlow-condensed text-s tracking-[5px] text-[#c9a84c] uppercase mb-4">
                        Bienvenidos a la liga master online
                    </div>
                    <h2 className="font-bebas text-6xl md:text-8xl tracking-[8px] leading-[0.9] mb-6 uppercase">
                        El <span className="text-[#c9a84c]">Legado</span>
                    </h2>
                    <p className="text-[#888888] max-w-lg leading-relaxed mb-8">
                        Organizá tu equipo, coordina tus partidos y escribe tu propia historia.
                    </p>

                    <div className="flex flex-wrap gap-4 items-center">
                        <Link href="/equipos" className="border-2 border-[#c9a84c] text-[#c9a84c] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all">
                            Equipos
                        </Link>

                        {!loading && (
                            <>
                                {!user ? (
                                    <Link href="/register" className="border-2 border-[#c9a84c] text-[#c9a84c] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all">
                                        Registrate
                                    </Link>
                                ) : (
                                    <>
                                        {/* BLOQUE DE BOTONES DINÁMICOS */}
                                        {userData?.ligas?.pes6?.estado === "aprobado" ? (
                                            <Link href="/perfil" className="bg-[#27ae60] border-2 border-[#27ae60] text-white font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-white hover:text-[#27ae60] transition-all font-bold">
                                                Ir a mi Oficina
                                            </Link>
                                        ) : yaPostulado ? (
                                            <button disabled className="border-2 border-[#c9a84c] text-[#c9a84c] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all">
                                                Postulación en revisión
                                            </button>
                                        ) : (
                                            <Link href="/equipos-libres" className="border-2 border-[#c9a84c] text-[#c9a84c] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all">
                                                Postularse
                                            </Link>
                                        )}

                                        {/* BOTÓN DESPACHOS (Fuera del ternario, pero dentro del usuario logueado) */}
                                        <Link href="/despachos" className="border-2 border-white text-white font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-white hover:text-black transition-all italic">
                                            Despachos
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>

            <BannerPatrocinadores />

            {/* ESTADÍSTICAS RÁPIDAS */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
                <StatCard value={`${cantidadPes6}`} label="Clubes" />
                <StatCard value={`${resultados.length}`} label="Reportes" />
                <StatCard
                    value={<span className="text-green-500">ACTIVO</span>}
                    label="Estado"
                />
                <StatCard value="18" label="Fechas" />
                <StatCard value="I" label="Edición" />
            </div>

            {/* GRILLA: RESULTADOS Y TABLA */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
                {/* PANEL: ÚLTIMOS RESULTADOS */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-[#222222] border-b border-[#2a2a2a]">
                        <h3 className="font-bebas text-2xl tracking-[3px] text-[#c9a84c]">Últimos Resultados</h3>
                        <Link href="/fixture" className="font-barlow-condensed text-[13px] tracking-[2px] text-[#888888] uppercase hover:text-[#c9a84c]">
                            Ver todo el fixture →
                        </Link>
                    </div>

                    <div className="p-0">
                        {resultados.length === 0 ? (
                            /* VISTA DE EJEMPLO CUANDO NO HAY REPORTES */
                            <div className="divide-y divide-[#1e1e1e]">
                                {[
                                    { local: "Local", visita: "Visitante" },
                                    { local: "Local", visita: "Visitante" },
                                    { local: "Local", visita: "Visitante" }
                                ].map((ejemplo, i) => (
                                    <div key={i} className="grid grid-cols-3 items-center p-4 opacity-80 select-none grayscale">
                                        <div className="text-right pr-2">
                                            <span className="font-barlow-condensed font-bold uppercase tracking-wider text-m text-[#555]">
                                                {ejemplo.local}
                                            </span>
                                        </div>
                                        <div className="flex justify-center">
                                            <div className="flex items-center bg-[#0a0a0a] border border-[#333] px-3 py-1 rounded">
                                                <span className="font-bebas text-2xl px-2 text-white">0</span>
                                                <span className="text-[#333] font-bebas text-xl">-</span>
                                                <span className="font-bebas text-2xl px-2 text-white">0</span>
                                            </div>
                                        </div>
                                        <div className="text-left pl-2">
                                            <span className="font-barlow-condensed font-bold uppercase tracking-wider text-sm text-[#555]">
                                                {ejemplo.visita}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-6 text-center">
                                    <p className="text-[#c9a84c] animate-pulse italic text-[10px] font-barlow-condensed uppercase tracking-[4px]">
                                        Esperando reportes oficiales...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* RENDERIZADO REAL DE RESULTADOS */
                            resultados.map((partido) => {
                                const [gL, gV] = (partido.score || "0-0").split('-').map(Number);
                                const localGana = gL > gV;
                                const visitaGana = gV > gL;

                                return (
                                    <div key={partido.id} className="grid grid-cols-3 items-center p-4 border-b border-[#1e1e1e] last:border-0 hover:bg-[#ffffff03] transition-colors">
                                        <div className="text-right pr-2">
                                            <span className={`font-barlow-condensed font-bold uppercase tracking-wider text-sm ${localGana ? 'text-[#c9a84c]' : 'text-[#555]'}`}>
                                                {partido.local}
                                            </span>
                                        </div>
                                        <div className="flex justify-center">
                                            <div className="flex items-center bg-[#0a0a0a] border border-[#333] px-3 py-1 rounded">
                                                <span className={`font-bebas text-2xl px-2 ${localGana ? 'text-[#c9a84c]' : 'text-white'}`}>{gL}</span>
                                                <span className="text-[#333] font-bebas text-xl">-</span>
                                                <span className={`font-bebas text-2xl px-2 ${visitaGana ? 'text-[#c9a84c]' : 'text-white'}`}>{gV}</span>
                                            </div>
                                        </div>
                                        <div className="text-left pl-2">
                                            <span className={`font-barlow-condensed font-bold uppercase tracking-wider text-sm ${visitaGana ? 'text-[#c9a84c]' : 'text-[#555]'}`}>
                                                {partido.visita}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* PANEL: TABLA (Simulada) */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-[#222222] border-b border-[#2a2a2a]">
                        <h3 className="font-bebas text-2xl tracking-[3px] text-[#c9a84c]">Tabla de Posiciones</h3>
                        <Link href="/positions" className="font-barlow-condensed text-[13px] tracking-[2px] text-[#888888] uppercase hover:text-[#c9a84c]">
                            Ver completa →
                        </Link>
                    </div>
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="bg-[#222] font-barlow-condensed text-[13px] tracking-[2px] text-[#888888] uppercase">
                                <th className="p-3">#</th>
                                <th className="p-3 text-left">Equipo</th>
                                <th className="p-3">PJ</th>
                                <th className="p-3">PTS</th>
                            </tr>
                        </thead>

                        {equipos && equipos.length > 0 ? (
                            /* CUERPO DE TABLA REAL */
                            <tbody className="font-barlow-condensed text-sm uppercase">
                                {equipos.slice(0, 4).map((equipo, index) => (
                                    <tr key={equipo.id} className="border-b border-[#1e1e1e] hover:bg-[#ffffff03] transition-colors">
                                        <td className="p-3 font-bebas text-lg text-[#888]">{index + 1}</td>

                                        <td className="p-3 text-left font-bold text-white">
                                            <div className="flex items-center gap-3">
                                                {/* CONTENEDOR DE LA IMAGEN */}
                                                <div className="relative w-6 h-6 shrink-0">
                                                    <Image
                                                        src={equipo.escudo || "/img/default-shield.png"} // Siempre pon un fallback
                                                        alt={equipo.nombre}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                                {/* NOMBRE DEL EQUIPO */}
                                                <span className="truncate">{equipo.nombre}</span>
                                            </div>
                                        </td>

                                        <td className="p-3 text-gray-400">{equipo.pj || 0}</td>
                                        <td className="p-3 font-bebas text-2xl text-[#c9a84c]">{equipo.pts || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        ) : (
                            /* CUERPO DE TABLA DE EJEMPLO (PLACEHOLDER) */
                            <tbody className="font-barlow-condensed text-sm uppercase text-[#444] opacity-50 italic select-none grayscale">
                                {[1, 2, 3, 4].map((pos) => (
                                    <tr key={pos} className="border-b border-[#1e1e1e]">
                                        <td className="p-3 font-bebas text-lg">{pos}</td>
                                        <td className="p-3 text-left">[ Equipo de Ejemplo ]</td>
                                        <td className="p-3">—</td>
                                        <td className="p-3 font-bebas text-2xl">—</td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>

                    {(!equipos || equipos.length === 0) && (
                        <div className="p-2 bg-black/20 text-center">
                            <p className="font-barlow-condensed text-[9px] text-[#555] uppercase tracking-[3px]">
                                Esperando computo de la primera jornada...
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* PANEL: NOVEDADES CON BOTÓN DE PUBLICAR */}
            {/* SECCIÓN PRENSA - LIMPIADA */}
            <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center px-2">
                <h3 className="font-bebas text-3xl tracking-[3px] text-white italic uppercase">
                    Prensa <span className="text-[#c9a84c]">Oficial</span>
                </h3>

                <Link href="/noticias" className="font-bebas text-xl bg-[#222] border border-[#333] px-6 py-2 text-gray-400 hover:text-[#c9a84c] hover:border-[#c9a84c] transition-all italic uppercase">
                    Ir a noticias →
                </Link>
            </div>

            <div className="max-w-6xl mx-auto bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden mb-10 font-barlow-condensed">
                <div className="p-4 bg-[#222222] border-b border-[#2a2a2a] flex justify-between items-center">
                    <h3 className="font-bebas text-xl tracking-[3px] text-[#c9a84c]">Últimas Novedades</h3>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest italic font-bold animate-pulse">EL LEGADO</span>
                </div>

                <div className="divide-y divide-[#1e1e1e]">
                    {noticias.length > 0 ? noticias.map((nota) => {
                        const fecha = nota.fecha?.toDate() || new Date();
                        const dia = fecha.getDate().toString().padStart(2, '0');
                        const mes = fecha.toLocaleString('es-AR', { month: 'short' }).toUpperCase().replace('.', '');

                        return (
                            <Link href="/noticias" key={nota.id} className="flex gap-6 p-5 hover:bg-[#c9a84c05] transition-colors group">
                                <div className="text-center min-w-[50px] border-r border-[#222] pr-4">
                                    <div className="font-bebas text-3xl text-[#c9a84c] leading-none">{dia}</div>
                                    <div className="font-barlow-condensed text-[11px] tracking-[2px] text-gray-500 font-bold">{mes}</div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase border ${nota.categoria === 'Sancion' || nota.categoria === 'Sanción'
                                            ? 'bg-red-900/20 border-red-500/50 text-red-400'
                                            : 'bg-blue-900/20 border-blue-500/50 text-blue-400'
                                            }`}>
                                            {nota.categoria}
                                        </span>
                                        <h4 className="font-bold text-lg uppercase tracking-wider text-white group-hover:text-[#c9a84c] transition-colors">
                                            {nota.titulo}
                                        </h4>
                                    </div>
                                    <p className="text-sm leading-relaxed text-[#888] mb-2 line-clamp-1 italic">
                                        {/* Limpia el HTML para que no se vean las etiquetas en el inicio */}
                                        {nota.contenido?.replace(/<[^>]*>/g, '').substring(0, 120)}...
                                    </p>
                                </div>
                            </Link>
                        );
                    }) : (
                        <div className="p-10 text-center text-gray-600 italic uppercase text-xs tracking-[4px]">
                            No hay noticias recientes...
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center px-2">
                <h3 className="font-bebas text-3xl tracking-[3px] text-white italic uppercase">

                </h3>

                <Link href="/ausencias" className="font-bebas text-xl bg-[#222] border border-[#333] px-6 py-2 text-gray-400 hover:text-[#c9a84c] hover:border-[#c9a84c] transition-all italic uppercase">
                    Ir a Ausencias →
                </Link>
            </div>
            <div className="max-w-6xl mx-auto bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden mb-10 font-barlow-condensed ">

                {/* CABECERA ROJA */}

                <div className="p-4 bg-[#222222] border-b border-[#2a2a2a] flex justify-between items-center">
                    <h3 className="font-bebas text-xl tracking-[3px] text-red-500">Reportes de Ausencia</h3>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest italic font-bold">Comité Disciplinario</span>
                </div>

                <div className="divide-y divide-[#1e1e1e]">
                    {reportesAusencia.length > 0 ? reportesAusencia.map((rep) => {
                        const fecha = rep.fecha?.toDate() || new Date();
                        const dia = fecha.getDate().toString().padStart(2, '0');
                        const mes = fecha.toLocaleString('es-AR', { month: 'short' }).toUpperCase().replace('.', '');

                        return (
                            <div key={rep.id} className="flex gap-6 p-5 transition-colors group">
                                {/* FECHA */}
                                <div className="text-center min-w-[50px] border-r border-[#222] pr-4">
                                    <div className="font-bebas text-3xl text-red-500 leading-none">{dia}</div>
                                    <div className="font-barlow-condensed text-[11px] tracking-[2px] text-gray-500 font-bold">{mes}</div>
                                </div>

                                {/* CONTENIDO */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[9px] px-1.5 py-0.5 font-bold uppercase border bg-red-900/20 border-red-500/50 text-red-400">
                                            {rep.equipo}
                                        </span>
                                        <h4 className="font-bold text-lg uppercase tracking-wider text-white">
                                            {rep.dt} - Ausencia Reportada
                                        </h4>
                                    </div>
                                    <p className="text-sm leading-relaxed text-[#888] italic">
                                        {rep.motivo}
                                    </p>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="p-10 text-center text-gray-700 italic uppercase text-xs tracking-[4px]">
                            Sin reportes de ausencia actualmente...
                        </div>
                    )}
                </div>
            </div>

        </main>
    );
}

// Cambiamos string por React.ReactNode
function StatCard({ value, label }: { value: React.ReactNode, label: string }) {
    return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-5 text-center relative overflow-hidden group">
            <div className="font-bebas text-4xl text-[#c9a84c] tracking-[2px] mb-1">
                {value}
            </div>
            <div className="font-barlow-condensed text-[15px] tracking-[3px] text-[#888888] uppercase">
                {label}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c9a84c] opacity-30 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
}