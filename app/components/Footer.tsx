"use client";
import Link from "next/link";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#050505] border-t border-[#222] pt-16 pb-8 px-6 mt-20 font-barlow-condensed">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                {/* COLUMNA 1: MARCA */}
                <div className="space-y-4">
                    <h2 className="font-bebas text-4xl text-white italic tracking-tighter uppercase">
                    El Legado 
                    </h2>
                    <h2 className="font-bebas text-4xl text-white italic tracking-tighter uppercase">
                        <span className="text-[#c9a84c]">PES 6</span>
                    </h2>
                </div>

                {/* COLUMNA 2: NAVEGACIÓN */}
                <div className="space-y-4">
                    <h4 className="text-[#c9a84c] font-bold uppercase text-xs tracking-[3px]">Navegación</h4>
                    <ul className="space-y-2 text-gray-400 text-sm uppercase font-semibold">
                        <li><Link href="/fixture" className="hover:text-white transition-colors">Calendario Oficial</Link></li>
                        <li><Link href="/positions" className="hover:text-white transition-colors">Tabla de Posiciones</Link></li>
                        <li><Link href="/fichajes" className="hover:text-white transition-colors">Mercado de Pases</Link></li>
                        <li><Link href="/equipos" className="hover:text-white transition-colors">Equipos</Link></li>
                        <li><Link href="/despachos" className="hover:text-white transition-colors">Despachos</Link></li>
                    </ul>
                </div>

                {/* COLUMNA 3: SOPORTE / ADMIN */}
                <div className="space-y-4">
                    <h4 className="text-[#c9a84c] font-bold uppercase text-xs tracking-[3px]">Utilidades</h4>
                    <ul className="space-y-2 text-gray-400 text-sm uppercase font-semibold">
                        <li><Link href="/perfil" className="hover:text-white transition-colors">Oficina del DT</Link></li>
                        <li><Link href="/reglamento" className="hover:text-white transition-colors">Reglamento</Link></li>
                        <li><Link href="/admin" className="hover:text-white transition-colors">Panel de Control</Link></li>
                        <li><Link href="/soporte" className="hover:text-white transition-colors">Soporte</Link></li>
                        <li><Link href="/guias" className="hover:text-white transition-colors">Guia</Link></li>
                    </ul>
                </div>

                {/* COLUMNA 4: SOCIAL / DISCORD */}
                <div className="space-y-4">
                    <h4 className="text-[#c9a84c] font-bold uppercase text-xs tracking-[3px]">Comunidad</h4>
                    <div className="bg-[#111] p-4 border border-[#222]">
                        <p className="text-gray-500 text-[10px] uppercase font-bold mb-2">Unite al Servidor</p>
                        <a
                            href="/"
                            target="_blank"
                            className="text-white font-bebas text-xl flex items-center gap-2 hover:text-[#c9a84c] transition-all"
                        >
                            PROXIMAMENTE
                        </a>
                    </div>
                </div>
            </div>

            {/* BARRA INFERIOR DE CRÉDITOS */}
            <div className="max-w-7xl mx-auto pt-8 border-t border-[#111] flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-600 text-[10px] uppercase tracking-widest italic">
                    © {year} El Legado PES 6 - Todos los derechos reservados.
                </p>
                <p className="text-gray-600 text-[10px] uppercase tracking-widest">
                    Desarrollado por G.Rojas para la comunidad de <span className="text-white">PES 6</span>
                </p>
            </div>
        </footer>
    );
}