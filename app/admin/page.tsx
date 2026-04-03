"use client";
import SeccionAdminMercado from "../components/SeccionAdminMercado";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// 1. Aseguráte de importar useAuth (ajustá la ruta si es necesario)
import { useAuth } from "@/src/lib/hooks/useAuht";

export default function AdminPage() {
    // 2. Cambiá useAdmin() por useAuth()
    const { isAdmin, loading } = useAuth();
    const router = useRouter();

    // Redirección de seguridad: Si no es admin, lo mandamos al home
    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push("/");
        }
    }, [isAdmin, loading, router]);

    if (loading) return <div className="text-white p-10 font-bebas tracking-widest animate-pulse">Verificando acceso...</div>;

    // Si no es admin, no renderizamos nada (el useEffect hará el resto)
    if (!isAdmin) return null;

    return (
        <main className="min-h-screen bg-[#0a0a0a] p-10">
            <SeccionAdminMercado />
        </main>
    );
}