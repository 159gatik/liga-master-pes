"use client";
import Image from "next/image";

export default function ReglamentoPes2013() {
    return (
        <main className="min-h-screen bg-[#0a1628] text-[#e8f4ff] font-sans p-6 md:p-10">

            {/* HEADER */}
            <div className="max-w-5xl mx-auto mb-10 border-l-4 border-[#00aaff] pl-5">
                <h1 className="font-bebas text-5xl md:text-7xl tracking-[5px] uppercase text-white">
                    Reglamento
                </h1>
            </div>

            <div className="max-w-5xl mx-auto space-y-12">

                {/* INTRO */}
                <section className="bg-[#0d1f3c] border border-[#1a3a5c] border-l-4 border-l-[#00aaff] p-6 text-[#5588aa] leading-relaxed">
                    <p>
                        El siguiente reglamento rige para <strong className="text-white">todos los participantes</strong> del torneo PES 2013.
                        El desconocimiento de las normas no exime de su cumplimiento. Ante cualquier duda, consultar con los organizadores
                        <strong className="text-[#00aaff]"> antes </strong> de jugar el partido.
                    </p>
                </section>

                {/* SECCIÓN 1 */}
                <RegBlock title="Ascensos, Descensos y Promoción">
                    <p className="mb-4 text-[16px]">La liga está compuesta por 20 equipos: <span className="text-[#00aaff]">Primera A (10)</span> y <span className="text-[#00aaff]">Primera B (10)</span>.</p>
                    <ul className="space-y-4">
                        <RegItem num="01" title="Descensos Directos">
                            <p>Descenderán los <strong className="text-white">DOS últimos equipos de la A</strong> (9° y 10° posición).</p>
                        </RegItem>
                        <RegItem num="02" title="Ascensos Directos">
                            <p>Ascenderán los <strong className="text-white">DOS primeros equipos de la B</strong> (1° y 2° posición).</p>
                        </RegItem>
                        <RegItem num="03" title="Promoción">
                            <p>Se disputará ida y vuelta entre el <strong className="text-white">8º de Primera A y el 3º de Primera B</strong>. En empate global, el equipo de Primera A cuenta con <span className="text-[#00aaff]">ventaja deportiva</span>.</p>
                        </RegItem>
                    </ul>
                </RegBlock>

                {/* SECCIÓN 2 */}
                <RegBlock title="Configuración Obligatoria">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <ConfigBox label="Duración" value="10 Min" />
                        <ConfigBox label="Espera" value="Largo" />
                        <ConfigBox label="Pausas" value="9" />
                        <ConfigBox label="Condición" value="Al Azar" />
                        <ConfigBox label="Lesión" value="Sí" />
                        <ConfigBox label="Cambios" value="3" />
                        <ConfigBox label="Clima" value="Despejado" />
                        <ConfigBox label="Momento" value="Día/Noche" />
                        <ConfigBox label="Pass Salón" value="pes2013" />
                    </div>
                    <div className="bg-[#0a1628] border border-[#1a3a5c] border-l-4 border-l-red-500 p-4 text-[16px] text-[#aa8888]">
                        <h4 className="text-red-500 font-bold mb-2 uppercase tracking-widest text-xs italic">IMPORTANTE</h4>
                        <p>Si la configuración es incorrecta, el DT rival puede exigir el re-ajuste <strong>antes de empezar</strong>. Se requiere captura de pantalla como aval.</p>
                    </div>
                </RegBlock>

                {/* SECCIÓN 3 */}
                <RegBlock title="Reporte de Resultados">
                    <p className="mb-4">Para que un resultado sea válido, es <strong className="text-white border-b border-[#00aaff]">obligatorio</strong> presentar capturas claras de:</p>
                    <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2 text-m text-[#5588aa]">
                            <span className="text-[#00aaff] text-[20px]">✔</span> Marcador final y equipos.
                        </li>
                        <li className="flex items-center gap-2 text-m text-[#5588aa]">
                            <span className="text-[#00aaff]">✔</span> Estadísticas (Disparos, Posesión, Faltas).
                        </li>
                        <li className="flex items-center gap-2 text-m text-[#5588aa]">
                            <span className="text-[#00aaff]">✔</span> Goleadores y minutos de los tantos.
                        </li>
                    </ul>
                    <div className="bg-[#0d1f3c] p-6 border-t-2 border-[#00aaff]">
                        <p className="text-[16px] text-[#5588aa] leading-relaxed">
                            <span className="text-[#00aaff] font-bold uppercase tracking-tighter">Tip:</span>{" "}
                            Usá <kbd className="bg-[#0a1628] px-1 rounded text-white text-[18px]">WIN + SHIFT + S</kbd> para capturar pantalla en Windows.
                        </p>
                    </div>
                </RegBlock>

                {/* SECCIÓN 4 */}
                <RegBlock title="Partidos No Jugados (W.O.)">
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
                    <div className="mt-8 bg-[#0a1f14] border border-[#1a3a22] border-l-4 border-l-[#27ae60] p-6">
                        <h4 className="font-barlow-condensed font-bold uppercase tracking-[2px] text-[#27ae60] mb-2">
                            Criterio del moderador
                        </h4>
                        <p className="text-[16px] text-[#88aa88] leading-relaxed">
                            La valoración dependerá de lo comentado por los DTs en el post y la predisposición a coordinar.
                            <span className="block mt-2 italic text-[#27ae60]">Evitar proponer horarios de madrugada si es posible.</span>
                        </p>
                    </div>
                </RegBlock>

                {/* SECCIÓN 5 */}
                <RegBlock title="Criterios de Desempate">
                    <ol className="list-decimal pl-5 space-y-2 text-[#5588aa] text-[16px]">
                        <li>Enfrentamiento directo (Ida y Vuelta).</li>
                        <li>Si persiste el empate, 3er partido con Tiempo Extra y Penales.</li>
                        <li>Si son 3 o más equipos, se juega <span className="text-white uppercase italic">Liguilla</span>.</li>
                    </ol>
                </RegBlock>

                {/* SECCIÓN 6 */}
                <RegBlock title="Interinatos y Ausencias">
                    <ul className="space-y-4 text-[#5588aa] text-[16px]">
                        <li>• Avisar <strong className="text-white">3 días antes</strong> del cierre de fecha.</li>
                        <li>• Los interinatos duran <span className="text-[#00aaff]">2 semanas</span>.</li>
                        <li>• Máximo 2 interinatos por temporada.</li>
                        <li>• <strong className="text-red-500 uppercase">Prohibido:</strong> Interinatos en eliminatorias de Copa.</li>
                        <li>• Una ausencia sin aviso de 2 semanas implica la <strong className="text-white underline">quita inmediata del equipo</strong>.</li>
                    </ul>
                </RegBlock>

                {/* SECCIÓN 7 */}
                <RegBlock title="Retiros, Planteles y Sueldos">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="bg-[#0d1f3c] p-4 border border-[#1a3a5c]">
                            <h4 className="text-[#00aaff] text-[18px] font-bold mb-2 uppercase">Retiros</h4>
                            <p className="text-[16px] text-[#5588aa]">Jugador con <strong className="text-white">40 años</strong> o retiro real = fuera del juego. El club recibe el <span className="text-green-500">80% de su cotización</span>.</p>
                        </div>
                        <div className="bg-[#0d1f3c] p-4 border border-[#1a3a5c]">
                            <h4 className="text-[#00aaff] text-[18px] font-bold mb-2 uppercase">Planteles</h4>
                            <p className="text-[16px] text-[#5588aa]">Mínimo: <strong className="text-white">18</strong> / Máximo: <strong className="text-white">26</strong> jugadores.</p>
                        </div>
                    </div>
                    <p className="mt-4 text-white text-m italic">Aviso: No se puede terminar el mercado en saldo negativo bajo pena de sanción.</p>
                </RegBlock>

            </div>
        </main>
    );
}

// ── Componentes reutilizables ──────────────────────────────────────────────────

function RegBlock({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section>
            <div className="flex items-center gap-3 mb-6 border-b border-[#1a3a5c] pb-2">
                <h3 className="font-bebas text-2xl md:text-3xl tracking-[3px] text-[#00aaff] uppercase">{title}</h3>
            </div>
            <div className="pl-0 md:pl-10">{children}</div>
        </section>
    );
}

function RegItem({ num, title, children }: { num: string, title: string, children: React.ReactNode }) {
    return (
        <div className="flex gap-4 items-start border-b border-[#0d1f3c] pb-4 last:border-0">
            <span className="font-bebas text-3xl text-[#00aaff] leading-none">{num}</span>
            <div className="space-y-1">
                <h4 className="font-barlow-condensed font-bold uppercase tracking-[2px] text-white">{title}</h4>
                <div className="text-[15px] text-[#5588aa] leading-relaxed">{children}</div>
            </div>
        </div>
    );
}

function ConfigBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-[#0d1f3c] border border-[#1a3a5c] p-3 flex justify-between items-center group hover:border-[#00aaff] transition-colors">
            <span className="font-barlow-condensed text-[16px] tracking-[2px] text-[#3a6688] uppercase">{label}</span>
            <span className="font-barlow-condensed font-bold text-sm text-[#00aaff]">{value}</span>
        </div>
    );
}