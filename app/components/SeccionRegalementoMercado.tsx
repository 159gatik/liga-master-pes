"use client";

export default function SeccionReglamentoMercado() {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8 pb-20">
            {/* TÍTULO PRINCIPAL */}
            <div className="border-b border-[#c9a84c] pb-4">
                <h3 className="font-bebas text-4xl text-[#c9a84c] tracking-widest uppercase">
                    Normativa del Mercado · <span className="text-white">Temporada I</span>
                </h3>
            </div>

            {/* GRID DE REGLAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-barlow-condensed">

                {/* REGLA 1: TRASPASOS DEFINITIVOS */}
                <div className="bg-[#111] border border-[#2a2a2a] p-6 hover:border-[#27ae60] transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-[#27ae60] text-black font-bold px-2 py-1 text-xs uppercase">Compra</span>
                        <h4 className="text-xl text-white font-bold uppercase tracking-wider">Traspaso Directo</h4>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        El club comprador adquiere el 100% de los derechos del jugador. El monto se descuenta del presupuesto del comprador y se acredita al vendedor **automáticamente** tras la validación del Admin.
                    </p>
                    <div className="mt-4 text-[#27ae60] font-bold text-xs uppercase tracking-widest">
                        Costo: 100% del valor acordado
                    </div>
                </div>

                {/* REGLA 2: PRÉSTAMOS */}
                <div className="bg-[#111] border border-[#2a2a2a] p-6 hover:border-blue-500 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-600 text-white font-bold px-2 py-1 text-xs uppercase">Préstamo</span>
                        <h4 className="text-xl text-white font-bold uppercase tracking-wider">Préstamo Temporal</h4>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Un jugador puede ser cedido por una temporada. El valor base del préstamo está fijado en el **30% de su cotización**. El jugador regresará a su club de origen al finalizar el período.
                    </p>
                    <div className="mt-4 text-blue-400 font-bold text-xs uppercase tracking-widest">
                        Costo Fijo: 30% del valor del jugador
                    </div>
                </div>

                {/* REGLA 3: SUELDOS */}
                <div className="bg-[#111] border border-[#2a2a2a] p-6 border-l-4 border-l-orange-500">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-orange-500 text-white font-bold px-2 py-1 text-xs uppercase">Mantenimiento</span>
                        <h4 className="text-xl text-white font-bold uppercase tracking-wider">Sueldos de Plantilla</h4>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Cada club debe abonar el **10% del valor total de su plantilla** al finalizar la temporada en concepto de fichas y salarios. Si el presupuesto es negativo, el club no podrá realizar fichajes.
                    </p>
                </div>

                {/* REGLA 4: JUGADORES LIBRES */}
                <div className="bg-[#111] border border-[#2a2a2a] p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-[#c9a84c] text-black font-bold px-2 py-1 text-xs uppercase">Agente Libre</span>
                        <h4 className="text-xl text-white font-bold uppercase tracking-wider">Fichaje de Libres</h4>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Los jugadores sin equipo pueden ser fichados pagando el **80% de su valor de mercado**. Este trámite es directo con la liga.
                    </p>
                    <div className="mt-4 text-[#c9a84c] font-bold text-xs uppercase tracking-widest">
                        Costo: 80% de la cotización base
                    </div>
                </div>
            </div>

            {/* NOTA SOBRE EL SISTEMA AUTOMÁTICO */}
            <div className="bg-blue-900/10 border border-blue-900/30 p-6 flex items-start gap-4">
                <div className="font-barlow-condensed">
                    <h5 className="text-blue-400 font-bold uppercase tracking-widest text-m mb-1">Sistema de Validación Automática</h5>
                    <p className="text-blue-200/60 text-m">
                        Una vez que ambos DTs acuerdan el traspaso, el vendedor debe cargar la operación en la pestaña
                        <strong> Confirmación</strong>. Una vez que el Administrador valide el movimiento, el presupuesto
                        y la plantilla se actualizarán en tiempo real. **No se aceptan reclamos por errores en la carga de montos.**
                    </p>
                </div>
            </div>
        </div>
    );
}