"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { useAuth } from '@/src/lib/hooks/useAuht';
import { db } from "@/src/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from "firebase/firestore";
import BannerPatrocinadores from "./components/BannerPatrocinadores";
import FormularioNoticias from "./components/FormularioNoticias"; // Asegúrate de crear este archivo

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
    const [noticias, setNoticias] = useState([]);
    const [mostrarEditor, setMostrarEditor] = useState(false); // Estado para el formulario

    useEffect(() => {
        // 1. Cargar equipos
        const qEquipos = query(collection(db, "equipos"), orderBy("nombre", "asc"));
        const unsubEquipos = onSnapshot(qEquipos,
            (snapshot) => {
                setEquipos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            },
            (error) => {
                console.warn("Inicio: Modo invitado (Equipos restringidos)");
            }
        );

        // 2. Verificar postulación
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
        // 3. Cargar reportes
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
                console.warn("Inicio: No se pudieron cargar los reportes");
            }
        );

        return () => unsubReportes();
    }, []);

    useEffect(() => {
        // 4. Cargar Novedades
        const q = query(collection(db, "novedades"), orderBy("timestamp", "desc"), limit(10));
        const unsub = onSnapshot(q, (snap) => {
            setNoticias(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans p-6 md:p-10">
            {/* HEADER DE SECCIÓN */}
            <div className="max-w-6xl mx-auto mb-10 border-l-4 border-[#c9a84c] pl-5 flex items-baseline gap-4">
                <h1 className="font-bebas text-5xl md:text-7xl tracking-[5px] uppercase">Inicio</h1>
                <span className="font-barlow-condensed text-sm tracking-[3px] text-[#c9a84c] uppercase">
                    Liga Master Online · El Legado
                </span>
            </div>

            {/* HERO SECTION */}
            <section className="max-w-6xl mx-auto relative bg-[#111111] border border-[#2a2a2a] border-t-4 border-t-[#c9a84c] p-10 md:p-16 mb-10 overflow-hidden shadow-2xl">
                <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 font-bebas text-[10rem] text-[#c9a84c] opacity-[0.03] pointer-events-none whitespace-nowrap hidden lg:block">
                    EL LEGADO
                </div>

                <div className="relative z-10">
                    <div className="font-barlow-condensed text-xs tracking-[5px] text-[#c9a84c] uppercase mb-4">
                        Bienvenido a la plataforma oficial
                    </div>
                    <h2 className="font-bebas text-6xl md:text-8xl tracking-[8px] leading-[0.9] mb-6 uppercase">
                        El <span className="text-[#c9a84c]">Legado</span>
                    </h2>
                    <p className="text-[#888888] max-w-lg leading-relaxed mb-8">
                        La liga de PES 6 online más competitiva. Gestiona tu equipo, coordina tus partidos y escribe tu propia historia.
                    </p>

                    <div className="flex flex-wrap gap-4 items-center">
                        <Link href="/equipos" className="border-2 border-[#c9a84c] text-[#c9a84c] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all">
                            Equipos
                        </Link>

                        {!loading && (
                            <>
                                {!user ? (
                                    <Link href="/register" className="bg-[#c9a84c] border-2 border-[#c9a84c] text-[#0a0a0a] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-white hover:border-white transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)]">
                                        Registrate
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
                                                            Postulate ahora
                                                </Link>
                                            )}
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
                <StatCard value={`${equipos.length}`} label="Clubes" />
                <StatCard value={`${resultados.length}`} label="Reportes" />
                <StatCard value="ONLINE" label="Estado" />
                <StatCard value="19" label="Fechas" />
                <StatCard value="I" label="Edición" />
            </div>

            {/* GRILLA: RESULTADOS Y TABLA */}
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
                            </div>
                        ) : (
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
                        <h3 className="font-bebas text-xl tracking-[3px] text-[#c9a84c]">Tabla de Posiciones</h3>
                        <Link href="/positions" className="font-barlow-condensed text-[10px] tracking-[2px] text-[#888888] uppercase hover:text-[#c9a84c]">
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

            {/* PANEL: NOVEDADES CON BOTÓN DE PUBLICAR */}
            <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center px-2">
                <h3 className="font-bebas text-3xl tracking-[3px] text-white italic uppercase">Prensa <span className="text-[#c9a84c]">Oficial</span></h3>

                {user && (
                    <button
                        onClick={() => setMostrarEditor(!mostrarEditor)}
                        className={`font-bebas text-xl px-6 py-2 transition-all border shadow-lg ${mostrarEditor
                            ? "bg-red-600 border-red-500 text-white"
                            : "bg-[#c9a84c] border-[#c9a84c] text-black hover:bg-white hover:border-white"
                            }`}
                    >
                        {mostrarEditor ? "Cerrar Editor" : "+ Nueva Noticia"}
                    </button>
                )}
            </div>

            {user && mostrarEditor && (
                <div className="max-w-6xl mx-auto mb-10 animate-fadeIn">
                    <FormularioNoticias />
                </div>
            )}

            <div className="max-w-6xl mx-auto bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden mb-10 font-barlow-condensed">
                <div className="p-4 bg-[#222222] border-b border-[#2a2a2a] flex justify-between items-center">
                    <h3 className="font-bebas text-xl tracking-[3px] text-[#c9a84c]">Últimas Noticias</h3>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest italic">Actualización en vivo</span>
                </div>

                <div className="divide-y divide-[#1e1e1e]">
                    {noticias.length > 0 ? noticias.map((nota) => (
                        <div key={nota.id} className="flex gap-6 p-5 hover:bg-[#c9a84c05] transition-colors group">
                            <div className="text-center min-w-[50px]">
                                <div className="font-bebas text-2xl text-[#c9a84c] leading-none">{nota.dia}</div>
                                <div className="font-barlow-condensed text-[10px] tracking-[2px] text-gray-500">{nota.mes}</div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase border ${nota.categoria === 'Torneo' || nota.categoria === 'Campeonato'
                                        ? 'bg-red-900/20 border-red-500/50 text-red-400'
                                        : 'bg-blue-900/20 border-blue-500/50 text-blue-400'
                                        }`}>
                                        {nota.categoria}
                                    </span>
                                    <h4 className="font-bold text-base uppercase tracking-wider text-white">
                                        {nota.titulo}
                                    </h4>
                                </div>
                                <p className="text-sm leading-relaxed text-[#888] mb-2">{nota.desc}</p>
                                <div className="text-[10px] uppercase tracking-widest text-gray-600 italic">
                                    Por <span className="text-gray-400">{nota.autor}</span> — {nota.equipo}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-10 text-center text-gray-600 italic uppercase text-xs tracking-[4px]">
                            Esperando novedades del staff...
                        </div>
                    )}
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