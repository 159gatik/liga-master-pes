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
                            <p>Descenderán los <strong className="text-white">DOS últimos equipos de la A</strong>.</p>
                        </RegItem>
                        <RegItem num="02" title="Ascensos Directos">
                            <p>Ascenderán los <strong className="text-white">DOS primeros equipos de la B</strong>.</p>
                        </RegItem>
                        <RegItem num="03" title="Promoción">
                            <p>Ida y vuelta entre el <strong className="text-white">8º de A y 3º de B</strong>. La A tiene <span className="text-[#00aaff]">ventaja deportiva</span>.</p>
                        </RegItem>
                    </ul>
                </RegBlock>

                {/* SECCIÓN 2 */}
                <RegBlock title="Configuración Obligatoria">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <ConfigBox label="Duración" value="10 Min" />
                        <ConfigBox label="Espera" value="Largo" />
                        <ConfigBox label="Pausas" value="2" />
                        <ConfigBox label="Condición" value="Al Azar" />
                        <ConfigBox label="Lesión" value="Sí" />
                        <ConfigBox label="Cambios" value="3" />
                        <ConfigBox label="Clima" value="Despejado" />
                        <ConfigBox label="Momento" value="Día/Noche" />
                    </div>

                    <div className="bg-[#0a1628] border border-[#1a3a5c] border-l-4 border-l-red-500 p-4 text-[16px] text-[#aa8888]">
                        <h4 className="text-red-500 font-bold mb-2 uppercase tracking-widest text-xs italic">IMPORTANTE</h4>
                        <p>Si la configuración es incorrecta, el DT rival puede exigir el re-ajuste antes de empezar. Se requiere captura de pantalla como aval.</p>
                    </div>
                </RegBlock>

                {/* NUEVA SECCIÓN */}
                <RegBlock title="Modalidad de Juego">
                    <ul className="space-y-3 text-[#5588aa]">
                        <li>• El jugador local hostea la partida.</li>
                        <li>• El visitante se conecta y verifica controles.</li>
                        <li>• Se recomienda usar Discord para coordinar y avisar pausas.</li>
                    </ul>
                </RegBlock>

                {/* NUEVA SECCIÓN */}
                <RegBlock title="Control de Tiempos">
                    <ul className="space-y-3 text-[#5588aa]">
                        <li>• Cada jugador dispone de <strong className="text-white">2 pausas</strong>.</li>
                        <li>• Cada pausa dura máximo <strong className="text-white">30 segundos</strong>.</li>
                        <li>• Entretiempo máximo: <strong className="text-white">45 segundos</strong>.</li>
                        <li>• Cambios incluidos dentro de la pausa.</li>
                    </ul>

                    <div className="mt-6 bg-[#0a1628] border border-[#1a3a5c] p-4">
                        <h4 className="text-[#00aaff] font-bold mb-2">Regla obligatoria</h4>
                        <p className="text-[#5588aa]">
                            La pausa SOLO puede hacerse cuando la pelota esté fuera de juego (lateral, córner, saque de arco).
                        </p>
                    </div>

                    <div className="mt-4 text-[#aa8888]">
                        ❌ Prohibido pausar con la pelota en juego o en jugadas peligrosas.
                    </div>
                </RegBlock>

                {/* NUEVA SECCIÓN */}
                <RegBlock title="Reglas Anti-Avivadas">
                    <ul className="space-y-3 text-[#5588aa]">
                        <li>• Prohibido hacer tiempo excesivo.</li>
                        <li>• No demorar pausas o entretiempo.</li>
                        <li>• No pausar en jugadas de gol.</li>
                        <li>• No usar cambios para cortar ritmo constantemente.</li>
                        <li>• Prohibido provocar lag o desconexiones intencionales.</li>
                    </ul>
                </RegBlock>

                {/* NUEVA SECCIÓN */}
                <RegBlock title="Grabación y Comité">
                    <ul className="space-y-3 text-[#5588aa]">
                        <li>• Se recomienda grabar los partidos.</li>
                        <li>• Sirve como prueba para reclamos.</li>
                        <li>• El comité evaluará cada caso.</li>
                        <li>• Sin pruebas, se mantiene el resultado.</li>
                    </ul>
                </RegBlock>

                {/* SECCIÓN 3 */}
                <RegBlock title="Reporte de Resultados">
                    <p className="mb-4">Para que un resultado sea válido, es obligatorio presentar capturas claras de:</p>
                    <ul className="space-y-3 mb-6">
                        <li>✔ Marcador final y equipos.</li>
                        <li>✔ Estadísticas.</li>
                        <li>✔ Goleadores y minutos.</li>
                    </ul>
                    <p className="text-[#00aaff]">Tip: WIN + SHIFT + S</p>
                </RegBlock>

                {/* SECCIÓN 4 */}
                <RegBlock title="Partidos No Jugados (W.O.)">
                    <RegItem num="A" title="Empate Técnico">
                        <p>Si ambos intentaron jugar, es empate.</p>
                    </RegItem>
                    <RegItem num="B" title="Ausencia">
                        <p>Multa de <span className="text-red-500">$5.000.000</span>.</p>
                    </RegItem>
                    <RegItem num="C" title="Incumplimiento">
                        <p>El presente gana los puntos.</p>
                    </RegItem>
                </RegBlock>

                {/* RESTO IGUAL */}
                <RegBlock title="Criterios de Desempate">
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Enfrentamiento directo</li>
                        <li>Partido desempate</li>
                        <li>Liguilla</li>
                    </ol>
                </RegBlock>

                <RegBlock title="Interinatos y Ausencias">
                    <ul className="space-y-2">
                        <li>• Avisar 3 días antes</li>
                        <li>• Duran 2 semanas</li>
                        <li>• Máximo 2</li>
                    </ul>
                </RegBlock>

                <RegBlock title="Retiros y Planteles">
                    <p>Planteles: 18 a 26 jugadores.</p>
                    <p>No saldo negativo.</p>
                </RegBlock>

            </div>
        </main>
    );
}

// COMPONENTES

type RegBlockProps = {
    title: string;
    children: React.ReactNode;
};

function RegBlock({ title, children }: RegBlockProps) {
    return (
        <section>
            <h3 className="text-[#00aaff] text-2xl mb-4 uppercase">{title}</h3>
            {children}
        </section>
    );
}

type RegItemProps = {
    num: string;
    title: string;
    children: React.ReactNode;
};

function RegItem({ num, title, children }: RegItemProps) {
    return (
        <div className="flex gap-3">
            <span className="text-[#00aaff]">{num}</span>
            <div>
                <h4 className="text-white">{title}</h4>
                {children}
            </div>
        </div>
    );
}

type ConfigBoxProps = {
    label: string;
    value: string;
};

function ConfigBox({ label, value }: ConfigBoxProps) {
    return (
        <div className="flex justify-between bg-[#0d1f3c] p-2">
            <span>{label}</span>
            <span className="text-[#00aaff]">{value}</span>
        </div>
    );
}