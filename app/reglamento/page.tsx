"use client";
import Image from 'next/image';

export default function ReglamentoPage() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans p-6 md:p-10">

            {/* HEADER */}
            <div className="max-w-5xl mx-auto mb-10 border-l-4 border-[#c9a84c] pl-5 flex items-baseline gap-4">
                <h1 className="font-bebas text-4xl md:text-6xl tracking-[5px] uppercase text-white">Reglamento</h1>
            </div>

            <div className="max-w-5xl mx-auto space-y-12">

                {/* INTRO */}
                <section className="bg-[#111111] border border-[#2a2a2a] border-l-4 border-l-[#c9a84c] p-6 text-[#888] leading-relaxed">
                    <p>
                        El siguiente reglamento rige para <strong className="text-white">todos los participantes</strong> del torneo El Legado.
                        El desconocimiento de las normas no exime de su cumplimiento. Ante cualquier duda, consultar con los organizadores
                        <strong className="text-[#c9a84c]"> antes </strong> de jugar el partido.
                    </p>
                </section>
                {/* SECCIÓN 1: ASCENSOS Y DESCENSOS */}
                <RegBlock icon="" title="Ascensos, Descensos y Promoción (Proximamente)">

                    <p className="mb-4 text-[16px]">La liga está compuesta por 20 equipos: <span className="text-[#c9a84c]">Primera A (10)</span> y <span className="text-[#c9a84c]">Primera B (10)</span>.</p>
                    <ul className="space-y-4 ">
                        <RegItem num="01" title="Descensos Directos">
                            <p>Descenderán los <strong className="text-white">DOS últimos equipos de la “A”</strong> (9° y 10° posición).</p>
                        </RegItem>
                        <RegItem num="02" title="Ascensos Directos">
                            <p>Ascenderán a la máxima competencia los <strong className="text-white">DOS primeros equipos de la “B”</strong> (1° y 2° posición).</p>
                        </RegItem>
                        <RegItem num="03" title="Promoción">
                            <p>Se disputará ida y vuelta entre el <strong className="text-white">8º de Primera A y el 3º de Primera B</strong>. En caso de empate global, el equipo de Primera A cuenta con <span className="text-[#c9a84c]">ventaja deportiva</span>.</p>
                        </RegItem>

                    </ul>
                </RegBlock>

                {/* SECCIÓN 2: CONFIGURACIÓN DEL PARTIDO */}
                <RegBlock icon="" title="Configuración Obligatoria">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <ConfigBox label="Duración" value="10 Min" />
                        <ConfigBox label="Espera" value="Largo" />
                        <ConfigBox label="Pausas" value="9" />
                        <ConfigBox label="Condición" value="Al Azar" />
                        <ConfigBox label="Lesión" value="Sí" />
                        <ConfigBox label="Cambios" value="3" />
                        <ConfigBox label="Clima" value="Despejado" />
                        <ConfigBox label="Momento" value="Día/Noche" />
                        <ConfigBox label="Pass Salón" value="pes6" />
                    </div>
                    <div className="bg-[#1a0e0e] border border-[#3a1a1a] p-4 text-[16px] text-[#aa8888]">
                        <h4 className="text-red-500 font-bold mb-2 uppercase tracking-widest text-xs italic"> IMPORTANTE</h4>
                        <p>Si la configuración es incorrecta, el DT rival puede exigir el re-ajuste <strong>antes de empezar</strong>. Se requiere captura de pantalla como aval. Una vez jugado, el resultado es válido y no hay reclamo.</p>
                    </div>
                </RegBlock>

                {/* SECCIÓN 3: CAPTURAS Y RESULTADOS */}
                <RegBlock icon="" title="Reporte de Resultados">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div>
                            <p className="mb-4">Para que un resultado sea válido, es <strong className="text-white border-b border-[#c9a84c]">obligatorio</strong> presentar capturas claras de:</p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center gap-2 text-m text-[#888]">
                                    <span className="text-[#c9a84c] text-[20px]">✔</span> Marcador final y equipos.
                                </li>
                                <li className="flex items-center gap-2 text-m text-[#888]">
                                    <span className="text-[#c9a84c] text-[16px]">✔</span> Estadísticas (Disparos, Posesión, Faltas).
                                </li>
                                <li className="flex items-center gap-2 text-m text-[#888]">
                                    <span className="text-[#c9a84c] text-[16px]">✔</span> Goleadores y minutos de los tantos.
                                </li>
                            </ul>

                            <div className="bg-[#1a1a1a] p-8 border-t-2 border-[#c9a84c] rounded-r">
                                <p className="text-[18px] text-[#888] leading-relaxed">
                                    <span className="text-[#c9a84c] font-bold uppercase tracking-tighter">Tip de captura:</span><br />
                                    Podés usar el comando <kbd className="bg-[#333] px-1 rounded text-white text-[18px]">WIN + SHIFT + S</kbd> en Windows o cualquier programa de captura de pantalla. Asegurate de que la imagen sea legible.
                                </p>
                            </div>
                        </div>

                        {/* IMAGEN DE EJEMPLO */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-[#c9a84c] opacity-20 blur group-hover:opacity-40 transition duration-300"></div>
                            <div className="relative bg-[#111] border border-[#2a2a2a] p-2">
                                <div className="bg-[#222] text-[10px] font-barlow-condensed tracking-[2px] text-[#c9a84c] uppercase p-1 mb-2 text-center border-b border-[#333]">
                                    Ejemplo de imagenes a subir
                                </div>

                                <Image
                                    src="/img/ejemplo.jpg"
                                    alt="Ejemplo de captura de PES 6"
                                    width={800} // Ajusta según el tamaño real
                                    height={600} // Ajusta según el tamaño real
                                    className="w-full h-auto grayscale-[30%] hover:grayscale-0 transition-all duration-500"
                                    priority // Esto ayuda a que cargue rápido por ser importante
                                />
                            </div>
                        </div>
                    </div>
                </RegBlock>

                {/* SECCIÓN 4: CRITERIOS POR PARTIDOS NO JUGADOS */}
                <RegBlock icon="" title="Partidos No Jugados (W.O.)">
                    <ul className="space-y-6">
                        <RegItem num="A" title="Empate Técnico">
                            <p>Si ambos DT intentaron pero no concretaron, el partido se da por empatado.</p>
                        </RegItem>
                        <RegItem num="B" title="Ausencia sin señal">
                            <p>Si un DT no da señales en el post, pierde el partido y recibe una multa de <span className="text-red-500 font-bold">$5.000.000</span>.</p>
                        </RegItem>
                        <RegItem num="C" title="Incumplimiento de cita">
                            <p>Si pactaron día/horario y uno no se conecta, el DT presente debe avisar en el post para recibir los 3 puntos.</p>
                        </RegItem>
                    </ul>

                    {/* RECUADRO VERDE DE CRITERIO DEL MODERADOR */}
                    <div className="mt-8 bg-[#0e1a12] border border-[#1a3a22] border-l-4 border-l-[#27ae60] p-6">
                        <div className="flex items-center gap-2 mb-3">

                            <h4 className="font-barlow-condensed font-bold uppercase tracking-[2px] text-[#27ae60]">
                                Criterio del moderador
                            </h4>
                        </div>
                        <p className="text-[16px] text-[#88aa88] leading-relaxed">
                            La valoración que realice el moderador dependerá de lo comentado por los DT&apos;s en el post de la fecha y la predisposición a la hora de coordinar los partidos.
                            Serán mejor valorados los comentarios donde quede asentado un <strong className="text-white">intervalo horario coherente</strong>.
                            <span className="block mt-2 italic text-[#27ae60] underline underline-offset-4">Evitar proponer horarios de madrugada si es posible.</span>
                        </p>
                    </div>
                </RegBlock>

                {/* SECCIÓN 5: DESEMPATES */}
                <RegBlock icon="" title="Criterios de Desempate">
                    <div className="space-y-4 text-[18px] leading-relaxed">
                        <p>Si hay igualdad de puntos en puestos críticos:</p>
                        <ol className="list-decimal pl-5 space-y-2 text-[#888] text-[16px]">
                            <li>Enfrentamiento directo (Ida y Vuelta).</li>
                            <li>Si persiste el empate, 3er partido con Tiempo Extra y Penales.</li>
                            <li>Si son 3 o más equipos, se juega <span className="text-white uppercase tracking-tighter italic">Liguilla</span> (Puntos → Entre sí → Dif. Gol → Goles a favor).</li>
                        </ol>
                    </div>
                </RegBlock>

                {/* SECCIÓN 6: INTERINATOS Y AUSENCIAS */}
                <RegBlock icon="" title="Interinatos y Ausencias">
                    <ul className="space-y-4 text-sm text-[#888] text-[16px]">
                        <li>• Avisar <strong className="text-white">3 días antes</strong> del cierre de fecha en la sección correspondiente.</li>
                        <li>• Los interinatos duran <span className="text-[#c9a84c]">2 semanas</span> (con 1 semana extra de prórroga sin interino).</li>
                        <li>• Máximo 2 interinatos por temporada.</li>
                        <li>• <strong className="text-red-500 uppercase">Prohibido:</strong> Interinatos en eliminatorias de Copa (salvo finales).</li>
                        <li>• Una ausencia sin aviso de 2 semanas implica la <strong className="text-white underline">quita inmediata del equipo</strong>.</li>
                    </ul>
                </RegBlock>

                {/* SECCIÓN 7: ECONOMÍA Y JUGADORES */}
                <RegBlock icon="" title="Retiros, Planteles y Sueldos">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="bg-[#1a1a1a] p-4 border border-[#2a2a2a]">
                            <h4 className="text-[#c9a84c] text-[18px] font-bold mb-2 uppercase">Retiros</h4>
                            <p className='text-[16px]'>Jugador con <strong className="text-white">40 años</strong> o retiro real = fuera del juego. El club recibe el <span className="text-green-500">80% de su cotización</span>.</p>
                        </div>
                        <div className="bg-[#1a1a1a] p-4 border border-[#2a2a2a]">
                            <h4 className="text-[#c9a84c] text-[18px] font-bold mb-2 uppercase">Planteles</h4>
                            <p className='text-[16px]'>Mínimo: <strong className="text-white">18</strong> / Máximo: <strong className="text-white">26</strong> jugadores.</p>
                        </div>
                    </div>
                    <p className="mt-4 text-white text-m italic">Aviso: No se puede terminar el mercado en saldo negativo bajo pena de sanción del comité.</p>
                </RegBlock>

            </div>
        </main>
    );
}

// Componentes Reutilizables para el diseño
function RegBlock({ icon, title, children }: { icon: string, title: string, children: React.ReactNode }) {
    return (
        <section className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-6 border-b border-[#2a2a2a] pb-2">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-bebas text-2xl md:text-3xl tracking-[3px] text-[#c9a84c] uppercase">{title}</h3>
            </div>
            <div className="pl-0 md:pl-10">
                {children}
            </div>
        </section>
    );
}

function RegItem({ num, title, children }: { num: string, title: string, children: React.ReactNode }) {
    return (
        <div className="flex gap-4 items-start border-b border-[#1a1a1a] pb-4 last:border-0">
            <span className="font-bebas text-3xl text-[#c9a84c] leading-none">{num}</span>
            <div className="space-y-1">
                <h4 className="font-barlow-condensed font-bold uppercase tracking-[2px] text-white">{title}</h4>
                <div className="text-[15px] text-[#888] leading-relaxed">{children}</div>
            </div>
        </div>
    );
}

function ConfigBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-3 flex justify-between items-center group hover:border-[#c9a84c] transition-colors">
            <span className="font-barlow-condensed text-[16px] tracking-[2px] text-[#888] uppercase">{label}</span>
            <span className="font-barlow-condensed font-bold text-sm text-[#c9a84c]">{value}</span>
        </div>
    );
}