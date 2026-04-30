"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/lib/hooks/useAuht';
import { auth } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';

const LIGA_CONFIG = {
    pes6: {
        nombre: "EL LEGADO",
        href: "/",
        acento: "#c9a84c",
        acentoHover: "hover:text-[#c9a84c]",
        acentoActivo: "text-[#c9a84c] border-[#c9a84c]",
        navBg: "bg-[#111111] border-[#c9a84c]",
        mobileBg: "bg-[#0f0f0f]",
        rolColor: "text-[#c9a84c]",
        links: (user: boolean, isAdmin: boolean) => {
            const base = [
                { name: "Inicio", href: "/" },
                { name: "Reglamento", href: "/reglamento" },
                { name: "Fixture", href: "/fixture" },
                { name: "Comunidad", href: "/comunidad" },
                { name: "Guías", href: "/guias" },
            ];
            if (user) {
                base.push({ name: "Mercado", href: "/fichajes" });
                base.push(isAdmin
                    ? { name: "Admin", href: "/admin" }
                    : { name: "Mi Club", href: "/perfil" }
                );
            } else {
                base.push({ name: "Inscripción", href: "/register" });
            }
            return base;
        },
    },
    pes2013: {
        nombre: "PES 2013",
        href: "/pes2013/proximamente",
        acento: "#00aaff",
        acentoHover: "hover:text-[#00aaff]",
        acentoActivo: "text-[#00aaff] border-[#00aaff]",
        navBg: "bg-[#0a1628] border-[#00aaff]",
        mobileBg: "bg-[#0d1f3c]",
        rolColor: "text-[#00aaff]",
        links: (user: boolean, isAdmin: boolean) => {
            const base = [
                { name: "Inicio", href: "/pes2013" },
                { name: "Reglamento", href: "/pes2013/reglamento" },
                { name: "Fixture", href: "/pes2013/fixture" },
                { name: "Comunidad", href: "/pes2013/comunidad" },
                { name: "Guías", href: "/pes2013/guias" },
            ];
            if (user) {
                base.push({ name: "Mercado", href: "/pes2013/fichajes" });
                base.push(isAdmin
                    ? { name: "Admin", href: "/pes2013/admin" }
                    : { name: "Mi Club", href: "/pes2013/perfil" }
                );
            } else {
                base.push({ name: "Inscripción", href: "/register" });
            }
            return base;
        },
    },
};

export default function Navbar() {
    const pathname = usePathname();
    const { user, userData, isAdmin } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const esPes2013 = pathname.startsWith("/pes2013");
    const esProximamente = pathname === "/pes2013/proximamente";
    const config = esPes2013 ? LIGA_CONFIG.pes2013 : LIGA_CONFIG.pes6;
    const links = config.links(!!user, isAdmin);

    const handleLogout = async () => {
        if (confirm("¿Cerrar sesión?")) {
            await signOut(auth);
            window.location.href = "/";
        }
    };

    return (
        <nav className={`${config.navBg} border-b-2 sticky top-0 z-50 shadow-2xl font-barlow-condensed`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* LOGO */}
                    <div className="flex items-center gap-4 lg:gap-8">
                        <Link
                            href={config.href}
                            style={{ color: config.acento }}
                            className="font-bebas text-2xl md:text-3xl tracking-[4px] hover:opacity-80 transition-opacity italic whitespace-nowrap"
                        >
                            {config.nombre}
                        </Link>

                        {/* LINKS DESKTOP — ocultos en proximamente */}
                        <div className="hidden lg:flex items-center">
                            {esProximamente ? (
                                <span className="font-barlow-condensed text-xs uppercase tracking-[4px] text-[#1a3a5c] ml-4">
                                    Próximamente disponible
                                </span>
                            ) : (
                                links.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className={`font-semibold text-[13px] tracking-[2px] uppercase px-4 py-8 border-b-4 transition-all duration-200 h-20 flex items-center ${isActive
                                                ? `${config.acentoActivo} bg-white/5`
                                                : `text-[#888888] border-transparent ${config.acentoHover}`
                                                }`}
                                        >
                                            {link.name}
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* DERECHA: USUARIO — oculto en proximamente */}
                    <div className="flex items-center gap-4">
                        {!esProximamente && (
                            <div className="hidden md:flex items-center gap-6">
                                {user ? (
                                    <div className="flex items-center gap-4 border-l border-white/10 pl-6 py-2">
                                        <div className="text-right hidden sm:block">
                                            <p className="font-bebas text-lg leading-none text-white tracking-wider uppercase italic">
                                                {userData?.nombre || user.displayName || "Usuario"}
                                            </p>
                                            <p className={`text-[9px] uppercase font-bold tracking-[2px] ${isAdmin ? 'text-red-500' : config.rolColor}`}>
                                                {isAdmin ? "ADMINISTRADOR" : userData?.rol === 'dt' ? "DT OFICIAL" : "INVITADO"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            style={{ borderColor: `${config.acento}50`, color: config.acento }}
                                            className="bg-white/5 border hover:opacity-80 transition-all px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest"
                                        >
                                            Salir
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <Link href="/login" className="text-[13px] font-bold text-[#888] hover:text-white transition-colors tracking-[2px] uppercase">
                                            Login
                                        </Link>
                                        <Link
                                            href="/register"
                                            style={{ background: config.acento }}
                                            className="text-black px-4 py-2 font-bebas text-lg tracking-widest hover:opacity-80 transition-all italic"
                                        >
                                            Inscribirse
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* HAMBURGUESA — oculta en proximamente */}
                        {!esProximamente && (
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                style={{ color: config.acento }}
                                className="lg:hidden p-2 rounded-md hover:bg-white/5 transition-colors"
                            >
                                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* MENÚ MÓVIL — no se muestra en proximamente */}
            {isMenuOpen && !esProximamente && (
                <div className={`lg:hidden ${config.mobileBg} border-t border-white/10 animate-in slide-in-from-top duration-300`}>
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        {user && (
                            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${config.acento}20`, color: config.acento }}>
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <p className="font-bebas text-xl text-white italic leading-none uppercase">
                                        {userData?.nombre || user.displayName}
                                    </p>
                                    <p className={`text-[10px] font-bold tracking-widest ${isAdmin ? 'text-red-500' : config.rolColor}`}>
                                        {isAdmin ? "ADMINISTRADOR" : "DT OFICIAL"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-4 py-3 rounded-md text-base font-bold tracking-[2px] uppercase text-gray-400 hover:bg-white/5"
                                style={pathname === link.href ? { background: config.acento, color: "#000" } : {}}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="pt-4">
                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 bg-red-600/10 border border-red-600/30 text-red-500 py-3 font-bebas text-xl italic tracking-widest"
                                >
                                    <LogOut size={18} /> CERRAR SESIÓN
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                        className="w-full flex items-center justify-center text-black py-3 font-bebas text-xl italic tracking-widest"
                                        style={{ background: config.acento }}
                                >
                                    INICIAR SESIÓN
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}