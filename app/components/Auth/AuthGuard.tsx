"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/src/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    const rutasPublicas = [
        "/", "/equipos", "/reglamento", "/guias", "/login", "/register",
        "/pes2013/proximamente",
    ];

    const rutasPrivadasVerificadas = [
        "/perfil", "/admin", "/fichajes", "/comunidad",
        "/pes2013/perfil", "/pes2013/fichajes", "/pes2013/comunidad",
    ];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {

            // ── BLOQUE PES2013: si intenta entrar a cualquier ruta de pes2013
            // que no sea proximamente, verificamos si es admin
            if (pathname.startsWith("/pes2013") && pathname !== "/pes2013/proximamente") {
                if (!user) {
                    router.push("/pes2013/proximamente");
                    setLoading(false);
                    return;
                }
                const snap = await getDoc(doc(db, "users", user.uid));
                const esAdmin = snap.exists() && snap.data().rol === "admin";
                if (!esAdmin) {
                    router.push("/pes2013/proximamente");
                    setLoading(false);
                    return;
                }
                setLoading(false);
                return;
            }

            // ── BLOQUE NORMAL: lógica original para rutas de pes6
            const esRutaPublica = rutasPublicas.includes(pathname);

            if (!user) {
                if (!esRutaPublica) {
                    router.push("/login");
                }
            } else {
                const intentaEntrarAPrivada = rutasPrivadasVerificadas.includes(pathname);

                if (!user.emailVerified && intentaEntrarAPrivada) {
                    router.push("/verificar-email");
                }

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