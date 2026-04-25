"use client";
import Link from "next/link";

export default function ProximamentePes2013() {
    return (
        <main className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center p-10 text-center">

            {/* MARCA DE AGUA */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <span className="font-bebas text-[20rem] text-[#00aaff] opacity-[0.02] select-none leading-none">
                    2013
                </span>
            </div>

            <div className="relative z-10 max-w-2xl space-y-8">

                {/* BADGE */}
                <div className="inline-block border border-[#00aaff]/30 bg-[#00aaff]/5 px-4 py-2">
                    <span className="font-barlow-condensed text-[#00aaff] text-xs uppercase tracking-[6px]">
                        En preparación
                    </span>
                </div>

                {/* TÍTULO */}
                <div className="border-l-4 border-[#00aaff] pl-6 text-left">
                    <h1 className="font-bebas text-6xl md:text-8xl text-white leading-none tracking-tight uppercase">
                        Liga Master
                    </h1>
                    <h2 className="font-bebas text-6xl md:text-8xl text-[#00aaff] leading-none tracking-tight uppercase">
                        PES 2013
                    </h2>
                </div>

                {/* DESCRIPCIÓN */}
                <p className="font-barlow-condensed text-[#5588aa] text-xl uppercase tracking-[3px] leading-relaxed text-left pl-6">
                    Estamos preparando la mejor liga master online de PES 2013.
                    <span className="block mt-2 text-white">Pronto vas a poder postularte.</span>
                </p>

                {/* LÍNEA DECORATIVA */}
                <div className="flex items-center gap-4 pl-6">
                    <div className="h-[1px] w-12 bg-[#00aaff]" />
                    <span className="font-barlow-condensed text-[#3a6688] text-xs uppercase tracking-[4px]">
                        Temporada I · Próximamente
                    </span>
                </div>

                {/* BOTÓN VOLVER */}
                <div className="pl-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 border border-[#1a3a5c] text-[#3a6688] font-barlow-condensed text-sm uppercase tracking-[3px] px-6 py-3 hover:border-[#00aaff] hover:text-[#00aaff] transition-all"
                    >
                        ← Volver a PES 6
                    </Link>
                </div>
            </div>
        </main>
    );
}