"use client";
import { useState } from "react";

// Componente para los botones de las pestañas
interface TabButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

function TabButton({ label, active, onClick }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-4 font-bebas text-xl tracking-widest uppercase transition-all border-b-2 ${active
                    ? "text-[#c9a84c] border-[#c9a84c] bg-[#111]"
                    : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
        >
            {label}
        </button>
    );
}

export default function GuiasPage() {
    const [activeTab, setActiveTab] = useState("instalacion");

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-barlow-condensed">
            <div className="max-w-5xl mx-auto space-y-10">

                {/* CABECERA */}
                <div className="border-l-4 border-[#c9a84c] pl-6">
                    <h1 className="font-bebas text-7xl italic tracking-tighter uppercase leading-none">
                        Centro de <span className="text-[#c9a84c]">Ayuda</span>
                    </h1>
                    <p className="text-gray-500 uppercase tracking-[4px] text-sm italic">
                        Manuales Oficiales · El Legado PES 6
                    </p>
                </div>

                {/* NAVEGACIÓN POR PESTAÑAS */}
                <nav className="flex flex-wrap bg-[#050505] border-b border-[#222]">
                    <TabButton
                        label="Instalación Parche"
                        active={activeTab === "instalacion"}
                        onClick={() => setActiveTab("instalacion")}
                    />
                    <TabButton
                        label="Jugar Online"
                        active={activeTab === "online"}
                        onClick={() => setActiveTab("online")}
                    />
                    <TabButton
                        label="Gestión de Fechas"
                        active={activeTab === "gestion"}
                        onClick={() => setActiveTab("gestion")}
                    />
                </nav>

                {/* CONTENIDO DINÁMICO */}
                <div className="bg-[#0f0f0f] border border-[#222] p-8 md:p-12 shadow-2xl animate-fadeIn">

                    {/* GUÍA 1: INSTALACIÓN */}
                    {activeTab === "instalacion" && (
                        <article className="space-y-6">
                            <h2 className="font-bebas text-4xl text-[#c9a84c] italic">Instalación del Parche Oficial</h2>
                            <div className="space-y-4 text-gray-400 leading-relaxed">
                                <p>Para garantizar que todos tengan los mismos uniformes, estadios y plantillas, es obligatorio seguir estos pasos:</p>
                                <ul className="list-decimal list-inside space-y-2 ml-4">
                                    <li>Descargá el <span className="text-white font-bold underline cursor-pointer">Parche Temporada 1</span>.</li>
                                    <li>Descomprimí el contenido en la carpeta raíz de tu PES 6.</li>
                                    <li>Instalá el <span className="text-white">KitServer</span> ejecutando el archivo <code className="bg-black px-1 text-red-400">setup.exe</code>.</li>
                                    <li>Pegá el archivo <code className="bg-black px-1 text-green-400">EDIT6.bin</code> en <code className="text-xs">Documentos/KONAMI/Pro Evolution Soccer 6/save/folder1</code>.</li>
                                </ul>
                                <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 mt-6">
                                    <p className="text-yellow-500 text-sm">⚠️ IMPORTANTE: No modifiques los nombres de los jugadores por tu cuenta o causarás errores de conexión (Crash) con tu rival.</p>
                                </div>
                            </div>
                        </article>
                    )}

                    {/* GUÍA 2: JUGAR ONLINE */}
                    {activeTab === "online" && (
                        <article className="space-y-6">
                            <h2 className="font-bebas text-4xl text-[#c9a84c] italic">Cómo Jugar Online</h2>
                            <div className="space-y-6">
                                <div className="border-l-2 border-[#333] pl-4">
                                    <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">1. Configuración de Red</h3>
                                    <p className="text-gray-400 text-sm">Abrí el archivo <code className="text-white">hosts</code> en tu PC y apuntá la dirección al servidor de la liga.</p>
                                </div>
                                <div className="border-l-2 border-[#333] pl-4">
                                    <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">2. Conexión Radmin VPN</h3>
                                    <p className="text-gray-400 text-sm">Debes estar en la misma red de Radmin que tu rival para que el lobby los detecte.</p>
                                </div>
                                <div className="border-l-2 border-[#333] pl-4">
                                    <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">3. Dentro del Juego</h3>
                                    <p className="text-gray-400 text-sm">Entrá a RED, seleccioná tu perfil y buscá a tu rival en el Salón de Juego acordado.</p>
                                </div>
                            </div>
                        </article>
                    )}

                    {/* GUÍA 3: GESTIÓN DE FECHAS */}
                    {activeTab === "gestion" && (
                        <article className="space-y-8">
                            <div>
                                <h2 className="font-bebas text-4xl text-[#c9a84c] italic mb-4">Gestión de Jornadas (Tutorial DT)</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-[#151515] p-6 border border-[#222]">
                                        <h3 className="font-bebas text-2xl text-white mb-2">Cargar Horarios</h3>
                                        <p className="text-gray-500 text-sm">En el Fixture, usá el recuadro <strong> Mi Disponibilidad  </strong>  para avisar cuándo podés jugar. Esto es obligatorio para evitar sanciones.</p>
                                    </div>
                                    <div className="bg-[#151515] p-6 border border-[#222]">
                                        <h3 className="font-bebas text-2xl text-white mb-2">Subir Reporte</h3>
                                        <p className="text-gray-500 text-sm">Al terminar, el ganador sube el resultado con las 3 capturas reglamentarias. La tabla se actualizará sola.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-blue-900/10 border border-blue-500/30 p-6 text-center">
                                <p className="text-blue-400 text-sm italic">¿Todavía tenés dudas? Consultá en el canal #soporte de nuestro Discord oficial.</p>
                            </div>
                        </article>
                    )}

                </div>
            </div>
        </main>
    );
}