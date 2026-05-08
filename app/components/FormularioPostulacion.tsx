"use client";
import { useState, useEffect } from "react";
import { db } from "../../src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import emailjs from '@emailjs/browser';
import { Alert } from "@/src/lib/alerts";

interface FormularioProps {
    equipoPreseleccionado?: string;
    equipoIdPreseleccionado?: string;
    coleccionPostulacion?: string;
    tituloLiga?: string;
}

export default function FormularioPostulacion({
    equipoPreseleccionado = "",
    equipoIdPreseleccionado = "",
    coleccionPostulacion = "postulaciones",
    tituloLiga = "PES 6"
}: FormularioProps) {
    const { user, userData } = useAuth();
    const [enviando, setEnviando] = useState(false);

    // Estado para la validación de identidad
    const [nombreConfirmacion, setNombreConfirmacion] = useState("");
    const [esNombreValido, setEsNombreValido] = useState(true);

    const [formData, setFormData] = useState({
        whatsapp: "",
        discord: "",
        pais: "",
        experiencia: "SI",
        linkSpeedtest: "",
        equipoNombre: equipoPreseleccionado,
        equipoId: equipoIdPreseleccionado,
    });

    // Validar el nombre en tiempo real
    useEffect(() => {
        if (nombreConfirmacion.length > 0 && userData?.nombre) {
            setEsNombreValido(nombreConfirmacion.trim() === userData.nombre.trim());
        } else {
            setEsNombreValido(true);
        }
    }, [nombreConfirmacion, userData?.nombre]);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            equipoNombre: equipoPreseleccionado,
            equipoId: equipoIdPreseleccionado
        }));
    }, [equipoPreseleccionado, equipoIdPreseleccionado]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (nombreConfirmacion.trim() !== userData?.nombre?.trim()) {
            return Alert.fire({ icon: 'warning', title: 'NICK INCORRECTO', text: 'Escribe tu Nick exactamente como figura en tu cuenta.' });
        }

        if (!user?.uid) return;
        setEnviando(true);

        try {
            // 1. GUARDAR EN FIREBASE (Lo más importante)
            const nuevaPostulacion = {
                uid: user.uid,
                nombre: userData.nombre,
                equipoNombre: formData.equipoNombre,
                equipoId: formData.equipoId,
                discord: formData.discord,
                whatsapp: formData.whatsapp,
                pais: formData.pais,
                speedtestUrl: formData.linkSpeedtest,
                experiencia: formData.experiencia,
                fecha: serverTimestamp(),
                juego: "pes6"
            };

            // Esperamos a que Firebase termine
            await addDoc(collection(db, coleccionPostulacion), nuevaPostulacion);

            // 2. INTENTO DE MAIL (Si falla, no avisamos al usuario para no asustarlo)
            try {
                await emailjs.send(
                    'service_nb187ge',
                    'template_rxcjm7t',
                    {
                        from_name: userData.nombre,
                        equipo_nombre: formData.equipoNombre,
                        whatsapp: formData.whatsapp,
                        discord_user: formData.discord,
                        speedtest: formData.linkSpeedtest
                    },
                    'qK8p-VpJF5iDs8kPJ'
                );
            } catch (mailErr) {
                console.warn("EmailJS falló, pero el DT ya está en Firebase:", mailErr);
            }

            // 3. ÉXITO (Mostramos el éxito porque Firebase ya tiene los datos)
            Alert.fire({
                icon: 'success',
                title: '¡POSTULACIÓN ENVIADA!',
                text: 'Tu solicitud ya está en la base de datos de El Legado.',
            }).then(() => {
                window.location.reload();
            });

        } catch (error: any) {
            console.error("Error real de Firebase:", error);
            Alert.fire({
                icon: 'error',
                title: 'ERROR CRÍTICO',
                text: 'No se pudo guardar en la base de datos.',
            });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <section className="max-w-2xl mx-auto bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#c9a84c] p-8 shadow-2xl animate-in fade-in duration-500">
            <div className="mb-8 border-b border-white/5 pb-6 text-center">
                <p className="text-[10px] tracking-[4px] text-[#c9a84c] uppercase font-bold italic mb-1">Inscripción Oficial</p>
                <h2 className="font-bebas text-5xl text-white italic tracking-widest">{userData?.nombre || "..."}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 font-barlow-condensed">

                {/* VALIDACIÓN DE NICK */}
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] tracking-[2px] text-[#c9a84c] uppercase font-bold">1. Confirma tu Nick de Usuario</label>
                    <input
                        type="text"
                        required
                        value={nombreConfirmacion}
                        className={`bg-[#1a1a1a] border p-3 outline-none transition-all text-white ${esNombreValido ? 'border-[#333] focus:border-[#c9a84c]' : 'border-red-600'}`}
                        placeholder="Escribe tu Nick aquí..."
                        onChange={(e) => setNombreConfirmacion(e.target.value)}
                    />
                    {!esNombreValido && <span className="text-red-500 text-[10px] uppercase font-bold italic">El nombre debe ser idéntico al de tu cuenta</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* WHATSAPP */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] tracking-[2px] text-[#888] uppercase font-bold">2. Número de WhatsApp</label>
                        <input
                            type="tel"
                            required
                            placeholder="+54 9 11 ..."
                            className="bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        />
                    </div>
                    {/* DISCORD */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] tracking-[2px] text-[#888] uppercase font-bold">3. Usuario de Discord</label>
                        <input
                            type="text"
                            required
                            placeholder="usuario#1234"
                            className="bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PAIS */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] tracking-[2px] text-[#888] uppercase font-bold">4. País</label>
                        <input
                            type="text"
                            required
                            className="bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                        />
                    </div>
                    {/* EXPERIENCIA */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] tracking-[2px] text-[#888] uppercase font-bold">5. ¿Experiencia Online?</label>
                        <select
                            className="bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] uppercase"
                            onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                            value={formData.experiencia}
                        >
                            <option value="SI">Sí, he jugado ligas</option>
                            <option value="NO">No, soy nuevo</option>
                        </select>
                    </div>
                </div>

                {/* SPEEDTEST - SECCIÓN DESTACADA */}
                <div className="bg-black/40 border-l-4 border-[#c9a84c] p-6 space-y-3">
                    <label className="text-[14px] tracking-[3px] text-[#c9a84c] uppercase font-bold italic flex items-center gap-2">
                        Link de Speedtest (Obligatorio)
                    </label>
                    <p className="text-[12px] text-gray-500 uppercase leading-relaxed">
                        Entrá a <a href="https://www.speedtest.net" target="_blank" className="text-white underline hover:text-[#c9a84c]">Speedtest.net</a>, realizá el test y pegá el link del resultado.
                    </p>
                    <input
                        type="url"
                        required
                        placeholder="https://www.speedtest.net/result/..."
                        className="w-full bg-[#111] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] text-sm"
                        onChange={(e) => setFormData({ ...formData, linkSpeedtest: e.target.value })}
                    />
                </div>

                {/* EQUIPO SELECCIONADO (VISTA PREVIA) */}
                <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 p-4 flex justify-between items-center">
                    <span className="text-[10px] text-[#c9a84c] font-bold uppercase tracking-[2px]">Club Solicitado:</span>
                    <span className="font-bebas text-2xl text-white italic tracking-wider uppercase">{formData.equipoNombre || "Ninguno seleccionado"}</span>
                </div>

                <button
                    type="submit"
                    disabled={enviando || !esNombreValido || nombreConfirmacion === ""}
                    className={`w-full font-bebas text-4xl py-4 mt-6 tracking-[5px] uppercase transition-all ${(enviando || !esNombreValido || nombreConfirmacion === "")
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-40"
                        : "bg-[#c9a84c] text-black hover:bg-white hover:scale-[1.02] shadow-[0_10px_30px_rgba(201,168,76,0.2)]"}`}
                >
                    {enviando ? "Procesando..." : "Enviar Postulación"}
                </button>
            </form>
        </section>
    );
}