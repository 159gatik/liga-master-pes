"use client";
import { useState } from "react";
import ContenedorLiga from "../../components/ContenedorLiga";
import ContenedorCopa from "../../components/ContenedorCopa";

export default function FixturePes2013() {
    const [activeTab, setActiveTab] = useState<'liga' | 'copa'>('liga');

    return (
        <main className="min-h-screen bg-[#0a1628] p-6 text-white">
            <div className="flex justify-center gap-8 mb-10">
                <button
                    onClick={() => setActiveTab('liga')}
                    className="font-bebas text-3xl transition-all"
                    style={{ color: activeTab === 'liga' ? '#00aaff' : '#333' }}
                >
                    LIGA
                </button>
                <button
                    onClick={() => setActiveTab('copa')}
                    className="font-bebas text-3xl transition-all"
                    style={{ color: activeTab === 'copa' ? '#00aaff' : '#333' }}
                >
                    COPA
                </button>
            </div>

            <div className="max-w-6xl mx-auto">
                {activeTab === 'liga' ? (
                    <ContenedorLiga
                        colEquipos="pes2013_equipos"
                        colPartidos="pes2013_partidos"
                        colReportes="pes2013_reportes"
                        colDisponibilidad="pes2013_disponibilidad"
                        colTorneo="pes2013_configuracion"
                        acento="#00aaff"
                        temporada="Temporada 1 · PES 2013"
                    />
                ) : (
                    <ContenedorCopa
                        colEquipos="pes2013_equipos"
                        colPartidos="pes2013_partidos_copa"
                        colReportes="pes2013_reportes_copa"
                        acento="#00aaff"
                        temporada="Temporada 1 · PES 2013"
                    />
                )}
            </div>
        </main>
    );
}