"use client";
import Link from 'next/link';
import { useAuth } from '@/src/lib/hooks/useAuht'; // Importamos el hook de autenticación

export default function Page() {
    const { user, loading } = useAuth(); // Obtenemos el estado del usuario

    // Datos de ejemplo (Luego los traerás de Firestore)
    const resultados = [
        { local: "[ Local ]", score: "vs", visita: "[ Visitante ]", pendiente: true },
        { local: "[ Local ]", score: "vs", visita: "[ Visitante ]", pendiente: true },
        { local: "[ Local ]", score: "vs", visita: "[ Visitante ]", pendiente: true },
        { local: "[ Local ]", score: "vs", visita: "[ Visitante ]", pendiente: true }
    ];

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
                    Liga Master PES 6 · Buenos Aires
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
                        El Legado es una liga de PES 6 online entre amigos, donde cada DT defiende los colores de su equipo y compite por el título.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/equipos" className="border-2 border-[#c9a84c] text-[#c9a84c] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all">
                            Equipos
                        </Link>

                        {/* LÓGICA DINÁMICA DE BOTONES */}
                        {!loading && (
                            <>
                                {!user ? (
                                    // Si NO está logueado (Invitado)
                                    <Link href="/register" className="bg-[#c9a84c] border-2 border-[#c9a84c] text-[#0a0a0a] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-white hover:border-white transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)]">
                                        Registrate para participar
                                    </Link>
                                ) : (
                                    // Si YA está logueado
                                    <Link href="/equipos-libres" className="bg-[#c9a84c] border-2 border-[#c9a84c] text-[#0a0a0a] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:bg-white hover:border-white transition-all">
                                        Postulate a un equipo
                                    </Link>
                                )}
                            </>
                        )}

                        <Link href="/reglamento" className="border-2 border-[#444] text-[#888] font-barlow-condensed font-bold tracking-[3px] uppercase py-2.5 px-7 hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all">
                            Ver Reglamento
                        </Link>
                    </div>
                </div>
            </section>

            {/* RESTO DEL CONTENIDO (STATS, CAMPEÓN, GRID, NOVEDADES) */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
                <StatCard value="0" label="Participantes" />
                <StatCard value="0" label="Partidos Jugados" />
                <StatCard value="0" label="Goles Totales" />
                <StatCard value="0" label="Fechas Restantes" />
                <StatCard value="I" label="Edición" />
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-[#1a1400] via-[#0a0a0a] to-[#1a1200] border border-[#c9a84c] p-8 flex items-center justify-between mb-10">
                <div>
                    <div className="text-[#c9a84c] opacity-70 font-barlow-condensed text-xs tracking-[4px] uppercase mb-2">🏆 Campeón actual</div>
                    <div className="font-bebas text-4xl text-[#c9a84c] tracking-[5px]">-</div>
                    <div className="text-[#f0ece0] opacity-60 font-barlow-condensed text-sm tracking-[2px]">-</div>
                </div>
                <div className="text-6xl opacity-40">🏆</div>
            </div>

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
                        {resultados.map((partido, i) => (
                            <div key={i} className="grid grid-cols-3 items-center p-4 border-b border-[#1e1e1e] last:border-0">
                                <span className="font-barlow-condensed font-bold text-right uppercase tracking-wider text-sm">{partido.local}</span>
                                <span className={`text-center font-bebas text-xl tracking-[3px] mx-4 py-1 px-3 bg-[#222] rounded ${partido.pendiente ? 'text-[#444]' : 'text-[#c9a84c]'}`}>
                                    {partido.score}
                                </span>
                                <span className="font-barlow-condensed font-bold text-left uppercase tracking-wider text-sm">{partido.visita}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PANEL: TABLA DE POSICIONES */}
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
                                <th className="p-3">DG</th>
                                <th className="p-3">PTS</th>
                            </tr>
                        </thead>
                        <tbody className="font-barlow-condensed text-sm uppercase">
                            {[1, 2, 3, 4].map((pos) => (
                                <tr key={pos} className="border-b border-[#1e1e1e] text-[#888] opacity-50">
                                    <td className="p-3 font-bebas text-lg">{pos}</td>
                                    <td className="p-3 text-left">[ Equipo ]</td>
                                    <td className="p-3">—</td>
                                    <td className="p-3">—</td>
                                    <td className="p-3 font-bebas text-2xl">—</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PANEL: NOVEDADES DEL TORNEO */}
            <div className="max-w-6xl mx-auto bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden mb-10">
                <div className="p-4 bg-[#222222] border-b border-[#2a2a2a]">
                    <h3 className="font-bebas text-xl tracking-[3px] text-[#c9a84c]">Novedades del Torneo</h3>
                </div>
                <div className="divide-y divide-[#1e1e1e]">
                    {noticias.map((nota, i) => (
                        <div key={i} className="flex gap-6 p-5 hover:bg-[#c9a84c05] transition-colors cursor-pointer">
                            <div className="text-center min-w-[50px]">
                                <div className="font-bebas text-2xl text-[#c9a84c] leading-none">{nota.dia}</div>
                                <div className="font-barlow-condensed text-[10px] tracking-[2px] text-[#888888]">{nota.mes}</div>
                            </div>
                            <div>
                                <h4 className="font-barlow-condensed font-bold text-base uppercase tracking-wider text-white mb-1">
                                    {nota.titulo}
                                </h4>
                                <p className="text-sm text-[#888888] leading-relaxed">{nota.desc}</p>
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