"use client";
import { useEffect, useState } from "react";
import { auth } from "@/src/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                // 1. Si no está logueado y trata de entrar a algo que no sea login/registro
                if (pathname !== "/login" && pathname !== "/registro") {
                    router.push("/login");
                }
            } else {
                // 2. SI ESTÁ LOGUEADO PERO NO VERIFICADO
                if (!user.emailVerified && pathname !== "/verificar-email") {
                    router.push("/verificar-email");
                }

                // 3. Si ya está verificado y trata de entrar a la página de verificación
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