"use client";

export default function SeccionReglamentoMercado() {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8 pb-20">
            {/* TÍTULO PRINCIPAL CON CICLO DE TEMPORADA */}
            <div className="border-b border-[#c9a84c] pb-4 flex flex-col md:flex-row justify-between items-end gap-2">
                <div>
                    <h3 className="font-bebas text-4xl text-[#c9a84c] tracking-widest uppercase">
                        Normativa del Mercado · <span className="text-white">Temporada I</span>
                    </h3>
                    <p className="text-gray-500 font-barlow-condensed text-xs uppercase tracking-[3px]">Ciclo: Torneo Apertura + Torneo Clausura</p>
                </div>
                <div className="bg-[#c9a84c] text-black px-3 py-1 font-bebas text-xl italic tracking-tighter">
                    VENTANA ÚNICA ANUAL
                </div>
            </div>

            {/* AVISO IMPORTANTE SOBRE APERTURA */}
            <div className="bg-red-900/10 border-l-4 border-red-600 p-6 italic">
                <p className="text-red-500 font-bold uppercase text-sm mb-1 tracking-widest">⚠️ Restricción de Calendario:</p>
                <p className="text-gray-400 text-sm font-barlow-condensed">
                    El mercado **permanecerá cerrado** durante el transcurso de los dos torneos. Las negociaciones, altas y bajas solo se habilitarán una vez finalizada la temporada completa (tras el Clausura).
                </p>
            </div>

            {/* GRID DE REGLAS GENERALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-barlow-condensed">

                {/* REGLA 1: TRASPASOS */}
                <div className="bg-[#111] border border-[#2a2a2a] p-6 hover:border-[#27ae60] transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-[#27ae60] text-black font-bold px-2 py-0.5 text-[9px] uppercase">Post-Clausura</div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-[#27ae60] text-black font-bold px-2 py-1 text-xs uppercase">Compra</span>
                        <h4 className="text-xl text-white font-bold uppercase tracking-wider">Traspaso Directo</h4>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        Compra definitiva entre clubes. El dinero sale del presupuesto del comprador y va **íntegro** al vendedor.
                    </p>
                    <div className="bg-black/50 p-3 border border-white/5 space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Ejemplo de flujo:</p>
                        <p className="text-xs text-white">Vendes por <strong className="text-[#27ae60]">$50M</strong> → Recibes <strong className="text-[#27ae60]">$50M</strong> al instante.</p>
                    </div>
                </div>

                {/* REGLA 2: PRÉSTAMOS */}
                <div className="bg-[#111] border border-[#2a2a2a] p-6 hover:border-blue-500 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white font-bold px-2 py-0.5 text-[9px] uppercase">Anual</div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-600 text-white font-bold px-2 py-1 text-xs uppercase">Préstamo</span>
                        <h4 className="text-xl text-white font-bold uppercase tracking-wider">Cesión por 1 Temp.</h4>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        Uso del jugador por el ciclo completo (2 torneos). Al finalizar, el jugador **vuelve solo** a su dueño original.
                    </p>
                    <div className="bg-black/50 p-3 border border-white/5 space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Costo Fijo:</p>
                        <p className="text-xs text-blue-400 font-bold uppercase italic">30% de la cotización actual</p>
                    </div>
                </div>

                {/* REGLA 3: SUELDOS */}
                <div className="bg-[#111] border border-[#2a2a2a] p-6 border-l-4 border-l-orange-500 relative group">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-orange-500 text-white font-bold px-2 py-1 text-xs uppercase">Sueldos</span>
                        <h4 className="text-xl text-white font-bold uppercase tracking-wider">Mantenimiento Final</h4>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        El costo de mantener la plantilla se liquida **una sola vez** al terminar el segundo torneo de la temporada.
                    </p>
                    <div className="bg-orange-900/10 p-3 border border-orange-500/20">
                        <p className="text-xs text-orange-500 uppercase font-bold tracking-tighter">Impacto: -10% de la valoración de plantilla</p>
                    </div>
                </div>

                {/* REGLA 4: JUGADORES LIBRES */}
                <div className="bg-[#111] border border-[#2a2a2a] p-6 border-t-2 border-t-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.05)] relative group">
                    <div className="absolute top-0 right-0 bg-[#c9a84c] text-black font-bold px-2 py-0.5 text-[9px] uppercase">Post-Temporada</div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-[#c9a84c] text-black font-bold px-2 py-1 text-xs uppercase">Libres</span>
                        <h4 className="text-xl text-white font-bold uppercase tracking-wider">Fichaje del Mercado</h4>
                    </div>
                    <ul className="text-gray-400 text-[11px] space-y-1 mb-4">
                        <li className="flex justify-between"><span>Límite de fichajes:</span> <span className="text-white">2 por DT</span></li>
                        <li className="flex justify-between"><span>Orden de prioridad:</span> <span className="text-white font-bold italic">El más rápido</span></li>
                        <li className="flex justify-between"><span>Costo de alta:</span> <span className="text-[#c9a84c] font-bold">80% de su valor</span></li>
                    </ul>
                    <div className="bg-[#c9a84c]/5 p-2 border border-[#c9a84c]/20 text-center">
                        <p className="text-[10px] text-[#c9a84c] font-bold uppercase italic">Requiere $100M mínimos en banco</p>
                    </div>
                </div>
            </div>

            {/* SECCIÓN: PREMIOS POR PUESTO */}
            <div className="bg-[#111] border border-[#222] p-8 shadow-2xl">
                <h3 className="font-bebas text-4xl text-white mb-6 italic uppercase tracking-widest border-b border-[#c9a84c] pb-2 text-center md:text-left">
                    Tabla de <span className="text-[#c9a84c]">Mérito Deportivo</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 font-barlow-condensed">
                    {/* COLUMNA 1 */}
                    <div className="divide-y divide-white/5">
                        <div className="flex justify-between py-2 text-[#c9a84c] font-bold text-lg italic">
                            <span>1° CAMPEÓN</span>
                            <span>$60.000.000</span>
                        </div>
                        <div className="flex justify-between py-2 text-white">
                            <span>2° PUESTO</span>
                            <span>$50.000.000</span>
                        </div>
                        <div className="flex justify-between py-2 text-white/80">
                            <span>3° PUESTO</span>
                            <span>$42.000.000</span>
                        </div>
                        <div className="flex justify-between py-2 text-white/70">
                            <span>4° PUESTO</span>
                            <span>$36.000.000</span>
                        </div>
                        <div className="flex justify-between py-2 text-white/60">
                            <span>5° PUESTO</span>
                            <span>$31.000.000</span>
                        </div>
                    </div>

                    {/* COLUMNA 2 */}
                    <div className="divide-y divide-white/5 border-t border-white/5 md:border-t-0">
                        <div className="flex justify-between py-2 text-white/50">
                            <span>6° PUESTO</span>
                            <span>$25.000.000</span>
                        </div>
                        <div className="flex justify-between py-2 text-white/40">
                            <span>7° PUESTO</span>
                            <span>$20.000.000</span>
                        </div>
                        <div className="flex justify-between py-2 text-white/30">
                            <span>8° PUESTO</span>
                            <span>$15.000.000</span>
                        </div>
                        <div className="flex justify-between py-2 text-red-500 font-bold bg-red-900/10 px-2">
                            <span>9° PUESTO (DÉFICIT)</span>
                            <span>-$5.000.000</span>
                        </div>
                        <div className="flex justify-between py-2 text-red-600 font-bold bg-red-900/20 px-2">
                            <span>10° PUESTO (DÉFICIT)</span>
                            <span>-$8.000.000</span>
                        </div>
                    </div>
                </div>

                {/* BONUS Y MULTAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-[#222]">
                    <div className="bg-black/40 p-4 border-l-4 border-[#27ae60]">
                        <h5 className="text-[#27ae60] font-bold text-xs uppercase mb-2">Ingresos por Torneo</h5>
                        <ul className="text-[11px] text-gray-400 space-y-1">
                            <li className="flex justify-between"><span>GOLEADOR DE LIGA</span> <span className="text-white">+$15.000.000</span></li>
                            <li className="flex justify-between"><span>PREMIO FAIR PLAY</span> <span className="text-white">+$10.000.000</span></li>
                            <li className="flex justify-between"><span>SPONSOR CLUB</span> <span className="text-gray-500 italic">PAGO POR TORNEO</span></li>
                        </ul>
                    </div>
                    <div className="bg-black/40 p-4 border-l-4 border-red-600">
                        <h5 className="text-red-600 font-bold text-xs uppercase mb-2">Multas Disciplinarias</h5>
                        <ul className="text-[11px] text-gray-400 space-y-1">
                            <li className="flex justify-between"><span>CADA TARJETA AMARILLA</span> <span className="text-white">-$3.000.000</span></li>
                            <li className="flex justify-between"><span>CADA TARJETA ROJA</span> <span className="text-white">-$5.000.000</span></li>
                            <li className="flex justify-between"><span>ABANDONO DE LIGA</span> <span className="text-red-500 italic">RESET DE CUENTA</span></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* NOTA FINAL */}
            <div className="bg-blue-900/10 border border-blue-900/30 p-6 flex items-start gap-4">
                <div className="font-barlow-condensed">
                    <h5 className="text-blue-400 font-bold uppercase tracking-widest text-m mb-1">📅 Estructura de la Temporada</h5>
                    <p className="text-blue-200/60 text-xs leading-relaxed italic">
                        Los premios por puesto se entregan al finalizar **cada torneo** (Apertura y Clausura). Sin embargo, la posibilidad de modificar la plantilla se reserva exclusivamente para el receso entre temporadas. ¡Gestioná tu presupuesto con inteligencia!
                    </p>
                </div>
            </div>
        </div>
    );
}