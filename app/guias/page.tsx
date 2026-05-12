"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Swal from 'sweetalert2'

const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    iconColor: 'green',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
})

// Componente para los botones de las pestañas
interface TabButtonProps {
    label: string;
    active?: boolean;
    onClick?: () => void;
    href?: string; // Nueva propiedad para redirección
}

function TabButton({ label, active, onClick, href }: TabButtonProps) {
    const className = `px-6 py-4 font-bebas text-xl tracking-widest uppercase transition-all border-b-2 ${active
        ? "text-[#c9a84c] border-[#c9a84c] bg-[#111]"
        : "text-gray-500 border-transparent hover:text-gray-300"
        }`;

    // Si tiene href, se comporta como un Link de Next.js
    if (href) {
        return (
            <Link href={href} className={className}>
                {label}
            </Link>
        );
    }

    // Si no, se comporta como un botón de estado normal
    return (
        <button onClick={onClick} className={className}>
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
                    <TabButton
                        label="Gestión de Despachos"
                        active={activeTab === "despachos"}
                        onClick={() => setActiveTab("despachos")}
                    />
                    {/* NUEVA PESTAÑA DE SOPORTE */}
                    <TabButton
                        label="Soporte Técnico"
                        href="/soporte"
                        active={false}
                    />
                </nav>

                {/* CONTENIDO DINÁMICO */}
                <div className="bg-[#0f0f0f] border border-[#222] p-8 md:p-12 shadow-2xl animate-fadeIn">

                    {/* GUÍA 1: INSTALACIÓN */}
                    {activeTab === "instalacion" && (
                        <article className="max-w-4xl mx-auto space-y-12 animate-fadeIn font-barlow-condensed pb-20">

                            {/* CABECERA DE SECCIÓN */}
                            <div className="border-b border-white/10 pb-8">
                                <h2 className="font-bebas text-6xl text-white italic tracking-tighter uppercase leading-none">
                                    Instalación <span className="text-[#c9a84c]">All-In-One</span>
                                </h2>
                                <p className="text-gray-400 text-lg uppercase tracking-[4px] mt-3 font-bold">
                                    Versión Actual: <span className="text-[#c9a84c]">PES 6 PHOENIX 2025-2026</span>
                                </p>
                            </div>

                            <div className="space-y-8">

                                {/* PASO 01 - DESCARGA ÚNICA */}
                                <div className="relative group bg-[#111] border border-white/5 p-10 overflow-hidden transition-all hover:border-[#c9a84c]/50">
                                    <div className="absolute top-0 right-0 bg-[#c9a84c] text-black font-bebas text-2xl px-6 py-2 skew-x-[-15deg] translate-x-2">
                                        <span className="inline-block skew-x-[15deg]">DIRECTO</span>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-10 items-center">
                                        <div className="font-bebas text-9xl text-white/5 leading-none select-none">01</div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-bebas text-4xl tracking-widest uppercase mb-3">Descarga del Pack Completo</h3>
                                            <p className="text-gray-300 text-xl mb-8 italic leading-relaxed">
                                                Hemos unificado el Juego, el Parche Phoenix y el Option File en un solo archivo <span className="text-white font-bold">.RAR</span> para facilitar la instalación.
                                            </p>

                                            <a
                                                href="https://drive.google.com/drive/u/0/folders/1qy3cDfxrjY9uQ5-NxedHG72Rr_09StbJ"
                                                target="_blank"
                                                className="inline-block w-full md:w-auto bg-[#c9a84c] text-black font-bebas text-3xl py-4 px-14 hover:bg-white transition-all skew-x-[-15deg] text-center"
                                            >
                                                <span className="inline-block skew-x-[15deg] tracking-wider font-black">IR AL DRIVE DE DESCARGA</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* PASO 02 - EXTRACCIÓN */}
                                <div className="flex items-start gap-8 bg-white/[0.02] border border-white/5 p-8 italic hover:bg-white/[0.05] transition-colors">
                                    <span className="font-bebas text-5xl text-[#c9a84c]">02</span>
                                    <div>
                                        <h4 className="text-white font-bebas text-2xl tracking-widest uppercase mb-2">Descompresión</h4>
                                        <p className="text-gray-400 text-lg leading-relaxed">
                                            Extrae el contenido en una carpeta de fácil acceso. Se recomienda <span className="text-white font-bold">desactivar el antivirus</span> temporalmente para evitar que borre el ejecutable del parche.
                                        </p>
                                    </div>
                                </div>

                                {/* PASO 03 - OPTION FILE */}
                                <div className="flex flex-col md:flex-row items-start gap-8 bg-white/[0.02] border border-white/5 p-10 relative group">
                                    <div className="absolute top-0 right-0 bg-blue-600 text-white font-bold px-4 py-1 text-xs uppercase tracking-widest">
                                        Configuración OF
                                    </div>
                                    <span className="font-bebas text-7xl text-[#c9a84c]">03</span>
                                    <div className="flex-1">
                                        <h3 className="text-white font-bebas text-4xl tracking-widest uppercase mb-3">Sincronización de Datos</h3>
                                        <p className="text-gray-400 text-xl mb-6 italic leading-relaxed">
                                            El archivo <span className="text-[#c9a84c] font-bold">KONAMI-WIN32PES6OPT</span> incluido en la descarga debe estar ubicado en la siguiente ruta interna:
                                        </p>

                                        <div className="bg-black p-6 border-l-4 border-[#c9a84c] group-hover:bg-[#050505] transition-all">
                                            <p className="text-xs text-[#c9a84c] font-bold uppercase mb-3 tracking-[3px]">Ubicación del save:</p>
                                            <code className="text-gray-200 text-base md:text-xl break-all font-mono font-bold">
                                                PES6 Phoenix 2025-2026 \ My Document \ save \ folder1
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                {/* CÓDIGO DE INSTALACIÓN */}
                                <div className="relative overflow-hidden bg-black border-2 border-[#c9a84c] p-10 skew-x-[-2deg]">
                                    <div className="skew-x-[2deg] relative z-10">
                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="h-px bg-[#c9a84c] flex-1 opacity-50"></div>
                                            <h3 className="font-bebas text-5xl text-white tracking-tighter uppercase italic">Serial del juego & Online</h3>
                                            <div className="h-px bg-[#c9a84c] flex-1 opacity-50"></div>
                                        </div>

                                        <p className="text-center text-gray-400 text-sm uppercase tracking-[4px] mb-8 font-bold">
                                            Copia este serial para el juego y registro online
                                        </p>

                                        <div
                                            onClick={() => {
                                                navigator.clipboard.writeText("M7TUH9FPHH4XV2XWVAU3");
                                                Toast.fire({

                                                    icon: 'success',

                                                    title: 'SERIAL COPIADO CON ÉXITO'

                                                });
                                            }}
                                            className="bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-8 text-center cursor-copy group hover:bg-[#c9a84c]/10 transition-all"
                                        >
                                            <code className="font-mono text-[#c9a84c] text-4xl md:text-5xl font-black tracking-[12px] select-all">
                                                M7TUH9FPHH4XV2XWVAU3
                                            </code>
                                        </div>

                                        <p className="text-center text-xs text-gray-600 uppercase mt-6 italic font-bold tracking-[2px]">
                                            Click sobre el código para copiar al portapapeles
                                        </p>
                                    </div>
                                </div>

                                {/* NAVEGACIÓN */}
                                <div className="flex justify-center pt-10">
                                    <button
                                        onClick={() => setActiveTab("online")}
                                        className="group flex items-center gap-6 text-2xl font-bebas italic tracking-[4px] text-gray-500 hover:text-white transition-all"
                                    >
                                        PASO SIGUIENTE: CONFIGURAR ONLINE
                                        <span className="bg-white/5 p-3 rounded-full group-hover:bg-[#c9a84c] group-hover:text-black transition-all">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    )}
                    {/* GUÍA 2: JUGAR ONLINE */}
                    {activeTab === "online" && (
                        <article className="max-w-4xl mx-auto space-y-12 animate-fadeIn font-barlow-condensed pb-20">

                            {/* TÍTULO DE SECCIÓN */}
                            <div className="border-b border-white/10 pb-6">
                                <h2 className="font-bebas text-6xl text-white italic tracking-tighter uppercase leading-none">
                                    Conexión <span className="text-[#c9a84c]">Online</span>
                                </h2>
                                <p className="text-gray-400 text-lg uppercase tracking-[4px] mt-2 font-bold">
                                    Configuración del Servidor PES6.ES
                                </p>
                            </div>

                            <div className="space-y-10">

                                {/* PASO 01: REGISTRO */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="bg-[#c9a84c] text-black font-bebas px-4 py-1 text-3xl italic skew-x-[-15deg]">
                                            <span className="inline-block skew-x-[15deg]">01</span>
                                        </span>
                                        <h3 className="text-white font-bebas text-4xl tracking-widest uppercase">Registro en el Servidor</h3>
                                    </div>

                                    <p className="text-gray-300 text-xl italic leading-relaxed">
                                        Crea tu cuenta oficial. Este paso es <span className="text-white font-bold">obligatorio</span> para poder loguearte dentro del juego.
                                    </p>

                                    <a
                                        href="https://pes6.es/"
                                        target="_blank"
                                        className="inline-block bg-[#111] border-2 border-[#333] px-10 py-4 text-[#c9a84c] font-bebas text-2xl hover:border-[#c9a84c] hover:bg-white/5 transition-all skew-x-[-15deg]"
                                    >
                                        <span className="inline-block skew-x-[15deg] tracking-widest">VISITAR PES6.ES</span>
                                    </a>

                                    <div className="mt-6 border-2 border-white/5 p-2 bg-black shadow-2xl overflow-hidden group">
                                        <Image
                                            src="/img/registro-servidor.png"
                                            alt="Interfaz de Registro Servidor"
                                            className="w-full opacity-60 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
                                            width={800}
                                            height={600}
                                        />
                                    </div>
                                </div>

                                {/* NOTA: CREDENCIALES (DISEÑO TIPO FICHA) */}
                                <div className="bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-8 space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-[#c9a84c] text-black font-bold px-4 py-1 text-xs uppercase tracking-tighter">
                                        Importante
                                    </div>

                                    <h4 className="font-bebas text-4xl text-white tracking-tighter uppercase italic">Credenciales de Acceso</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 uppercase font-bold">
                                        <div className="bg-black/60 p-5 border border-white/5 group hover:border-[#c9a84c]/50 transition-colors">
                                            <p className="text-[#c9a84c] text-sm mb-2 tracking-widest">Usuario</p>
                                            <p className="text-white text-lg leading-tight italic">Usa el mismo Nick de tu postulación.</p>
                                        </div>
                                        <div className="bg-black/60 p-5 border border-white/5 group hover:border-[#c9a84c]/50 transition-colors">
                                            <p className="text-[#c9a84c] text-sm mb-2 tracking-widest">Contraseña</p>
                                            <p className="text-white text-lg leading-tight italic">Clave simple para el joystick.</p>
                                        </div>
                                        <div className="bg-black/60 p-5 border border-white/5 group hover:border-[#c9a84c]/50 transition-colors">
                                            <p className="text-[#c9a84c] text-sm mb-2 tracking-widest">PES 6 Serial</p>
                                            <p className="text-white text-lg leading-tight font-mono tracking-tighter">M7TUH9FPHH4XV2XWVAU3</p>
                                        </div>
                                        <div className="bg-red-600/10 p-5 border border-red-600/30">
                                            <p className="text-red-500 text-sm mb-2 tracking-widest">Validación</p>
                                            <p className="text-white text-lg leading-tight italic">Debes confirmar el Mail de PES6.ES</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PASO 02: ARCHIVO HOSTS */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="bg-[#c9a84c] text-black font-bebas px-4 py-1 text-3xl italic skew-x-[-15deg]">
                                            <span className="inline-block skew-x-[15deg]">02</span>
                                        </span>
                                        <h3 className="text-white font-bebas text-4xl tracking-widest uppercase">Configuración del Host</h3>
                                    </div>

                                    <p className="text-gray-300 text-xl italic leading-relaxed">
                                        Descarga y reemplaza este archivo para que tu PES 6 se conecte directamente a nuestra liga.
                                    </p>

                                    <a
                                        href="https://drive.google.com/file/d/1d8UzhojB1995v67PCBXWQH5AO8ISzs0f/view"
                                        target="_blank"
                                        className="flex items-center gap-6 bg-white/[0.03] p-6 border-2 border-dashed border-white/10 hover:border-[#c9a84c] group transition-all"
                                    >
                                        <div className="bg-[#c9a84c] p-4 group-hover:scale-110 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white font-bebas text-3xl uppercase leading-none mb-1">Descargar Archivo Hosts</p>
                                            <p className="text-lg text-[#c9a84c] italic uppercase font-bold tracking-tighter">Servidor Oficial El Legado</p>
                                        </div>
                                    </a>

                                    <div className="bg-[#050505] p-6 border-l-4 border-white/20 group hover:border-[#c9a84c] transition-all">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-3 tracking-[3px]">Ruta de reemplazo:</p>
                                        <code className="text-gray-200 text-lg md:text-2xl font-mono font-bold break-all">
                                            C:\Windows\System32\drivers\etc
                                        </code>
                                    </div>
                                </div>

                                {/* PASO FINAL: ÉXITO */}
                                <div className="pt-10 flex justify-center">
                                    <div className="relative inline-block border-2 border-[#27ae60] p-1 shadow-[0_0_30px_rgba(39,174,96,0.2)]">
                                        <div className="bg-[#27ae60]/10 border border-[#27ae60] px-12 py-6 text-center">
                                            <p className="font-bebas text-5xl text-[#27ae60] italic tracking-tighter leading-none mb-2">¡TODO LISTO!</p>
                                            <p className="text-sm text-white uppercase tracking-[3px] font-bold">Iniciá el juego {`->`} RED {`->`} Ingresá tus datos.</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </article>
                    )}

                    {/* GUÍA 3: GESTIÓN DE FECHAS */}
                    {activeTab === "gestion" && (
                        <article className="max-w-4xl mx-auto space-y-12 animate-fadeIn font-barlow-condensed pb-20">

                            {/* CABECERA */}
                            <div className="border-b border-white/10 pb-8">
                                <h2 className="font-bebas text-6xl text-white italic tracking-tighter uppercase leading-none">
                                    Gestión de <span className="text-[#c9a84c]">Jornadas</span>
                                </h2>
                                <p className="text-gray-500 text-lg uppercase tracking-[5px] mt-3 font-bold italic">
                                    Protocolo obligatorio para Directores Técnicos
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">

                                {/* PASO 01: DISPONIBILIDAD */}
                                <div className="bg-[#0d0d0d] border border-white/5 p-8 relative overflow-hidden group hover:border-[#c9a84c]/50 transition-all">
                                    <div className="absolute top-0 right-0 bg-[#c9a84c] text-black font-bebas text-2xl px-6 py-1 skew-x-[-15deg] translate-x-2">
                                        <span className="inline-block skew-x-[15deg]">PASO 01</span>
                                    </div>

                                    <h3 className="font-bebas text-4xl text-white mb-4 uppercase italic tracking-tighter">Cargar Horarios</h3>
                                    <p className="text-gray-300 text-xl mb-6 leading-relaxed italic">
                                        Dentro de la sección <strong className="text-white">Fixture</strong>, seleccioná la fecha activa y completá el recuadro dorado de disponibilidad.
                                    </p>

                                    <ul className="text-sm text-[#c9a84c] space-y-3 uppercase font-black tracking-widest border-t border-white/5 pt-6">
                                        <li className="flex gap-2"><span>•</span> <span>Sé específico en los rangos.</span></li>
                                        <li className="flex gap-2"><span>•</span> <span>Vital para el contacto del rival.</span></li>
                                        <li className="flex gap-2 text-red-500"><span>•</span> <span>Sin horario no hay derecho a reclamo.</span></li>
                                    </ul>
                                </div>

                                {/* PASO 02: REPORTE */}
                                <div className="bg-[#0d0d0d] border border-white/5 p-8 relative overflow-hidden group hover:border-[#c9a84c]/50 transition-all">
                                    <div className="absolute top-0 right-0 bg-[#c9a84c] text-black font-bebas text-2xl px-6 py-1 skew-x-[-15deg] translate-x-2">
                                        <span className="inline-block skew-x-[15deg]">PASO 02</span>
                                    </div>

                                    <h3 className="font-bebas text-4xl text-white mb-4 uppercase italic tracking-tighter">Reporte Oficial</h3>
                                    <p className="text-gray-300 text-xl mb-6 leading-relaxed italic">
                                        El <strong className="text-white">ganador</strong> (o local en empate) debe informar el resultado tras finalizar el encuentro.
                                    </p>

                                    <div className="bg-black p-5 border-l-4 border-[#c9a84c]">
                                        <p className="text-xs text-[#c9a84c] uppercase font-black mb-3 tracking-[3px]">Capturas Obligatorias:</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-white/5 border border-white/10 px-3 py-1 text-[11px] text-white font-bold uppercase italic">1. Resultado</span>
                                            <span className="bg-white/5 border border-white/10 px-3 py-1 text-[11px] text-white font-bold uppercase italic">2. Stats</span>
                                            <span className="bg-white/5 border border-white/10 px-3 py-1 text-[11px] text-white font-bold uppercase italic">3. Fair Play</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* NOTA SOBRE EL CHAT (WEBILD STYLE) */}
                            <div className="relative overflow-hidden bg-black border-2 border-[#c9a84c] p-10 skew-x-[-2deg]">
                                <div className="skew-x-[2deg] relative z-10">
                                    <h4 className="font-bebas text-4xl text-[#c9a84c] mb-4 uppercase italic tracking-tighter">Coordinación en Plataforma</h4>
                                    <p className="text-gray-300 text-xl leading-relaxed italic">
                                        Usá el sistema de <strong className="text-white uppercase">Mensajes Privados</strong> de la web para hablar con tu rival.
                                        <span className="block mt-4 text-red-500 font-bold uppercase text-sm tracking-widest">
                                            No se aceptarán capturas de WhatsApp externo como prueba de W.O. si no hubo contacto previo oficial.
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* SOPORTE / CTA FINAL */}
                            <div className="bg-blue-600/5 border border-blue-600/20 p-10 text-center space-y-6">
                                <p className="text-blue-400 text-xl italic font-bold tracking-tight">
                                    ¿Todavía tenés dudas sobre el reglamento técnico o el sistema?
                                </p>
                                <div className="flex justify-center">
                                    <Link href="/soporte" className="bg-blue-600 text-white font-bebas px-12 py-4 text-3xl italic skew-x-[-15deg] hover:bg-white hover:text-blue-600 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                                        <span className="inline-block skew-x-[15deg]">CENTRO DE SOPORTE</span>
                                    </Link>
                                </div>
                            </div>

                        </article>
                    )}
                    {/* GUÍA 4: EL DESPACHO OFICIAL */}
                    {activeTab === "despachos" && (
                        <article className="max-w-4xl mx-auto space-y-12 animate-fadeIn font-barlow-condensed pb-20 italic">

                            {/* CABECERA DE IMPACTO */}
                            <div className="border-b-2 border-[#c9a84c] pb-6">
                                <h2 className="font-bebas text-6xl text-white tracking-tighter uppercase leading-none">
                                    El Despacho <span className="text-[#c9a84c]">Oficial</span>
                                </h2>
                                <p className="text-gray-500 text-lg uppercase tracking-[5px] mt-2 font-bold">
                                    Sistema de Auditoría Financiera
                                </p>
                            </div>

                            <p className="text-gray-300 text-3xl leading-tight">
                                El Despacho no es un chat común; es el <span className="text-white font-bold underline decoration-[#c9a84c] tracking-tighter">Libro Contable</span> de tu club.
                                <span className="block text-xl text-gray-500 mt-2">Cada mensaje es una transacción que debe ser validada para impactar en tu presupuesto.</span>
                            </p>

                            <div className="grid md:grid-cols-2 gap-10 items-start">

                                {/* PROTOCOLO DE NEGOCIACIÓN */}
                                <div className="space-y-8">
                                    <h4 className="font-bebas text-4xl text-white uppercase tracking-tighter border-l-4 border-[#c9a84c] pl-4">
                                        Protocolo de Negociación
                                    </h4>

                                    <div className="space-y-8">
                                        <div className="flex gap-6 items-start group">
                                            <span className="text-[#c9a84c] font-bebas text-5xl leading-none transition-transform group-hover:scale-110">01</span>
                                            <p className="text-xl text-gray-400 uppercase tracking-tighter leading-tight font-bold">
                                                Cierre del acuerdo por privado <span className="text-white">(Discord / WhatsApp)</span>.
                                            </p>
                                        </div>

                                        <div className="flex gap-6 items-start group">
                                            <span className="text-[#c9a84c] font-bebas text-5xl leading-none transition-transform group-hover:scale-110">02</span>
                                            <p className="text-xl text-gray-400 uppercase tracking-tighter leading-tight font-bold">
                                                El DT debe reportar en <span className="text-[#c9a84c]">SU PROPIO DESPACHO</span>.
                                            </p>
                                        </div>

                                        <div className="flex gap-6 items-start group">
                                            <span className="text-[#c9a84c] font-bebas text-5xl leading-none transition-transform group-hover:scale-110">03</span>
                                            <p className="text-xl text-gray-400 uppercase tracking-tighter leading-tight font-bold">
                                                Usar el botón <span className="text-white">+ AÑADIR LÍNEA</span> para montos.
                                            </p>
                                        </div>

                                        <div className="bg-orange-600/10 border border-orange-600/30 p-4 skew-x-[-10deg]">
                                            <div className="skew-x-[10deg] flex gap-4 items-center">
                                                <span className="text-orange-500 font-bebas text-4xl">04</span>
                                                <p className="text-lg text-orange-500 font-black uppercase tracking-tighter leading-none">
                                                    El post queda PENDIENTE hasta que el Admin lo procese.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* MANUAL DE MOVIMIENTOS (CONTABILIDAD) */}
                                <div className="bg-[#0a0a0a] border border-white/5 p-10 space-y-8 shadow-2xl relative">


                                    <h4 className="font-bebas text-4xl text-white uppercase tracking-widest italic border-b border-white/10 pb-2">
                                        Manual de <span className="text-[#c9a84c]">Caja</span>
                                    </h4>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end border-b border-white/5 pb-4 group">
                                            <span className="text-red-600 font-bebas text-3xl tracking-tighter uppercase group-hover:translate-x-2 transition-transform">[ COMPRA ]</span>
                                            <span className="text-gray-500 text-sm uppercase font-bold tracking-widest mb-1">Egresos (-)</span>
                                        </div>

                                        <div className="flex justify-between items-end border-b border-white/5 pb-4 group">
                                            <span className="text-green-500 font-bebas text-3xl tracking-tighter uppercase group-hover:translate-x-2 transition-transform">[ VENTA ]</span>
                                            <span className="text-gray-500 text-sm uppercase font-bold tracking-widest mb-1">Ingresos (+)</span>
                                        </div>

                                        <div className="flex justify-between items-end border-b border-white/5 pb-4 group">
                                            <span className="text-[#c9a84c] font-bebas text-3xl tracking-tighter uppercase group-hover:translate-x-2 transition-transform">[ PATROCINIO ]</span>
                                            <span className="text-gray-500 text-sm uppercase font-bold tracking-widest mb-1">Bonus (+)</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-200 uppercase tracking-[3px] leading-relaxed pt-4">
                                        * Intercambios: Detallar jugadores de ambos clubes involucrados en el campo de texto libre.
                                    </p>
                                </div>
                            </div>

                            {/* ADVERTENCIA DE RESPONSABILIDAD (DISEÑO SKEW) */}
                            <div className="relative overflow-hidden bg-black border-2 border-[#c9a84c] p-10 skew-x-[-2deg]">
                                <div className="skew-x-[2deg] relative z-10">
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="h-[2px] bg-[#c9a84c] flex-1 opacity-30"></div>
                                        <h4 className="font-bebas text-5xl text-white tracking-tighter uppercase italic">Responsabilidad Jurada</h4>
                                        <div className="h-[2px] bg-[#c9a84c] flex-1 opacity-30"></div>
                                    </div>

                                    <div className="text-gray-400 text-2xl leading-snug space-y-6 text-center max-w-3xl mx-auto italic">
                                        <p>Cada reporte enviado tiene valor de <span className="text-white font-bold uppercase tracking-tighter border-b border-[#c9a84c]">Declaración Jurada</span>.</p>

                                        <p className="text-xl">
                                            <strong className="text-red-600 uppercase font-black tracking-[2px]">Alerta:</strong>
                                            El dinero <span className="text-white underline decoration-red-600 underline-offset-4 font-bold">no se mueve solo</span>. El Admin valida cada trato. Intentar engañar al sistema financiero resultará en <span className="text-white font-bold uppercase underline">Sanciones Disciplinarias</span> graves.
                                        </p>
                                    </div>
                                </div>

                                {/* Elemento decorativo de fondo */}
                                <div className="absolute -bottom-10 -right-10 font-bebas text-[150px] text-white/[0.02] select-none rotate-12">
                                    FISCAL
                                </div>
                            </div>

                        </article>
                    )}
                </div>
            </div>
        </main>
    );
}