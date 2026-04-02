"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const links = [
        { name: 'Inicio', href: '/' },
        { name: 'Reglamento', href: '/reglamento' },
        { name: 'Fixture', href: '/fixture' },
        { name: 'Multimedia', href: '/multimedia' },
        { name: 'Guías', href: '/guias' },
        { name: 'Inscripción', href: '/register' },
    ];

    return (
        <nav className="bg-[#111111] border-b-2 border-[#c9a84c] px-6 md:px-10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* LOGO */}
                <Link href="/" className="font-bebas text-2xl md:text-3xl text-[#c9a84c] tracking-[4px] py-4 hover:opacity-80 transition-opacity">
                    EL LEGADO
                </Link>

                {/* LINKS (Escritorio) */}
                <div className="hidden md:flex gap-0">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`font-barlow-condensed font-semibold text-[13px] tracking-[2px] uppercase px-5 py-6 border-b-4 transition-all duration-200 ${isActive
                                        ? 'text-[#c9a84c] border-[#c9a84c]'
                                        : 'text-[#888888] border-transparent hover:text-[#c9a84c]'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* BOTÓN MÓVIL (Simple) */}
                <div className="md:hidden text-[#c9a84c] font-bebas text-sm">
                    MENU
                </div>
            </div>
        </nav>
    );
}