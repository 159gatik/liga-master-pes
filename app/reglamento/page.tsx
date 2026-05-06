"use client";
import Image from 'next/image';

export default function ReglamentoPage() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans selection:bg-[#c9a84c] selection:text-black overflow-x-hidden">

            {/* 1. HEADER MASIVO (Estilo Webild) */}
            <header className="relative pt-24 pb-12 px-6 border-b border-white/5 bg-gradient-to-b from-[#111] to-[#0a0a0a]">
                <div className="max-w-[1400px] mx-auto relative">
                    {/* Marca de agua de fondo */}
                    <div className="absolute -top-16 -left-10 font-bebas text-[22vw] text-white/[0.02] pointer-events-none select-none uppercase italic leading-none whitespace-nowrap">
                        The Rules
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-[2px] bg-[#c9a84c]"></div>
                            <span className="text-[#c9a84c] font-barlow text-sm tracking-[10px] uppercase animate-pulse">
                                Código de Conducta
                            </span>
                        </div>
                        <h1 className="font-bebas text-7xl md:text-9xl tracking-tighter leading-none uppercase italic">
                            Reglamento <span className="text-[#c9a84c] not-italic">Oficial</span>
                        </h1>
                    </div>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto px-6 py-20 space-y-32">

                {/* 2. INTRODUCCIÓN ESTILO DASHBOARD */}
                <section className="relative group overflow-hidden bg-[#111] border border-white/5 p-8 md:p-12 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5 font-bebas text-6xl italic uppercase">Info</div>
                    <div className="relative z-10 max-w-4xl">
                        <p className="text-xl md:text-2xl font-barlow leading-relaxed italic text-gray-400">
                            El siguiente reglamento rige para <strong className="text-white border-b border-[#c9a84c]">todos los participantes</strong> del torneo El Legado.
                            El desconocimiento de las normas no exime de su cumplimiento. Ante cualquier duda, consultar con los organizadores
                            <span className="text-[#c9a84c] font-bebas text-3xl ml-2 not-italic tracking-tighter">antes de jugar.</span>
                        </p>
                    </div>
                </section>

                {/* 3. SECCIONES DEL REGLAMENTO */}
                <div className="grid grid-cols-1 gap-32">

                    {/* SECCIÓN 1: CATEGORÍAS */}
                    <RegBlock title="Estructura de Liga" subtitle="Ascensos y Descensos">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <p className="mb-8 text-2xl font-barlow italic text-gray-500">
                                    La liga está compuesta por 20 equipos divididos en dos categorías de elite:
                                    <span className="text-white mx-2">Primera A</span> y <span className="text-[#c9a84c]">Primera B</span>.
                                </p>
                                <div className="space-y-6">
                                    <RegItem num="01" title="Descensos Directos">
                                        Descenderán los <strong className="text-white">DOS últimos equipos de la “A”</strong> (9° y 10° posición) de forma inmediata al finalizar la temporada.
                                    </RegItem>
                                    <RegItem num="02" title="Ascensos Directos">
                                        Ascenderán a la máxima competencia los <strong className="text-white">DOS primeros equipos de la “B”</strong> (1° y 2° posición).
                                    </RegItem>
                                    <RegItem num="03" title="Promoción">
                                        Duelo ida y vuelta entre el <strong className="text-white">8º de la A y el 3º de la B</strong>. En empate global, la A mantiene categoría por <span className="text-[#c9a84c]">Ventaja Deportiva</span>.
                                    </RegItem>
                                </div>
                            </div>
                            <div className="bg-[#0d0d0d] p-2 border border-white/5 skew-x-[-2deg]">
                                <div className="bg-[#111] p-10 border border-[#c9a84c]/20">
                                    <div className="font-bebas text-5xl mb-4 italic">Sistema <span className="text-[#c9a84c]">Pro</span></div>
                                    <p className="font-barlow text-gray-500 italic">Próximamente se habilitará el sistema de promedios para determinar los descensos de forma más competitiva.</p>
                                </div>
                            </div>
                        </div>
                    </RegBlock>

                    {/* SECCIÓN 2: CONFIGURACIÓN */}
                    <RegBlock title="Configuración" subtitle="Technical Setup">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
                            <ConfigBox label="Duración" value="10 Min" />
                            <ConfigBox label="Espera" value="Largo" />
                            <ConfigBox label="Pausas" value="9" />
                            <ConfigBox label="Condición" value="Al Azar" />
                            <ConfigBox label="Lesión" value="Sí" />
                            <ConfigBox label="Cambios" value="3" />
                            <ConfigBox label="Clima" value="Despejado" />
                            <ConfigBox label="Momento" value="Día/Noche" />
                            <ConfigBox label="Pass Salón" value="pes6" />
                            <ConfigBox label="Match" value="Exhibición" />
                        </div>
                        <div className="bg-red-600/10 border-l-8 border-red-600 p-8 relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 opacity-10 font-bebas text-8xl italic select-none">Warning</div>
                            <h4 className="text-red-500 font-bebas text-3xl mb-2 uppercase tracking-tighter italic">Protocolo de Error</h4>
                            <p className="font-barlow text-gray-400 text-lg leading-relaxed">
                                Si la configuración es incorrecta, el DT rival puede exigir el re-ajuste <strong>antes del pitazo inicial</strong>. Una vez rodada la pelota, el resultado se considera <span className="text-white underline">Firme e Inapelable</span>.
                            </p>
                        </div>
                    </RegBlock>

                    {/* SECCIÓN 3: REPORTES */}
                    <RegBlock title="Reporte de Resultados" subtitle="">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                            <div className="space-y-8">
                                <p className="text-xl font-barlow italic text-gray-400">
                                    La validez de los puntos depende de la evidencia. Es <strong className="text-white border-b border-[#c9a84c]">obligatorio</strong> presentar 3 capturas:
                                </p>
                                <ul className="space-y-4">
                                    {["Marcador final con nombres de equipos", "Estadísticas completas de partido", "Goleadores y minutos de los tantos"].map((text, i) => (
                                        <li key={i} className="flex items-center gap-4 group">
                                            <span className="w-8 h-8 rounded-full bg-[#c9a84c] text-black flex items-center justify-center font-bebas text-xl group-hover:scale-110 transition-transform">{i + 1}</span>
                                            <span className="text-xl font-barlow uppercase tracking-wider group-hover:text-[#c9a84c] transition-colors">{text}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="bg-white/5 p-8 border-t-2 border-[#c9a84c]">
                                    <p className="font-barlow text-lg italic leading-relaxed text-gray-500">
                                        <span className="text-[#c9a84c] font-bebas text-2xl not-italic block mb-1">Tip de Experto:</span>
                                        Usa <kbd className="bg-black px-2 py-1 rounded text-[#c9a84c] mx-1 border border-white/10">WIN + SHIFT + S</kbd> para capturas rápidas. Asegúrate de que el chat no tape los goles.
                                    </p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-4 bg-[#c9a84c]/10 blur-2xl rounded-full"></div>
                                <div className="relative bg-[#111] border border-white/10 p-3 group">
                                    <div className="absolute inset-0 bg-[#c9a84c] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                    <div className="bg-[#222] text-[10px] font-barlow tracking-[5px] text-[#c9a84c] uppercase p-2 mb-3 text-center border-b border-white/5 italic">
                                        ejemplos de capturas a subir
                                    </div>
                                    <div className="relative aspect-video bg-black/50 overflow-hidden border border-white/5">
                                        <Image
                                            src="/img/ejemplo.jpg"
                                            alt="Captura de ejemplo"
                                            fill
                                            className="object-contain grayscale-[50%] group-hover:grayscale-0 transition-all duration-700 scale-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </RegBlock>

                    {/* SECCIÓN 4: W.O. */}
                    <RegBlock title="Partidos No Jugados" subtitle="">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <WOBox num="A" title="Empate Técnico" desc="Ambos DT mostraron predisposición pero no hubo coincidencia horaria." />
                            <WOBox num="B" title="Ausencia Total" desc="Falta de señales en el post. Pérdida de puntos y multa de $5M." isRed />
                            <WOBox num="C" title="Plantado" desc="Incumplimiento de cita pactada. Los 3 puntos van al DT presente." />
                        </div>
                        <div className="mt-12 bg-green-600/5 border-l-4 border-green-600 p-8 group">
                            <h4 className="font-bebas text-3xl text-green-500 mb-4 italic uppercase">Criterio del Moderador</h4>
                            <p className="font-barlow text-gray-400 text-lg leading-relaxed italic">
                                Se valorarán los comentarios con <strong className="text-white">intervalos horarios coherentes</strong>.
                                <span className="block mt-2 text-green-600 group-hover:translate-x-2 transition-transform">✓ Evitar proponer horarios de madrugada de forma sistemática.</span>
                            </p>
                        </div>
                    </RegBlock>

                    {/* SECCIÓN 5: ECONOMÍA */}
                    <RegBlock title="Gestión de Club" subtitle="">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gradient-to-br from-[#111] to-black p-10 border-l-4 border-[#c9a84c] relative overflow-hidden">
                                <h4 className="font-bebas text-4xl text-[#c9a84c] mb-4 italic">Retiros</h4>
                                <p className="font-barlow text-xl text-gray-400 leading-snug">
                                    Jugador con <strong className="text-white">40 años</strong> o retiro real queda fuera.
                                    El club recupera el <span className="text-green-500 font-bebas text-2xl">80% de su valor</span>.
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-[#111] to-black p-10 border-l-4 border-[#c9a84c]">
                                <h4 className="font-bebas text-4xl text-[#c9a84c] mb-4 italic">Planteles</h4>
                                <p className="font-barlow text-xl text-gray-400 leading-snug">
                                    Cupo mínimo: <strong className="text-white">18</strong> jugadores. <br />
                                    Cupo máximo: <strong className="text-white">26</strong> jugadores.
                                </p>
                            </div>
                        </div>
                        <p className="text-center font-bebas text-3xl text-red-700 mt-12 animate-pulse uppercase italic tracking-tighter">
                            Prohibido finalizar mercado con saldo negativo
                        </p>
                    </RegBlock>
                    {/* SECCIÓN 6: INTERINATOS T4 */}
                    <RegBlock title="Interinatos y Bajas" subtitle="">
                        <div className="space-y-12">

                            {/* Grilla Principal de Reglas */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                                {/* Bloque: Procedimiento de Aviso */}
                                <div className="bg-[#111] p-8 border-l-4 border-[#c9a84c] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 font-bebas text-7xl italic">Aviso</div>
                                    <h4 className="font-bebas text-3xl text-[#c9a84c] mb-6 italic uppercase tracking-tighter">Solicitud de Interino</h4>
                                    <div className="space-y-4 font-barlow text-lg italic text-gray-400">
                                        <p>
                                            Los DTs que deban ausentarse deberán publicar en la sección
                                            <strong className="text-white mx-1">"Ausencias y Abandonos"</strong>
                                            especificando motivos y tiempo estimado.
                                        </p>
                                        <div className="bg-white/5 p-4 border border-white/10">
                                            <p className="text-sm uppercase font-bold tracking-widest text-[#c9a84c]">
                                                (*) REGLA DE ORO:
                                            </p>
                                            <p className="text-white mt-1">
                                                El aviso debe realizarse mínimo <span className="underline decoration-[#c9a84c]">3 DÍAS ANTES</span> del cierre de la fecha; de lo contrario, se pierde por default.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bloque: Tiempos y Prórrogas */}
                                <div className="bg-[#111] p-8 border-l-4 border-white/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 font-bebas text-7xl italic">Timer</div>
                                    <h4 className="font-bebas text-3xl text-white mb-6 italic uppercase tracking-tighter">Ciclo de Ausencia</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-black/40 border border-white/5">
                                            <div className="font-bebas text-4xl text-[#c9a84c]">2 Sem.</div>
                                            <div className="font-barlow text-[10px] uppercase text-gray-500">Interinato</div>
                                        </div>
                                        <div className="text-center p-4 bg-black/40 border border-red-900/30">
                                            <div className="font-bebas text-4xl text-red-600">+1 Sem.</div>
                                            <div className="font-barlow text-[10px] uppercase text-gray-500">Prórroga (W.O.)</div>
                                        </div>
                                        <div className="text-center p-4 bg-red-600 text-black">
                                            <div className="font-bebas text-4xl">Quita</div>
                                            <div className="font-barlow text-[10px] uppercase font-bold">De Equipo</div>
                                        </div>
                                    </div>
                                    <p className="mt-6 font-barlow text-sm text-gray-500 italic">
                                        Cumplido el ciclo (3 semanas totales sin retorno), el Comité procederá a la asignación de un nuevo DT de forma inmediata.
                                    </p>
                                </div>
                            </div>

                            {/* Bloque: Limitaciones y Restricciones */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <WOBox
                                    num="01"
                                    title="Cupos por Temporada"
                                    desc="Máximo 2 interinatos por DT. Para el segundo, deben haber pasado al menos 2 semanas desde el fin del primero."
                                />
                                <WOBox
                                    num="02"
                                    title="Asignación Neutral"
                                    desc="El Comité asignará un DT interino de otra división para garantizar la transparencia y evitar cruce de intereses."
                                />
                                <WOBox
                                    num="03"
                                    title="Copa (Fase Eliminatoria)"
                                    desc="Prohibido el uso de interinos en Playoffs de Copa. El equipo perderá por default, SALVO QUE SEA UNA FINAL."
                                    isRed
                                />
                            </div>

                            {/* Alertas Administrativas Importantes */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-[#1a0e0e] border border-[#3a1a1a] p-8 group">
                                    <h5 className="font-bebas text-2xl text-red-500 mb-2 italic">ABANDONO SIN AVISO</h5>
                                    <p className="font-barlow text-gray-400 italic">
                                        Una ausencia sin aviso previo de <strong className="text-white">2 semanas</strong> implica la quita automática del equipo y el ingreso del usuario a la lista de sanciones graves.
                                    </p>
                                </div>

                                <div className="bg-[#0e1a12] border border-[#1a3a22] p-8 group">
                                    <h5 className="font-bebas text-2xl text-green-500 mb-2 italic">AVISO DE LARGA DURACIÓN</h5>
                                    <p className="font-barlow text-gray-400 italic">
                                        Si el DT sabe que se ausentará más de <strong className="text-white">3 semanas</strong>, debe informarlo para proceder directamente con un nuevo DT, ahorrando el proceso de prórroga.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </RegBlock>

                </div>
            </div>

            {/* FOOTER DECORATIVO */}
            <footer className="py-32 border-t border-white/5 bg-[#080808] overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-6 opacity-20 flex flex-col items-center">
                    <div className="font-bebas text-[12vw] leading-none uppercase italic tracking-tighter whitespace-nowrap">
                        El Legado - Reglamento
                    </div>
                </div>
            </footer>
        </main>
    );
}

// --- COMPONENTES AUXILIARES ---

function RegBlock({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) {
    return (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col mb-16">
                <span className="text-[#c9a84c] font-barlow text-sm tracking-[8px] uppercase mb-2">{subtitle}</span>
                <h2 className="font-bebas text-6xl md:text-8xl italic uppercase tracking-tighter leading-none">
                    {title}
                </h2>
                <div className="w-full h-[1px] bg-white/5 mt-6"></div>
            </div>
            {children}
        </section>
    );
}

function RegItem({ num, title, children }: { num: string, title: string, children: React.ReactNode }) {
    return (
        <div className="flex gap-6 items-start group">
            <span className="font-bebas text-5xl text-[#c9a84c]/20 group-hover:text-[#c9a84c] transition-colors leading-none">{num}</span>
            <div className="space-y-2">
                <h4 className="font-bebas text-3xl uppercase italic tracking-tight text-white">{title}</h4>
                <div className="font-barlow text-lg text-gray-500 leading-relaxed max-w-2xl italic">{children}</div>
            </div>
        </div>
    );
}

function ConfigBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-[#111] border border-white/5 p-5 flex flex-col justify-center items-center group hover:border-[#c9a84c] transition-all hover:scale-105 skew-x-[-10deg]">
            <div className="skew-x-[10deg] text-center">
                <span className="font-barlow text-[10px] tracking-[3px] text-gray-600 uppercase block mb-1">{label}</span>
                <span className="font-bebas text-2xl text-[#c9a84c] group-hover:text-white transition-colors uppercase italic">{value}</span>
            </div>
        </div>
    );
}

function WOBox({ num, title, desc, isRed }: { num: string, title: string, desc: string, isRed?: boolean }) {
    return (
        <div className={`p-8 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all ${isRed ? 'bg-red-900/10' : 'bg-[#111]'}`}>
            <span className={`font-bebas text-6xl absolute top-0 right-4 opacity-10 ${isRed ? 'text-red-600' : 'text-[#c9a84c]'}`}>{num}</span>
            <h4 className={`font-bebas text-3xl mb-4 italic ${isRed ? 'text-red-500' : 'text-white'}`}>{title}</h4>
            <p className="font-barlow text-gray-500 leading-snug italic">{desc}</p>
        </div>
    );
}