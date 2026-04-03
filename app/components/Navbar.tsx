"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/lib/hooks/useAuht';
import { auth } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
    const pathname = usePathname();
    const { user, userData, isAdmin } = useAuth();

    // Links base que ven todos
    const links = [
        { name: 'Inicio', href: '/' },
        { name: 'Reglamento', href: '/reglamento' },
        { name: 'Fixture', href: '/fixture' },
        { name: 'Multimedia', href: '/multimedia' },
        { name: 'Guías', href: '/guias' },
    ];

    // Si está logueado, agregamos "Fichajes" a la lista
    if (user) {
        links.push({ name: 'Fichajes', href: '/fichajes' });
    } else {
        // Si no está logueado, mostramos Inscripción
        links.push({ name: 'Inscripción', href: '/register' });
    }

    const handleLogout = async () => {
        if (confirm("¿Cerrar sesión?")) {
            await signOut(auth);
            window.location.href = "/";
        }
    };

    return (
        <nav className="bg-[#111111] border-b-2 border-[#c9a84c] px-6 md:px-10 sticky top-0 z-50 shadow-2xl">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                {/* LOGO */}
                <div className="flex items-center gap-8">
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

                {/* SECCIÓN DE USUARIO / LOGIN */}
                {/* SECCIÓN DE USUARIO / LOGIN EN NAVBAR */}
                <div className="flex items-center gap-6">
                    {user ? (
                        // ... (Tu código de usuario logueado con userData y botón Salir)
                        <div className="flex items-center gap-4 border-l border-[#2a2a2a] pl-6 py-2">
                            <div className="text-right hidden sm:block">
                                <p className="font-bebas text-lg leading-none text-white tracking-wider">
                                    {userData?.nombreEquipo || user.displayName || "Usuario"}
                                </p>
                                <p className={`text-[9px] uppercase font-bold tracking-[2px] ${isAdmin ? 'text-red-500' : 'text-[#c9a84c]'
                                    }`}>
                                    {isAdmin ? "ADMINISTRADOR" : userData?.rol === 'dt' ? "DT OFICIAL" : "INVITADO"}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-all px-3 py-1.5 rounded-sm font-barlow-condensed text-xs font-bold uppercase tracking-widest"
                            >
                                Salir
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-5">
                            <Link
                                href="/login"
                                className="font-barlow-condensed text-[13px] font-bold text-[#888] hover:text-white transition-colors tracking-[2px] uppercase"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="bg-[#c9a84c] text-black px-4 py-2 font-bebas text-lg tracking-widest hover:bg-white transition-all shadow-md"
                            >
                                Inscribirse
                            </Link>
                        </div>
                    )}


                    {/* BOTÓN MÓVIL */}
                    <div className="md:hidden text-[#c9a84c] font-bebas text-sm border border-[#c9a84c] px-2 py-1 ml-2">
                        MENU
                    </div>
                </div>
            </div>
        </nav>
    );
}