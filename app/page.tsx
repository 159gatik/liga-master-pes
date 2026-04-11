"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { useAuth } from '@/src/lib/hooks/useAuht';
import { db } from "@/src/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from "firebase/firestore";
import BannerPatrocinadores from "./components/BannerPatrocinadores";

interface Reporte {
    id: string;
    local: string;
    visita: string;
    score: string;
    fecha: Timestamp;
}

export default function Page() {
    const { user, userData, loading } = useAuth();
    const [yaPostulado, setYaPostulado] = useState(false);
    const [equipos, setEquipos] = useState([]);
    const [resultados, setResultados] = useState<Reporte[]>([]);

    useEffect(() => {
        // 1. Cargar equipos (Lectura pública según tus reglas)
        const qEquipos = query(collection(db, "equipos"), orderBy("nombre", "asc"));
        const unsubEquipos = onSnapshot(qEquipos,
            (snapshot) => {
                setEquipos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            },
            (error) => {
                console.warn("Inicio: Modo invitado (Equipos restringidos o esperando login)");
            }
        );

        // 2. Verificar postulación (SOLO si hay usuario)
        let unsubPostulacion = () => { };
        if (user) {
            const q = query(
                collection(db, "postulaciones"),
                where("uid", "==", user.uid)
            );
            unsubPostulacion = onSnapshot(q,
                (snapshot) => {
                    setYaPostulado(!snapshot.empty);
                },
                (error) => {
                    console.error("Error al verificar postulación:", error);
                }
            );
        }

        return () => {
            unsubEquipos();
            unsubPostulacion();
        };
    }, [user]);

    useEffect(() => {
        // 3. Cargar reportes (Asegúrate de que 'reportes' tenga allow read: if true en tus reglas)
        const qReportes = query(
            collection(db, "reportes"),
            orderBy("fecha", "desc"),
            limit(4)
        );

        const unsubReportes = onSnapshot(qReportes,
            (snapshot) => {
                const nuevosResultados = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Reporte[];
                setResultados(nuevosResultados);
            },
            (error) => {
                console.warn("Inicio: No se pudieron cargar los reportes (Modo invitado)");
            }
        );

        return () => unsubReportes();
    }, []);

    const noticias = [
        { dia: "01", mes: "ENE", titulo: "Arranca el torneo · Fecha 1 disponible", desc: "Ya está disponible el fixture de la primera fecha. Coordiná con tu rival." },
        { dia: "DD", mes: "MES", titulo: "[ Título de la novedad ]", desc: "[ Descripción breve de la noticia o recordatorio ]" },
    ];

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans p-6 md:p-10">
            {/* HEADER DE SECCIÓN */}
            <div className="max-w-6xl mx-auto mb-10 border-l-4 border-[#c9a84c] pl-5 flex items-baseline gap-4">
                <h1 className="font-bebas text-5xl md:text-7xl tracking-[5px] uppercase">Inicio</h1>
                <span className="font-barlow-condensed text-sm tracking-[3px] text-[#c9a84c] uppercase">
                    Liga Master Online · Buenos Aires
                </span>
            </div>

            {/* HERO SECTION */}
            <section className="max-w-6xl mx-auto relative bg-[#111111] border border-[#2a2a2a] border-t-4 border-t-[#c9a84c] p-10 md:p-16 mb-10 overflow-hidden">
                <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 font-bebas text-[10rem] text-[#c9a84c] opacity-[0.03] pointer-events-none whitespace-nowrap hidden lg:block">
                    EL LEGADO
                </div>

                <div className="relative z-10">
                    <div className="font-barlow-condensed text-xs tracking-[5px] text-[#c9a84c] uppercase mb-4">
                        Bienvenido a la Liga Master
                    </div>
                    <h2 className="font-bebas text-6xl md:text-8xl tracking-[8px] leading-[0.9] mb-6 uppercase">
                        El <span className="text-[#c9a84c]">Legado</span>
                    </h2>
                    <p className="text-[#888888] max-w-lg leading-relaxed mb-8">
                        El Legado es una liga de PES 6 online entre amigos, donde cada DT defiende los colores de su equipo y pelea por el titulo.
                    </p>

                    <div className="flex flex-wrap gap-4 items-center">
                        <Link href="/equipos" className="border-2 border-[#c9a84c] text-[#c9a84c] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all">
                            Equipos
                        </Link>

                        {!loading && (
                            <>
                                {!user ? (
                                    <Link href="/register" className="bg-[#c9a84c] border-2 border-[#c9a84c] text-[#0a0a0a] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-white hover:border-white transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)]">
                                        Registrate para participar
                                    </Link>
                                ) : (
                                        <>
                                            {userData?.equipoId ? (
                                                <Link href="/perfil" className="bg-[#27ae60] border-2 border-[#27ae60] text-white font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-white hover:text-[#27ae60] transition-all font-bold">
                                                    Ir a mi Oficina
                                                </Link>
                                            ) : yaPostulado ? (
                                                <button disabled className="bg-[#333] border-2 border-[#333] text-[#888] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 cursor-not-allowed opacity-70">
                                                    Postulación en revisión
                                                </button>
                                            ) : (
                                                        <Link href="/equipos-libres" className="bg-[#c9a84c] border-2 border-[#c9a84c] text-[#0a0a0a] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-white hover:border-white transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)]">
                                                    Postulate a un equipo
                                                </Link>
                                            )}
                                        <Link href="/despachos" className="border-2 border-white text-white font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-white hover:text-black transition-all italic">
                                            Despachos
                                        </Link>
                                    </>
                                )}
                            </>
                        )}

                        <Link href="/reglamento" className="border-2 border-[#444] text-[#888] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all">
                            Reglamento
                        </Link>
                    </div>
                </div>
            </section>

            <BannerPatrocinadores />

            {/* ESTADÍSTICAS RÁPIDAS */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
                <StatCard value={`${equipos.length}`} label="Clubes" />
                <StatCard value="0" label="Partidos Jugados" />
                <StatCard value="0" label="Goles Totales" />
                <StatCard value="0" label="Fechas Restantes" />
                <StatCard value="I" label="Edición" />
            </div>

            {/* GRILLA INFERIOR */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
                {/* PANEL: ÚLTIMOS RESULTADOS */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-[#222222] border-b border-[#2a2a2a]">
                        <h3 className="font-bebas text-xl tracking-[3px] text-[#c9a84c]">Últimos Resultados</h3>
                        <Link href="/fixture" className="font-barlow-condensed text-[10px] tracking-[2px] text-[#888888] uppercase hover:text-[#c9a84c]">
                            Ver todo el fixture →
                        </Link>
                    </div>

                    <div className="p-0">
                        {resultados.length === 0 ? (
                            <div className="p-10 text-center space-y-2">
                                <p className="text-gray-600 italic text-sm font-barlow-condensed uppercase tracking-widest">No hay reportes recientes</p>
                                <p className="text-[10px] text-gray-700 uppercase">Los resultados aparecerán cuando los DTs envíen sus reportes</p>
                            </div>
                        ) : (
                            resultados.map((partido, i) => {
                                const [gL, gV] = (partido.score || "0-0").split('-').map(Number);
                                const localGana = gL > gV;
                                const visitaGana = gV > gL;

                                return (
                                    <div key={partido.id || i} className="grid grid-cols-3 items-center p-4 border-b border-[#1e1e1e] last:border-0 hover:bg-[#ffffff03] transition-colors">
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

                {/* PANEL: TABLA (Simulada por ahora) */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-[#222222] border-b border-[#2a2a2a]">
                        <h3 className="font-bebas text-xl tracking-[3px] text-[#c9a84c]">Tabla de Posiciones</h3>
                        <Link href="/fixture" className="font-barlow-condensed text-[10px] tracking-[2px] text-[#888888] uppercase hover:text-[#c9a84c]">
                            Ver completa →
                        </Link>
                    </div>
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="bg-[#222] font-barlow-condensed text-[10px] tracking-[2px] text-[#888888] uppercase">
                                <th className="p-3">#</th>
                                <th className="p-3 text-left">Equipo</th>
                                <th className="p-3">PJ</th>
                                <th className="p-3">PTS</th>
                            </tr>
                        </thead>
                        <tbody className="font-barlow-condensed text-sm uppercase text-[#444] opacity-50 italic">
                            {[1, 2, 3, 4].map((pos) => (
                                <tr key={pos} className="border-b border-[#1e1e1e]">
                                    <td className="p-3 font-bebas text-lg">{pos}</td>
                                    <td className="p-3 text-left">[ Equipo ]</td>
                                    <td className="p-3">—</td>
                                    <td className="p-3 font-bebas text-2xl">—</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PANEL: NOVEDADES */}
            <div className="max-w-6xl mx-auto bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden mb-10">
                <div className="p-4 bg-[#222222] border-b border-[#2a2a2a]">
                    <h3 className="font-bebas text-xl tracking-[3px] text-[#c9a84c]">Novedades del Torneo</h3>
                </div>
                <div className="divide-y divide-[#1e1e1e]">
                    {noticias.map((nota, i) => (
                        <div key={i} className="flex gap-6 p-5 hover:bg-[#c9a84c05] transition-colors text-[#888]">
                            <div className="text-center min-w-[50px]">
                                <div className="font-bebas text-2xl text-[#c9a84c] leading-none">{nota.dia}</div>
                                <div className="font-barlow-condensed text-[10px] tracking-[2px]">{nota.mes}</div>
                            </div>
                            <div>
                                <h4 className="font-barlow-condensed font-bold text-base uppercase tracking-wider text-white mb-1">
                                    {nota.titulo}
                                </h4>
                                <p className="text-sm leading-relaxed">{nota.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

function StatCard({ value, label }: { value: string, label: string }) {
    return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-5 text-center relative overflow-hidden group">
            <div className="font-bebas text-4xl text-[#c9a84c] tracking-[2px] mb-1">{value}</div>
            <div className="font-barlow-condensed text-[10px] tracking-[3px] text-[#888888] uppercase">{label}</div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c9a84c] opacity-30 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
}