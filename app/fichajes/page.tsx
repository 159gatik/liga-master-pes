"use client";
import { useState } from "react";
import SeccionConfirmacion from "../components/SeccionConfirmacion";

export default function FichajesPage() {
    const [activeTab, setActiveTab] = useState("traspasos");

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
            </div>

            {/* CONTENIDO DINÁMICO */}
            <div className="max-w-6xl mx-auto">
                {activeTab === "traspasos" && <SeccionTraspasos />}
                {activeTab === "libres" && <SeccionLibres />}
                {activeTab === "confirmacion" && <SeccionConfirmacion />}
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

function SeccionTraspasos() {
    return (
        <div className="grid gap-4">
            <h3 className="font-barlow-condensed text-[#888] uppercase tracking-[3px] mb-4 text-sm">Últimos movimientos entre clubes</h3>
            {/* Ejemplo de Fila de Traspaso */}
            <div className="bg-[#111] border border-[#2a2a2a] p-4 flex items-center justify-between group hover:border-[#c9a84c] transition-colors">
                <div className="flex flex-col">
                    <span className="text-white font-bold text-lg uppercase tracking-wider">Cristiano Ronaldo</span>
                    <span className="text-[10px] text-[#c9a84c] tracking-[2px] uppercase">Delantero (DC)</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="block text-[10px] text-[#444] uppercase">Origen</span>
                        <span className="text-sm font-barlow-condensed">Real Madrid</span>
                    </div>
                    <span className="text-[#c9a84c] font-bebas text-2xl">→</span>
                    <div className="text-left">
                        <span className="block text-[10px] text-[#444] uppercase">Destino</span>
                        <span className="text-sm font-barlow-condensed">Inter de Milán</span>
                    </div>
                </div>
                <div className="font-bebas text-2xl text-[#27ae60]">$15.000.000</div>
            </div>
        </div>
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
