"use client";
import { useState } from "react";
import { useAdmin } from "@/src/lib/hooks/useAdmin";
import SeccionConfirmacion from "../components/SeccionConfirmacion";
import SeccionAdminMercado from "../components/SeccionAdminMercado";
import SeccionReglamentoMercado from "../components/SeccionRegalementoMercado";
import SeccionTraspasos from "../components/SeccionTraspasos";

export default function FichajesPage() {
    const [activeTab, setActiveTab] = useState("traspasos");
    const { isAdmin, loading } = useAdmin(); // Usamos la auth real

    if (loading) return <div className="text-white p-10">Cargando credenciales...</div>;
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

                {/* TAB EXCLUSIVA PARA ADMIN */}
                {!loading && isAdmin && (
                    <TabButton
                        label="Panel Admin"
                        active={activeTab === "admin"}
                        onClick={() => setActiveTab("admin")}
                    />
                )}
            </div>

            {/* CONTENIDO DINÁMICO */}
            <div className="max-w-6xl mx-auto">
                {/* Mostramos un loader discreto si está verificando el rol */}
                {loading && activeTab === "admin" && <p className="text-[#444] animate-pulse">Verificando credenciales...</p>}
                {activeTab === "reglamento" && <SeccionReglamentoMercado />}
                {activeTab === "traspasos" && <SeccionTraspasos />}
                {activeTab === "libres" && <SeccionLibres />}
                {activeTab === "confirmacion" && <SeccionConfirmacion />}

                {/* Renderizado seguro del panel admin */}
                {activeTab === "admin" && isAdmin && <SeccionAdminMercado />}
            </div>
        </main>
    );
}

// Componente para los botones del menú superior
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


function SeccionLibres() {
    return (
        <div className="bg-[#111] border border-[#2a2a2a] overflow-hidden">
            <table className="w-full text-left font-barlow-condensed">
                <thead>
                    <tr className="bg-[#1a1a1a] text-[#888] text-[10px] uppercase tracking-[2px]">
                        <th className="p-4">Jugador</th>
                        <th className="p-4">Posición</th>
                        <th className="p-4">Edad</th>
                        <th className="p-4">Cotización (80%)</th>
                        <th className="p-4 text-center">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                    <tr className="hover:bg-[#ffffff05] transition-colors">
                        <td className="p-4 font-bold text-white uppercase tracking-wider">D. Forlán</td>
                        <td className="p-4 text-[#c9a84c]">DC</td>
                        <td className="p-4">33</td>
                        <td className="p-4">$4.000.000</td>
                        <td className="p-4 text-center">
                            <button className="bg-[#c9a84c] text-black text-[10px] font-bold px-3 py-1 uppercase tracking-tighter hover:bg-white">Fichar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
