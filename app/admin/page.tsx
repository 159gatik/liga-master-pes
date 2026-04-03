"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// 1. Corregimos el typo en el import y traemos el hook
import { useAuth } from "@/src/lib/hooks/useAuht";

// 2. Importamos los componentes de administración
import SeccionAdminMercado from "../components/SeccionAdminMercado";
import BandejaPostulaciones from "../components/BandejaPostulaciones";

export default function AdminPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Solo actuamos cuando ya terminó de cargar el estado de autenticación
        if (!loading) {
            if (!isAdmin) {
                console.log("Acceso denegado: No eres administrador.");
                router.push("/");
            }
        }
    }, [isAdmin, loading, router]);

    // Pantalla de carga con estilo "El Legado"
    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-[#c9a84c] font-bebas text-2xl tracking-[5px] animate-pulse uppercase">
                Autorizando Acceso de Comisionado...
            </div>
        </div>
    );

    // Si no es admin, bloqueamos el renderizado para evitar destellos de contenido prohibido
    if (!isAdmin) return null;

    return (
        <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* CABECERA DEL PANEL */}
                <div className="border-l-4 border-[#c9a84c] pl-6 mb-10">
                    <h1 className="font-bebas text-6xl text-white tracking-widest uppercase">Panel de Control</h1>
                    <p className="font-barlow-condensed text-[#c9a84c] uppercase tracking-[3px] italic">
                        Gestión Oficial de El Legado · Comisionado
                    </p>
                </div>

                {/* 3. BANDEJA DE POSTULACIONES (Nuevos DTs esperando equipo) */}
                <BandejaPostulaciones />

                {/* 4. SECCIÓN DE MERCADO (Validación de fichajes y traspasos) */}
                <div className="bg-[#111] border border-[#222] p-6 shadow-2xl">
                    <SeccionAdminMercado />
                </div>

                <p className="text-[10px] text-[#444] text-center uppercase tracking-widest">
                    Sistema de Administración de Liga · El Legado PES 6
                </p>
            </div>
        </main>
    );
}