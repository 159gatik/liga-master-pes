"use client";
import { useState } from "react";
import { useAuth } from "@/src/lib/hooks/useAuht"; // Ruta unificada
import Link from "next/link";
// Ya no necesitamos useAdmin aquí
import SeccionConfirmacion from "../components/SeccionConfirmacion";
import SeccionAdminMercado from "../components/SeccionAdminMercado";
import SeccionReglamentoMercado from "../components/SeccionRegalementoMercado";
import SeccionTraspasos from "../components/SeccionTraspasos";
import SeccionLibres from "../components/SeccionLibres";

export default function FichajesPage() {
    const [activeTab, setActiveTab] = useState("reglamento");

    // Extraemos todo de useAuth. isAdmin ahora viene de aquí.
    const { user, userData, isAdmin, loading } = useAuth();

    // 1. ESTADO DE CARGA UNIFICADO
    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-[#c9a84c] font-bebas text-2xl animate-pulse tracking-widest">
                VERIFICANDO CREDENCIALES...
            </div>
        </div>
    );

    // 2. PROTECCIÓN: USUARIO NO REGISTRADO (Público general)
    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
                <h2 className="font-bebas text-5xl text-white mb-4 italic uppercase">Contenido Restringido</h2>
                <p className="font-barlow-condensed text-[#555] uppercase tracking-[3px] mb-8 max-w-md">
                    Debes formar parte de la liga para acceder al mercado de pases y ver los movimientos oficiales.
                </p>
                <Link href="/register" className="bg-[#c9a84c] text-black px-10 py-4 font-bebas text-2xl uppercase tracking-widest hover:bg-white transition-all shadow-lg">
                    Registrarse en la Liga
                </Link>
            </div>
        );
    }
    return (

        <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] font-sans p-6 md:p-10">
            {/* HEADER */}
            <div className="max-w-6xl mx-auto mb-10 border-l-4 border-[#c9a84c] pl-5 flex flex-col md:flex-row md:items-baseline gap-4">
                <h1 className="font-bebas text-5xl md:text-7xl tracking-[5px] uppercase text-white">Mercado</h1>
                <span className="font-barlow-condensed text-sm tracking-[3px] text-[#c9a84c] uppercase italic">
                    Temporada I · Periodo de Traspasos Abierto
                </span>
            </div>

            {/* NAVEGACIÓN DE SECCIONES (TABS) */}
            <div className="max-w-6xl mx-auto flex flex-wrap border-b border-[#2a2a2a] mb-10">
                <TabButton
                    label="Reglamento"
                    active={activeTab === "reglamento"}
                    onClick={() => setActiveTab("reglamento")}
                />
                <TabButton
                    label="Traspasos"
                    active={activeTab === "traspasos"}
                    onClick={() => setActiveTab("traspasos")}
                />

                {/* ACCESO PARA DTs O ADMINS */}
                {(userData?.rol === "dt" || isAdmin) ? (
                    <>
                        <TabButton
                            label="Jugadores Libres"
                            active={activeTab === "libres"}
                            onClick={() => setActiveTab("libres")}
                        />
                        <TabButton
                            label="Confirmación"
                            active={activeTab === "confirmacion"}
                            onClick={() => setActiveTab("confirmacion")}
                        />
                    </>
                ) : (
                    <div className="flex items-center px-4">
                        <span className="text-[10px] text-[#333] uppercase font-bold tracking-widest border border-[#222] px-2 py-1">
                            Acceso DT Requerido
                        </span>
                    </div>
                )}

                {/* TAB EXCLUSIVA DE ADMIN */}
                {isAdmin && (
                    <TabButton
                        label="Panel Admin"
                        active={activeTab === "admin"}
                        onClick={() => setActiveTab("admin")}
                    />
                )}
            </div>

            {/* CONTENIDO DINÁMICO */}
            <div className="max-w-6xl mx-auto">
                {activeTab === "reglamento" && <SeccionReglamentoMercado />}
                {activeTab === "traspasos" && <SeccionTraspasos />}

                {/* Renderizado de secciones protegidas */}
                {activeTab === "libres" && (userData?.rol === "dt" || isAdmin) && <SeccionLibres />}
                {activeTab === "confirmacion" && (userData?.rol === "dt" || isAdmin) && <SeccionConfirmacion />}
                {activeTab === "admin" && isAdmin && <SeccionAdminMercado />}

                {/* Mensaje de bloqueo para usuarios invitados (sin equipo) */}
                {(activeTab === "libres" || activeTab === "confirmacion") && userData?.rol === "invitado" && !isAdmin && (
                    <div className="py-20 text-center border border-[#1a1a1a] bg-[#050505] animate-fade-in">
                        <p className="text-[#c9a84c] font-bebas text-3xl mb-2">ACCESO DENEGADO</p>
                        <p className="text-[#555] font-barlow-condensed uppercase tracking-widest text-sm">
                            Tu cuenta aún no tiene un equipo asignado para realizar operaciones.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}

function TabButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {

    return (
        <button
            onClick={onClick}
            className={`font-bebas text-xl md:text-2xl tracking-[3px] px-8 py-4 transition-all uppercase ${active
                ? "text-[#c9a84c] border-b-4 border-[#c9a84c] bg-[#111]"
                : "text-[#444] hover:text-[#888]"
                }`}
        >
            {label}
        </button>
    );
}