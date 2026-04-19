"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/lib/hooks/useAuht';
import { auth } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const { user, userData, isAdmin } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const links = [
        { name: 'Inicio', href: '/' },
        { name: 'Reglamento', href: '/reglamento' },
        { name: 'Fixture', href: '/fixture' },
        { name: 'Comunidad', href: '/comunidad' },
        { name: 'Guías', href: '/guias' },
    ];

    if (user) {
        links.push({ name: 'Mercado', href: '/fichajes' });
        if (isAdmin) {
            links.push({ name: 'Admin', href: '/admin' });
        } else {
            links.push({ name: 'Mi Club', href: '/perfil' });
        }
    } else {
        links.push({ name: 'Inscripción', href: '/register' });
    }

    const handleLogout = async () => {
        if (confirm("¿Cerrar sesión?")) {
            await signOut(auth);
            window.location.href = "/";
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="bg-[#111111] border-b-2 border-[#c9a84c] sticky top-0 z-50 shadow-2xl font-barlow-condensed">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* LADO IZQUIERDO: LOGO Y LINKS DESKTOP */}
                    <div className="flex items-center gap-4 lg:gap-8">
                        <Link href="/" className="font-bebas text-2xl md:text-3xl text-[#c9a84c] tracking-[4px] hover:opacity-80 transition-opacity italic whitespace-nowrap">
                            EL LEGADO
                        </Link>

                        {/* LINKS (Solo Escritorio LG) */}
                        <div className="hidden lg:flex items-center">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`font-semibold text-[13px] tracking-[2px] uppercase px-4 py-8 border-b-4 transition-all duration-200 h-20 flex items-center ${isActive
                                            ? 'text-[#c9a84c] border-[#c9a84c] bg-white/5'
                                            : 'text-[#888888] border-transparent hover:text-[#c9a84c]'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* LADO DERECHO: USER & HAMBURGUESA */}
                    <div className="flex items-center gap-4">
                        {/* SECCIÓN USUARIO DESKTOP */}
                        <div className="hidden md:flex items-center gap-6">
                            {user ? (
                                <div className="flex items-center gap-4 border-l border-[#2a2a2a] pl-6 py-2">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-bebas text-lg leading-none text-white tracking-wider uppercase italic">
                                            {userData?.nombre || user.displayName || "Usuario"}
                                        </p>
                                        <p className={`text-[9px] uppercase font-bold tracking-[2px] ${isAdmin ? 'text-red-500' : 'text-[#c9a84c]'}`}>
                                            {isAdmin ? "ADMINISTRADOR" : userData?.rol === 'dt' ? "DT OFICIAL" : "INVITADO"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-all px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest"
                                    >
                                        Salir
                                    </button>
                                </div>
                            ) : (
                                    <div className="flex items-center gap-4">
                                        <Link href="/login" className="text-[13px] font-bold text-[#888] hover:text-white transition-colors tracking-[2px] uppercase">
                                            Login
                                        </Link>
                                    <Link href="/register" className="bg-[#c9a84c] text-black px-4 py-2 font-bebas text-lg tracking-widest hover:bg-white transition-all italic">
                                        Inscribirse
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* BOTÓN MÓVIL (Hamburguesa) */}
                        <button
                            onClick={toggleMenu}
                            className="lg:hidden p-2 rounded-md text-[#c9a84c] hover:bg-white/5 transition-colors"
                        >
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MENÚ DESPLEGABLE MÓVIL */}
            {isMenuOpen && (
                <div className="lg:hidden bg-[#0f0f0f] border-t border-[#2a2a2a] animate-in slide-in-from-top duration-300">
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        {/* Info Usuario Móvil */}
                        {user && (
                            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#222]">
                                <div className="w-10 h-10 bg-[#c9a84c]/20 rounded-full flex items-center justify-center text-[#c9a84c]">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <p className="font-bebas text-xl text-white italic leading-none uppercase">
                                        {userData?.nombre || user.displayName}
                                    </p>
                                    <p className={`text-[10px] font-bold tracking-widest ${isAdmin ? 'text-red-500' : 'text-[#c9a84c]'}`}>
                                        {isAdmin ? "ADMINISTRADOR" : "DT OFICIAL"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Links Móvil */}
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-4 py-3 rounded-md text-base font-bold tracking-[2px] uppercase ${pathname === link.href ? 'bg-[#c9a84c] text-black' : 'text-gray-400 hover:bg-white/5'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Botones Acción Móvil */}
                        <div className="pt-4 space-y-2">
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
                                    className="w-full flex items-center justify-center bg-[#c9a84c] text-black py-3 font-bebas text-xl italic tracking-widest"
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