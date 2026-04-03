"use client";
import { useAdmin } from "@/src/lib/hooks/useAdmin"; 
import SeccionAdminMercado from "../components/SeccionAdminMercado";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
    const { isAdmin, loading } = useAdmin();
    const router = useRouter();

    // Seguridad: Si no es admin, lo mandamos a casa
    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push("/");
        }
    }, [isAdmin, loading, router]);

    if (loading) return <div className="min-h-screen bg-black text-white p-20">Verificando autoridad...</div>;

    if (!isAdmin) return null;

    return (
        <main className="min-h-screen bg-[#0a0a0a] p-10">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 border-b border-[#2a2a2a] pb-5">
                    <h1 className="font-bebas text-6xl text-white tracking-widest uppercase">
                        Panel de Control <span className="text-[#c9a84c]">General</span>
                    </h1>
                    <p className="text-[#888] font-barlow-condensed uppercase tracking-widest text-sm">
                        Gestión de Liga y Validaciones
                    </p>
                </header>

                <section className="bg-[#111] p-8 border border-[#2a2a2a]">
                    <SeccionAdminMercado />
                </section>
            </div>
        </main>
    );
}