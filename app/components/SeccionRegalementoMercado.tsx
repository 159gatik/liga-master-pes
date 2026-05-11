"use client";

import { useState } from "react";

export default function SeccionReglamentoMercado() {
    const [tabActiva, setTabActiva] = useState<"A" | "B">("A");

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn space-y-12 pb-20 font-barlow-condensed italic">

            {/* TÍTULO PRINCIPAL ESTILO EL LEGADO */}
            <header className="relative py-10 border-b border-white/10 overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-bebas text-6xl text-white tracking-tighter uppercase leading-none">
                        Reglamento de <span className="text-[#c9a84c]">Mercado</span>
                    </h3>
                    <p className="text-gray-500 text-sm uppercase tracking-[5px] mt-2 font-bold">Temporada I · Ciclo Integral</p>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 font-bebas text-9xl uppercase tracking-tighter select-none">
                    MARKET
                </div>
            </header>

            {/* AVISO RESTRICCIÓN (BANNER INCLINADO) */}
            <div className="relative overflow-hidden bg-red-600/10 border border-red-600/20 p-8 skew-x-[-10deg]">
                <div className="skew-x-[10deg]">
                    <p className="text-red-500 font-bebas text-3xl uppercase mb-1 tracking-widest">Mercado Cerrado</p>
                    <p className="text-gray-400 text-lg leading-tight max-w-2xl">
                        El mercado permanecerá **bloqueado** durante el desarrollo de los torneos. Altas, bajas y traspasos solo se habilitarán en el receso oficial tras el Clausura.
                    </p>
                </div>
            </div>

            {/* GRID DE REGLAS (ESTILO TARJETAS WEBILD) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/5 p-6 hover:border-[#c9a84c] transition-all group relative">
                    <span className="text-[#c9a84c] font-bebas text-4xl absolute top-2 right-4 opacity-20">01</span>
                    <h4 className="text-white font-bebas text-2xl uppercase mb-3">Traspasos</h4>
                    <p className="text-gray-500 text-sm leading-snug">Venta directa entre clubes. El 100% del monto pactado se acredita al vendedor al instante.</p>
                </div>

                <div className="bg-white/5 border border-white/5 p-6 hover:border-blue-500 transition-all group relative">
                    <span className="text-blue-500 font-bebas text-4xl absolute top-2 right-4 opacity-20">02</span>
                    <h4 className="text-white font-bebas text-2xl uppercase mb-3">Préstamos</h4>
                    <p className="text-gray-500 text-sm leading-snug">Cesión por toda la temporada. Costo fijo del 30% del valor del jugador. Sin opción de compra.</p>
                </div>

                <div className="bg-white/5 border border-white/5 p-6 hover:border-orange-500 transition-all group relative">
                    <span className="text-orange-500 font-bebas text-4xl absolute top-2 right-4 opacity-20">03</span>
                    <h4 className="text-white font-bebas text-2xl uppercase mb-3">Sueldos</h4>
                    <p className="text-gray-500 text-sm leading-snug">Mantenimiento de plantilla: Pago único del 10% del valor total al finalizar el ciclo.</p>
                </div>

                <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/20 p-6 relative">
                    <h4 className="text-[#c9a84c] font-bebas text-2xl uppercase mb-3"> jugadores Libres</h4>
                    <ul className="text-xs text-gray-400 space-y-1 uppercase font-bold">
                        <li className="flex justify-between"><span>Cupo:</span> <span className="text-white">2 por DT</span></li>
                        <li className="flex justify-between"><span>Costo:</span> <span className="text-white">80% Valor</span></li>
                        <li className="flex justify-between"><span>Orden:</span> <span className="text-[#c9a84c]">Prioridad Pedido</span></li>
                    </ul>
                </div>
            </div>

            {/* SECCIÓN MÉRITO DEPORTIVO */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-4">
                    <h3 className="font-bebas text-5xl text-white uppercase tracking-tighter">
                        Premios de <span className="text-[#c9a84c]">La liga</span>
                    </h3>

                    {/* SELECTOR INCLINADO */}
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <button
                            onClick={() => setTabActiva("A")}
                            className={`px-8 py-2 font-bebas text-2xl skew-x-[-15deg] transition-all ${tabActiva === "A" ? 'bg-[#c9a84c] text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                        >
                            <span className="inline-block skew-x-[15deg]">División A</span>
                        </button>
                        <button
                            onClick={() => setTabActiva("B")}
                            className={`px-8 py-2 font-bebas text-2xl skew-x-[-15deg] transition-all ${tabActiva === "B" ? 'bg-[#c9a84c] text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                        >
                            <span className="inline-block skew-x-[15deg]">División B</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-2">
                        {tabActiva === "A" ? (
                            <>
                                <div className="space-y-1">
                                    <FilaPremio pos="1° CAMPEÓN" monto="$60.000.000" destaque />
                                    <FilaPremio pos="2° PUESTO" monto="$50.000.000" />
                                    <FilaPremio pos="3° PUESTO" monto="$42.000.000" />
                                    <FilaPremio pos="4° PUESTO" monto="$36.000.000" />
                                    <FilaPremio pos="5° PUESTO" monto="$31.000.000" />
                                </div>
                                <div className="space-y-1">
                                    <FilaPremio pos="6° PUESTO" monto="$25.000.000" apagado />
                                    <FilaPremio pos="7° PUESTO" monto="$20.000.000" apagado />
                                    <FilaPremio pos="8° PUESTO" monto="$15.000.000" apagado />
                                    <FilaPremio pos="9° DÉFICIT" monto="-$5.000.000" error />
                                    <FilaPremio pos="10° DÉFICIT" monto="-$8.000.000" error />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <FilaPremio pos="1° CAMPEÓN" monto="$50.000.000" destaque />
                                    <FilaPremio pos="2° PUESTO" monto="$40.000.000" />
                                    <FilaPremio pos="3° PUESTO" monto="$32.000.000" />
                                    <FilaPremio pos="4° PUESTO" monto="$26.000.000" />
                                    <FilaPremio pos="5° PUESTO" monto="$21.000.000" />
                                </div>
                                <div className="space-y-1">
                                    <FilaPremio pos="6° PUESTO" monto="$15.000.000" />
                                    <FilaPremio pos="7° PUESTO" monto="$10.000.000" />
                                    <FilaPremio pos="8° PUESTO" monto="$7.000.000" />
                                    <FilaPremio pos="9° DÉFICIT" monto="$5.000.000" />
                                    <FilaPremio pos="10° DÉFICIT" monto="$3.000.000" />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <h3 className="font-bebas text-5xl text-white uppercase tracking-tighter">
                    Premios <span className="text-[#c9a84c]">copa el legado</span>
                </h3>
                <div className="bg-white/[0.02] border border-white/5 p-8 flex justify-center">
                    {/* El max-w evita que las filas se vuelvan gigantes en monitores anchos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-2 w-full max-w-4xl">

                        {/* COLUMNA 1 */}
                        <div className="space-y-1 flex flex-col items-center md:items-stretch">
                            <FilaPremio pos="1° CAMPEÓN" monto="$30.000.000" destaque />
                            <FilaPremio pos="2° PUESTO" monto="$15.000.000" destaque />
                        </div>

                        {/* COLUMNA 2 */}
                        <div className="space-y-1 flex flex-col items-center md:items-stretch">
                            <FilaPremio pos="GOLEADOR" monto="$10.000.000" />
                            <FilaPremio pos="CLASIF. PLAYOFFS" monto="$5.000.000" />
                        </div>

                    </div>
                </div>
                {/* EXTRAS Y SANCIONES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/40 border border-green-500/20 p-6">
                        <h5 className="text-[#27ae60] font-bebas text-2xl uppercase mb-4 tracking-wider">Bonificaciones</h5>
                        <div className="space-y-2 text-sm uppercase">
                            <div className="flex justify-between border-b border-white/5 pb-1"><span>Goleador de Liga</span> <span className="text-white">+$15.000.000</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span>Premio Fair Play</span> <span className="text-white">+$10.000.000</span></div>

                        </div>
                    </div>
                    <div className="bg-black/40 border border-red-500/20 p-6">
                        <h5 className="text-red-500 font-bebas text-2xl uppercase mb-4 tracking-wider">Sanciones</h5>
                        <div className="space-y-2 text-sm uppercase">
                            <div className="flex justify-between border-b border-white/5 pb-1"><span>Tarjeta Amarilla</span> <span className="text-white">-$3.000.000</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span>Tarjeta Roja</span> <span className="text-white">-$5.000.000</span></div>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FilaPremio({ pos, monto, destaque, error, apagado }: { pos: string, monto: string, destaque?: boolean, error?: boolean, apagado?: boolean }) {
    return (
        <div className={`flex justify-between items-center py-3 px-4 border-b border-white/5 transition-all hover:bg-white/5 ${error ? 'bg-red-500/5' : ''}`}>
            <span className={`text-sm font-bold tracking-widest ${destaque ? 'text-[#c9a84c]' : error ? 'text-red-500' : apagado ? 'text-gray-600' : 'text-white'}`}>
                {pos}
            </span>
            <span className={`font-bebas text-2xl ${destaque ? 'text-[#c9a84c]' : error ? 'text-red-500' : 'text-white'}`}>
                {monto}
            </span>
        </div>
    );
}