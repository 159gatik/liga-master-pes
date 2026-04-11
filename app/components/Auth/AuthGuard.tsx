"use client";
import { useEffect, useState } from "react";
import { auth } from "@/src/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    const rutasPublicas = ["/", "/equipos", "/reglamento", "/guias", "/login", "/register"]

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const esRutaPublica = rutasPublicas.includes(pathname)
            if (!user) {
                // si no está logueado y la ruta no es publica, pal lobby chaval.
                if (!esRutaPublica) {
                    router.push("/login")
                }
            }
            else {
                // si HAY USUARIO PERO NO ESTÁ VERIFICADO.- LO MANDAMOS A VERIFICAR SI INTENTA ENTRAR A RUTAS PRIVADAS.
                const rutasPrivadasVerificadas = ["/perfil", "/admin", "/fichajes", "/comunidad"];
                const intentaEntrarAPrivada = rutasPrivadasVerificadas.includes(pathname)

                if (!user.emailVerified && intentaEntrarAPrivada) {
                    router.push("/verificar-email")
                }
                // 3. Si ya está verificado y está en la pagina de verificacion, pal inicio
                if (user.emailVerified && pathname === "/verificar-email") {
                    router.push("/");
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a84c]"></div>
            </div>
        );
    }

    return <>{children}</>;
}