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
                        <article className="space-y-6 animate-fadeIn">
                            <h2 className="font-bebas text-4xl text-[#c9a84c] italic">Instalación del Parche Oficial</h2>

                            <div className="space-y-6 text-gray-400 leading-relaxed">
                                <p className="uppercase tracking-widest text-xl font-bold text-white/70">
                                    Temporada Actual: <span className="text-[#c9a84c]">PES 6 The Den</span>
                                </p>

                                <div className="space-y-6 max-w-4xl mx-auto">
                                    {/* PASO 01 - DESCARGA MULTIPARTE */}
                                    <div className="flex flex-col md:flex-row items-start gap-6 bg-[#111] p-6 border border-[#222] border-l-4 border-l-[#c9a84c] shadow-xl">
                                        <span className="font-bebas text-6xl text-[#c9a84c] leading-none">01</span>
                                        <div className="flex-1 w-full">
                                            <h3 className="text-white font-bebas text-2xl tracking-wider uppercase mb-1">Descarga del Juego</h3>
                                            <p className="text-gray-400 leading-relaxed">Descarga todas las partes antes de descomprimir.</p>

                                            {/* GRILLA DE BOTONES */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {[
                                                    { label: "Parte 1", url: "https://tinyurl.com/az2wjwv2" },
                                                    { label: "Parte 2", url: "https://tinyurl.com/4fm8w4pc" },
                                                    { label: "Parte 3", url: "https://tinyurl.com/36bpepn3" },
                                                    { label: "Parte 4", url: "https://tinyurl.com/2nambvy5" },
                                                ].map((part, i) => (
                                                    <a
                                                        key={i}
                                                        href={part.url}
                                                        target="_blank"
                                                        className="flex justify-between items-center bg-[#1a1a1a] border border-[#333] px-4 py-3 text-sm font-bold text-gray-300 hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all group"
                                                    >
                                                        <span className="uppercase tracking-widest">{part.label}</span>
                                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* PASO 02 */}
                                    <div className="flex items-start gap-6 bg-[#111] p-6 border border-[#222] shadow-lg">
                                        <span className="font-bebas text-5xl text-[#c9a84c] opacity-50">02</span>
                                        <div>
                                            <h3 className="text-white font-bebas text-2xl tracking-wider uppercase mb-2">Preparación de archivos</h3>
                                            <p className="text-gray-400 leading-relaxed">
                                                Mueve todos los archivos descargados a una <span className="text-white font-bold">nueva carpeta exclusiva</span> para evitar errores de ruta durante la descompresión.
                                            </p>
                                        </div>
                                    </div>

                                    {/* PASO 03 */}
                                    <div className="flex items-start gap-6 bg-[#111] p-6 border border-[#222] shadow-lg">
                                        <span className="font-bebas text-5xl text-[#c9a84c] opacity-50">03</span>
                                        <div>
                                            <h3 className="text-white font-bebas text-2xl tracking-wider uppercase mb-2">Ejecución del instalador</h3>
                                            <p className="text-gray-400 leading-relaxed">
                                                Ejecuta el archivo <code className="bg-red-950/30 text-red-400 px-2 py-0.5 rounded border border-red-900/50">.exe</code>.
                                                Si Windows Defender muestra una advertencia, pulsa en <span className="text-white italic underline underline-offset-4 decoration-[#c9a84c]">Más información</span> y luego <span className="text-white font-bold italic">Ejecutar de todas formas</span>.
                                            </p>
                                        </div>
                                    </div>

                                    {/* PASO 04 - OPTION FILE (DESTACADO) */}
                                    <div className="flex flex-col md:flex-row items-start gap-6 bg-[#111] p-6 border border-[#c9a84c]/30 border-t-4 border-t-[#c9a84c] shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-[#c9a84c] text-black font-black px-3 py-1 text-[15px] uppercase">
                                            obligatorio
                                        </div>
                                        <span className="font-bebas text-6xl text-[#c9a84c] leading-none">04</span>
                                        <div className="flex-1 w-full">
                                            <h3 className="text-white font-bebas text-2xl tracking-wider uppercase mb-2">Option File del Torneo</h3>
                                            <p className="text-gray-400 mb-4">
                                                Contiene los equipos actualizados a la <span className="text-white font-bold">Temporada 2026</span>. Sin esto, no podrás jugar la liga online.
                                            </p>

                                            <a
                                                href="https://www.mediafire.com/file/0eusxnt31bdohyy/KONAMI-WIN32PES6OPT.rar/file"
                                                target="_blank"
                                                className="inline-block w-full text-center bg-[#c9a84c] text-black font-bebas text-xl py-3 px-8 hover:bg-white transition-colors tracking-[2px] mb-4"
                                            >
                                                Descargar OPTION FILE (OF)
                                            </a>

                                            <div className="bg-black/50 p-3 border-l-2 border-gray-600 text-[13px]">
                                                <p className="text-gray-500 uppercase font-bold mb-1 text-[10px] tracking-widest">Ruta de instalación:</p>
                                                <code className="text-gray-300 break-all">Documents \ KONAMI \ PES 6 The Den Patch 29 \ save \ folder1</code>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN DEL CÓDIGO DE INSTALACIÓN */}
                                <div className="bg-[#c9a84c]/10 border-2 border-[#c9a84c] p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-[#c9a84c] text-black font-black px-3 py-1 text-[15px] uppercase">
                                        importante
                                    </div>
                                    <h3 className="font-bebas text-4xl text-white mb-2 tracking-tighter">Código de Instalación & Online</h3>
                                    <p className="text-[16px] text-gray-400 uppercase mb-4 leading-tight">
                                        Este código es necesario para ingresar al modo Online.
                                    </p>
                                    <div onClick={() => {
                                        navigator.clipboard.writeText("M7TUH9FPHH4XV2XWVAU3");
                                        Toast.fire({
                                            icon: 'success',
                                            title: 'SERIAL COPIADO CON ÉXITO'
                                        });// opcional: mostrar un toast "¡Copiado!"
                                    }} className="bg-black p-4 text-center border border-[#c9a84c]/30 group hover:border-[#c9a84c] transition-all cursor-copy">
                                        <code className="font-mono text-[#c9a84c] text-lg md:text-2xl font-bold tracking-widest select-all">
                                            M7TUH9FPHH4XV2XWVAU3
                                        </code>
                                    </div>
                                </div>

                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={() => setActiveTab("online")}
                                        className="group flex items-center gap-2 text-[16px] font-bold uppercase tracking-[3px] text-gray-500 hover:text-[#c9a84c] transition-all"
                                    >
                                        PASO SIGUIENTE: CONFIGURAR ONLINE
                                        <span className="group-hover:translate-x-2 transition-transform">→</span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    )}

                    {/* GUÍA 2: JUGAR ONLINE */}
                    {activeTab === "online" && (
                        <article className="space-y-6 animate-fadeIn">
                            <h2 className="font-bebas text-4xl text-[#c9a84c] italic">Cómo Jugar Online</h2>

                            <div className="space-y-8 text-gray-400 leading-relaxed">

                                {/* PASO 1: REGISTRO */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-[#c9a84c] text-black font-bebas px-2 py-1 text-xl italic">01</span>
                                        <h3 className="text-white font-bold uppercase tracking-widest text-m">Registro en el Servidor</h3>
                                    </div>
                                    <p className="text-m">El primer paso es crear tu cuenta oficial en el servidor de la liga:</p>
                                    <a
                                        href="https://pes6.es/"
                                        target="_blank"
                                        className="inline-block bg-[#111] border border-[#333] px-6 py-2 text-[#c9a84c] font-bold hover:border-[#c9a84c] transition-all"
                                    >
                                        VISITAR PES6.ES
                                    </a>

                                    <div className="mt-4 border border-[#222] p-2 bg-[#050505]">
                                        <Image
                                            src="../img/registro-servidor.png"
                                            alt="Interfaz de Registro Servidor"
                                            className="w-full opacity-80 hover:opacity-100 transition-opacity" width={800} height={600}
                                        />
                                    </div>
                                </div>

                                {/* NOTA IMPORTANTE: CREDENCIALES */}
                                <div className="bg-[#c9a84c]/5 border-l-4 border-[#c9a84c] p-6 space-y-4">
                                    <h4 className="font-bebas text-3xl text-white tracking-tighter uppercase">Datos de tu cuenta</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[16px] uppercase tracking-wider">
                                        <div className="bg-black/40 p-3 border border-white/5">
                                            <p className="text-[#c9a84c] font-bold mb-1">Usuario</p>
                                            <p className="text-gray-300">Usa el mismo Nick con el que te postulaste en esta web (Obligatorio).</p>
                                        </div>
                                        <div className="bg-black/40 p-3 border border-white/5">
                                            <p className="text-[#c9a84c] font-bold mb-1">Contraseña</p>
                                            <p className="text-gray-300">Usa una clave simple. Es la que escribirás con el joystick dentro del juego.</p>
                                        </div>
                                        <div className="bg-black/40 p-3 border border-white/5">
                                            <p className="text-[#c9a84c] font-bold mb-1">PES 6 Serial</p>
                                            <p className="text-gray-300 italic">M7TUH9FPHH4XV2XWVAU3 (Sin guiones)</p>
                                        </div>
                                        <div className="bg-black/40 p-3 border border-white/5">
                                            <p className="text-[#c9a84c] font-bold mb-1">Validación</p>
                                            <p className="text-red-400 font-bold">REVISÁ TU MAIL. Debes validar la cuenta para poder entrar.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PASO 2: ARCHIVO HOSTS */}
                                <div className="space-y-4 ">
                                    <div className="flex items-center gap-3 ">
                                        <span className="bg-[#c9a84c] text-black font-bebas px-2 py-1 text-xl italic">02</span>
                                        <h3 className="text-white font-bold uppercase tracking-widest text-xl">Configuración de Conexión</h3>
                                    </div>
                                    <p className="text-xl">Para redireccionar el juego al servidor correcto, descarga y reemplaza tu archivo hosts:</p>

                                    <a
                                        href="https://drive.google.com/file/d/1d8UzhojB1995v67PCBXWQH5AO8ISzs0f/view"
                                        target="_blank"
                                        className="flex items-center gap-3 bg-[#111] p-4 border border-dashed border-[#444] hover:border-[#c9a84c] group transition-all"
                                    >
                                        <div className="bg-white/10 p-2 group-hover:bg-[#c9a84c]/20">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-xl uppercase">Descargar Archivo Hosts</p>
                                            <p className="text-[15px] text-gray-500 italic uppercase">Servidor Oficial Del Torneo</p>
                                        </div>
                                    </a>

                                    <div className="bg-black p-4 border border-[#222]">
                                        <p className="text-[16px] text-gray-500 uppercase font-bold mb-2">Ruta de instalación:</p>
                                        <code className="text-[#c9a84c] text-xl break-all">C:\Windows\System32\drivers\etc</code>
                                    </div>
                                </div>

                                {/* PASO FINAL */}
                                <div className="pt-6 text-center">
                                    <div className="inline-block border-2 border-[#27ae60] px-8 py-3 bg-[#27ae60]/10">
                                        <p className="font-bebas text-3xl text-[#27ae60] italic tracking-tighter">¡LISTO PARA EL ONLINE!</p>
                                        <p className="text-[10px] text-white uppercase tracking-[2px]">Iniciá el juego, ve a RED e ingresá tus datos.</p>
                                    </div>
                                </div>

                            </div>
                        </article>
                    )}

                    {/* GUÍA 3: GESTIÓN DE FECHAS */}
                    {activeTab === "gestion" && (
                        <article className="space-y-8">
                            <div>
                                <h2 className="font-bebas text-4xl text-[#c9a84c] italic mb-4">Gestión de Jornadas (Tutorial DT)</h2>
                                <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest italic">Seguí estos pasos para mantener la liga organizada y evitar quita de puntos.</p>

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* PASO 1: HORARIOS */}
                                    <div className="bg-[#151515] p-6 border border-[#222] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 bg-[#c9a84c] text-black font-bebas text-s">PASO 01</div>
                                        <h3 className="font-bebas text-2xl text-white mb-2 uppercase italic">Cargar Disponibilidad</h3>
                                        <p className="text-gray-300 text-[18px] mb-4">
                                            Dentro de la sección <strong>Fixture</strong>, seleccioná la fecha actual y buscá el recuadro dorado.
                                        </p>
                                        <ul className="text-[13px] text-[#c9a84c] space-y-1 uppercase font-bold">
                                            <li>• Sé específico (Ej: Lunes a Jueves de 20 a 22hs).</li>
                                            <li>• El rival usará esto para contactarte por privado.</li>
                                            <li>• Si no cargás horario, perdés el derecho a reclamo.</li>
                                        </ul>
                                    </div>

                                    {/* PASO 2: REPORTE */}
                                    <div className="bg-[#151515] p-6 border border-[#222] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 bg-[#c9a84c] text-black font-bebas text-s">PASO 02</div>
                                        <h3 className="font-bebas text-2xl text-white mb-2 uppercase italic"> Subir Reporte Oficial</h3>
                                        <p className="text-gray-300 text-[18px] mb-4">
                                            Una vez jugado el partido, el <strong>ganador</strong> (o el local en caso de empate) debe informar el resultado.
                                        </p>
                                        <div className="bg-black/50 p-3 rounded border border-white/5">
                                            <p className="text-[15px] text-gray-300 uppercase mb-2 italic">Capturas obligatorias:</p>
                                            <div className="flex gap-2">
                                                <span className="bg-[#222] px-2 py-1 text-[12px] text-white">1. Resultado</span>
                                                <span className="bg-[#222] px-2 py-1 text-[12px] text-white">2. Estadísticas</span>
                                                <span className="bg-[#222] px-2 py-1 text-[12px] text-white">3. Fair Play</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* NOTA SOBRE EL CHAT PRIVADO */}
                            <div className="bg-[#c9a84c]/5 border-l-4 border-[#c9a84c] p-6">
                                <h4 className="font-bebas text-[25px] uppercase text-[#c9a84c] mb-1">Coordinación por Mensajería</h4>
                                <p className="text-gray-300 text-x">
                                    Usá el sistema de <strong>Mensajes Privados</strong> en la pestaña Comunidad para hablar con tu rival. No se aceptarán capturas de WhatsApp externo como prueba de No presentación si no hubo contacto previo en la plataforma oficial.
                                </p>
                            </div>

                            {/* SOPORTE */}
                            <div className="bg-blue-900/10 border border-blue-500/30 p-6 text-center group hover:bg-blue-900/20 transition-all">
                                <p className="text-blue-400 text-sm italic mb-2">¿Todavía tenés dudas sobre el reglamento o el sistema?</p>
                                <Link href="/soporte" className="bg-blue-600 hover:bg-blue-500 text-white font-bebas px-6 py-2 text-lg italic transition-colors" >Hacé tu consulta en la sección Soporte</Link>
                            </div>
                        </article>
                    )}
                    {activeTab === "despachos" && (
                        <article className="space-y-10">
                            <div className="flex items-center gap-4 border-b border-[#c9a84c]/20 pb-4">
                                <h2 className="font-bebas text-4xl text-[#c9a84c] italic uppercase">El Despacho Oficial</h2>

                            </div>

                            <p className="text-gray-400 text-2xl leading-relaxed italic">
                                El Despacho no es un chat común; es el <span className="text-white font-bold underline decoration-[#c9a84c]">Libro Contable</span> de tu club. Cada mensaje ahí representa una transacción oficial que debe ser validada para impactar en tu presupuesto.
                            </p>

                            <div className="grid md:grid-cols-2 gap-12 items-start">
                                {/* PROTOCOLO */}
                                <div className="space-y-6">
                                    <h4 className="font-bebas text-3xl text-white uppercase tracking-widest border-l-2 border-[#c9a84c] pl-3">Protocolo de Negociación</h4>
                                    <div className="space-y-6">
                                        <div className="flex gap-4 items-start">
                                            <span className="text-[#c9a84c] font-bebas text-3xl leading-none">01.</span>
                                            <p className="text-lg text-gray-400 uppercase tracking-tighter leading-tight">Cierre del acuerdo por privado (Discord/WhatsApp).</p>
                                        </div>
                                        <div className="flex gap-4 items-start">
                                            <span className="text-[#c9a84c] font-bebas text-3xl leading-none">02.</span>
                                            <p className="text-lg text-gray-400 uppercase tracking-tighter leading-tight">El DT debe reportar en <span className="text-white font-bold">SU PROPIO DESPACHO</span>.</p>
                                        </div>
                                        <div className="flex gap-4 items-start">
                                            <span className="text-[#c9a84c] font-bebas text-3xl leading-none">03.</span>
                                            <p className="text-lg text-gray-400 uppercase tracking-tighter leading-tight">Usar el botón <span className="text-white font-bold">+ AÑADIR LÍNEA</span> para montos.</p>
                                        </div>
                                        <div className="flex gap-4 items-start">
                                            <span className="text-[#c9a84c] font-bebas text-3xl leading-none">04.</span>
                                            <p className="text-lg text-gray-400 uppercase tracking-tighter leading-tight text-orange-500 font-bold">El post queda PENDIENTE hasta que el Admin lo procese.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* MANUAL DE MOVIMIENTOS */}
                                <div className="bg-[#111] border border-[#222] p-8 space-y-6 shadow-2xl">
                                    <h4 className="font-bebas text-3xl text-white uppercase italic">Manual de Movimientos</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between border-b border-white/5 pb-3 text-sm">
                                            <span className="text-red-500 font-bold">[ COMPRA ]</span>
                                            <span className="text-gray-300 italic uppercase">Resta de tu caja (-)</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-3 text-sm">
                                            <span className="text-green-500 font-bold">[ VENTA ]</span>
                                            <span className="text-gray-300 italic uppercase">Suma a tu caja (+)</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-3 text-sm">
                                            <span className="text-[#c9a84c] font-bold">[ PATROCINIO ]</span>
                                            <span className="text-gray-300 italic uppercase">Ingreso externo (+)</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 italic uppercase tracking-widest pt-4">
                                        * Intercambios: Detallar jugadores de ambos clubes en el texto libre.
                                    </p>
                                </div>
                            </div>

                            {/* ADVERTENCIA DE RESPONSABILIDAD */}
                            <div className="bg-[#c9a84c]/5 border-l-4 border-[#c9a84c] p-8 space-y-4">
                                <h4 className="font-bebas text-3xl text-white tracking-widest uppercase">Responsabilidad del Mánager</h4>
                                <div className="text-gray-400 text-xl leading-relaxed space-y-4">
                                    <p>Cada reporte enviado tiene valor de <span className="text-white font-bold">Declaración Jurada</span>.</p>
                                    <p className="border-t border-white/10 pt-4">
                                        <strong className="text-red-500 underline uppercase font-black">Importante:</strong> El dinero <span className="text-white underline">NO se mueve solo</span>. El Admin valida cada trato. Intentar engañar al presupuesto resultará en <span className="text-white font-bold">SANCIONES DISCIPLINARIAS</span> graves.
                                    </p>
                                </div>
                            </div>
                        </article>)}
                </div>
            </div>
        </main>
    );
}